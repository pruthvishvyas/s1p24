import { getAssetFromKV } from "@cloudflare/kv-asset-handler";
import manifestJSON from "__STATIC_CONTENT_MANIFEST";

const assetManifest = JSON.parse(manifestJSON);
const PROJECT = "Weekly Freight & Logistics Operations";

const CORS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Mcp-Protocol-Version, Mcp-Session-Id"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), { status, headers: CORS });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
    if (url.pathname === "/api") return handleForecast(request, env, ctx);
    if (url.pathname === "/mcp" || url.pathname.startsWith("/mcp/")) return handleMCP(request, env, ctx, url);
    return serveAsset(request, env, ctx);
  }
};

// ---- static assets with SPA fallback ----
async function serveAsset(request, env, ctx) {
  const opts = { ASSET_NAMESPACE: env.__STATIC_CONTENT, ASSET_MANIFEST: assetManifest };
  try {
    return await getAssetFromKV({ request, waitUntil: ctx.waitUntil.bind(ctx) }, {
      ...opts,
      mapRequestToAsset: (req) => {
        const u = new URL(req.url);
        if (!u.pathname.includes(".")) {
          u.pathname = "/index.html";
          return new Request(u.toString(), req);
        }
        return req;
      }
    });
  } catch (e) {
    const u = new URL(request.url);
    if (u.pathname.includes(".")) return new Response("Not found", { status: 404 });
    try {
      u.pathname = "/index.html";
      const res = await getAssetFromKV({ request: new Request(u.toString(), request), waitUntil: ctx.waitUntil.bind(ctx) }, opts);
      return new Response(res.body, { status: 200, headers: res.headers });
    } catch (e2) {
      return new Response("Not found", { status: 404 });
    }
  }
}

// ---- read a deployed static JSON file without a network hop ----
async function readJSON(path, request, env, ctx) {
  try {
    const u = new URL(request.url);
    u.pathname = path;
    u.search = "";
    const res = await getAssetFromKV(
      { request: new Request(u.toString(), { method: "GET" }), waitUntil: ctx.waitUntil.bind(ctx) },
      { ASSET_NAMESPACE: env.__STATIC_CONTENT, ASSET_MANIFEST: assetManifest }
    );
    return JSON.parse(await res.text());
  } catch (e) {
    return null;
  }
}
const isPlaceholder = (d) => d && typeof d === "object" && !Array.isArray(d) && "status" in d && "reason" in d && Object.keys(d).length === 2;
const getContract = (request, env, ctx) => readJSON("/data/meta/contract.json", request, env, ctx);

// ---- /api : forecast look-up (weeks ahead) from the deployed forecast.json ----
async function handleForecast(request, env, ctx) {
  if (request.method !== "POST") return json({ error: "Use POST /api with { input: weeksAhead, metric }." }, 405);
  try {
    const body = await request.json().catch(() => ({}));
    const n = Number(body.input);
    if (!Number.isFinite(n)) return json({ error: "Invalid input value. Must be a number (weeks ahead)." }, 400);
    const contract = await getContract(request, env, ctx);
    const fc = contract ? await readJSON("/data/" + contract.outcomes.monitor.forecast, request, env, ctx) : null;
    if (!fc || isPlaceholder(fc) || !fc.series) return json({ error: "Forecast data not available. Run the pipeline, export, then redeploy." }, 503);
    const metric = body.metric && fc.series[body.metric] ? body.metric : Object.keys(fc.series)[0];
    const rows = fc.series[metric] || [];
    if (!rows.length) return json({ error: "Forecast series is empty." }, 503);
    const idx = Math.min(Math.max(Math.round(n), 1), rows.length) - 1;
    const r = rows[idx];
    return json({ prediction: r.forecast, confidence: 0.8, range_low: r.lower_80, range_high: r.upper_80,
                  input_received: n, nearest_key: idx + 1, week: r.week, metric }, 200);
  } catch (e) {
    return json({ error: "Forecast error: " + e.message }, 500);
  }
}

// ---- /mcp : read-only tools for Claude (JSON-RPC 2.0 MCP + simple {tool} calls) ----
const NO_ARGS = { type: "object", properties: {}, required: [] };
const TOOLS = [
  { name: "get_kpis", description: "Get all current KPI values for " + PROJECT, inputSchema: NO_ARGS, path: (c) => c.outcomes.understand.kpis },
  { name: "get_insights", description: "Get business insights ranked by severity (HIGH/MEDIUM/LOW)",
    inputSchema: { type: "object", properties: { severity: { type: "string", enum: ["HIGH", "MEDIUM", "LOW", "ALL"], default: "ALL" } }, required: [] },
    path: (c) => c.outcomes.decide.insights },
  { name: "get_anomalies", description: "Get detected anomalies and unusual business patterns", inputSchema: NO_ARGS, path: (c) => c.outcomes.understand.anomalies },
  { name: "get_recommendations", description: "Get prioritized action recommendations for the business", inputSchema: NO_ARGS, path: (c) => c.outcomes.decide.recommendations },
  { name: "get_forecast", description: "Get the latest forecast data and predictions", inputSchema: NO_ARGS, path: (c) => c.outcomes.monitor.forecast },
  { name: "get_summary", description: "Get pipeline run summary and data freshness info", inputSchema: NO_ARGS, path: (c) => c.meta.summary }
];
const manifestTools = () => TOOLS.map(({ name, description, inputSchema }) => ({ name, description, inputSchema }));

async function runTool(name, params, request, env, ctx) {
  const tool = TOOLS.find((t) => t.name === name);
  if (!tool) return { status: 400, error: 'Unknown tool: "' + name + '". Call GET /mcp for available tools.' };
  const contract = await getContract(request, env, ctx);
  if (!contract) return { status: 503, error: "Contract not available. Redeploy the dashboard." };
  const data = await readJSON("/data/" + tool.path(contract), request, env, ctx);
  if (!data) return { status: 503, error: name + " data not available. Run the pipeline first." };
  if (isPlaceholder(data)) return { status: 503, error: name + " data not available: " + data.reason };
  let result = data;
  if (name === "get_insights") {
    const sev = String((params && params.severity) || "ALL").toUpperCase();
    if (sev !== "ALL" && Array.isArray(data.items)) result = { ...data, items: data.items.filter((i) => i.severity === sev) };
  }
  if (name === "get_summary") {
    const rl = await readJSON("/data/" + contract.meta.run_log, request, env, ctx);
    result = { summary: data, run_log: rl };
  }
  return { status: 200, result };
}

async function handleMCP(request, env, ctx, url) {
  if (request.method === "GET") {
    return json({ name: PROJECT + " Analytics MCP", description: "Read-only business analytics tools for " + PROJECT, version: "1.0.0", tools: manifestTools() });
  }
  if (request.method !== "POST") return json({ error: "MCP: use GET /mcp for the manifest, POST /mcp to call tools." }, 405);
  try {
    const body = await request.json().catch(() => ({}));
    if (body && body.jsonrpc === "2.0") {
      const id = body.id === undefined ? null : body.id;
      const rpc = (result) => json({ jsonrpc: "2.0", id, result });
      const rpcErr = (code, message) => json({ jsonrpc: "2.0", id, error: { code, message } });
      if (body.id === undefined || String(body.method || "").startsWith("notifications/")) return new Response(null, { status: 202, headers: CORS });
      switch (body.method) {
        case "initialize":
          return rpc({ protocolVersion: (body.params && body.params.protocolVersion) || "2025-03-26", capabilities: { tools: {} },
                       serverInfo: { name: PROJECT + " Analytics MCP", version: "1.0.0" } });
        case "ping": return rpc({});
        case "tools/list": return rpc({ tools: manifestTools() });
        case "tools/call": {
          const p = body.params || {};
          const out = await runTool(p.name, p.arguments || {}, request, env, ctx);
          if (out.error) return rpc({ content: [{ type: "text", text: out.error }], isError: true });
          return rpc({ content: [{ type: "text", text: JSON.stringify(out.result, null, 2) }] });
        }
        default: return rpcErr(-32601, "Method not found: " + body.method);
      }
    }
    const tool = body.tool || body.name || "";
    const out = await runTool(tool, body.params || body.arguments || {}, request, env, ctx);
    if (out.error) return json({ error: out.error }, out.status);
    return json({ tool, result: out.result }, 200);
  } catch (e) {
    return json({ error: "MCP error: " + e.message }, 500);
  }
}
