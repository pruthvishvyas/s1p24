import { useMemo, useState, useContext } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ExplorerProvider, ExplorerContext } from '../../context/ExplorerContext.jsx';
import { useContract } from '../../hooks/shared/useContract.js';
import { useData } from '../../hooks/useData.js';
import { useSegments } from '../../hooks/understand/useSegments.js';
import { useAnomalies } from '../../hooks/understand/useAnomalies.js';
import { useThemeColors } from '../../hooks/shared/useTheme.js';
import { useTerm } from '../shared/TerminologyProvider.jsx';
import { dataPath, findPath } from '../../utils/contract.js';
import { isPlaceholder } from '../../utils/dataValidator.js';
import { fmtNum, avg, shortDate } from '../../utils/formatters.js';
import { segColor } from '../../utils/colors.js';
import { SkeletonCard } from '../shared/SkeletonCard.jsx';
import { EmptyState } from '../shared/EmptyState.jsx';
import { ErrorBoundary } from '../shared/ErrorBoundary.jsx';
import { FilterBar } from './FilterBar.jsx';
import { DrillDownPanel } from './DrillDownPanel.jsx';

const chartRows = (s) => (s.data && !isPlaceholder(s.data) && Array.isArray(s.data.data) ? s.data.data : []);

function Inner() {
  const term = useTerm();
  const c = useThemeColors();
  const { contract } = useContract();
  const { filters, setFilter } = useContext(ExplorerContext);
  const charts = contract.outcomes.understand.charts;
  const rc = useData(dataPath(findPath(charts, 'revenue_cost_trend')));
  const cd = useData(dataPath(findPath(charts, 'cash_dso_trend')));
  const sg = useSegments();
  const an = useAnomalies();
  const [metric, setMetric] = useState('revenue');
  const [sort, setSort] = useState({ k: 'week', dir: -1 });
  const [drill, setDrill] = useState(null);
  const [copied, setCopied] = useState('');
  const loading = rc.loading || cd.loading || sg.loading || an.loading;

  const rows = useMemo(() => {
    const base = chartRows(rc);
    if (!base.length) return [];
    const cash = new Map(chartRows(cd).map((r) => [String(r.label).slice(0, 10), r]));
    const seg = new Map(((sg.data && Array.isArray(sg.data.timeline)) ? sg.data.timeline : []).map((t) => [String(t.week).slice(0, 10), t.segment]));
    const anom = new Map(((an.data && Array.isArray(an.data.items)) ? an.data.items : []).map((a) => [String(a.Week_Start).slice(0, 10), a]));
    return base.map((r) => {
      const w = String(r.label).slice(0, 10);
      const k = cash.get(w);
      return { week: w, revenue: r.revenue, cost: r.cost, gap: r.revenue - r.cost, cash: k ? k.cash_balance : null, dso: k ? k.dso_days : null,
        segment: seg.get(w) || null, anomaly: anom.has(w) ? 1 : 0 };
    });
  }, [rc.data, cd.data, sg.data, an.data]);

  if (loading) return <SkeletonCard height={200} count={3} />;
  if (!rows.length) return <EmptyState message="The explorer needs the revenue and cost chart data." action="Run the pipeline, then python export_for_frontend.py, then npm run build." />;

  const METRICS = [['revenue', term('revenue') + ' (4-week average)'], ['cost', 'Operating cost (4-week average)'], ['gap', 'Profit gap (revenue minus cost)'], ['cash', 'Cash balance'], ['dso', 'Receivable days']];
  const segs = Array.from(new Set(rows.map((r) => r.segment).filter(Boolean)));
  const pass = (r, skipSeg) => (!filters.from || r.week >= filters.from) && (!filters.to || r.week <= filters.to)
    && (skipSeg || !filters.segment || r.segment === filters.segment)
    && (!filters.anomaly || (filters.anomaly === 'yes' ? r.anomaly === 1 : r.anomaly === 0));
  const fr = rows.filter((r) => pass(r, false));
  const frSeg = rows.filter((r) => pass(r, true));
  const bySeg = segs.map((s) => { const x = frSeg.filter((r) => r.segment === s); return { segment: s, weeks: x.length, avg: avg(x.map((r) => r[metric])) }; });
  const pickSeg = (d) => { const s = d && (d.payload || d).segment; if (s) { setFilter('segment', filters.segment === s ? 'all' : s); setDrill({ type: 'segment', value: s }); } };
  const sorted = [...fr].sort((a, b) => { const x = a[sort.k], y = b[sort.k]; return (x === y ? 0 : (x === null ? 1 : y === null ? -1 : x > y ? 1 : -1)) * sort.dir; }).slice(0, 80);
  const head = (k, label, num) => <th className={'sortable' + (num ? ' num' : '')} onClick={() => setSort({ k, dir: sort.k === k ? -sort.dir : -1 })}>{label}{sort.k === k ? (sort.dir > 0 ? ' \u25B2' : ' \u25BC') : ''}</th>;
  const stat = (k) => fmtNum(avg(fr.map((r) => r[k])));
  const copy = async () => {
    const text = 'Explorer view: ' + fr.length + ' weeks' + (fr.length ? ' (' + fr[0].week + ' to ' + fr[fr.length - 1].week + ')' : '') + '; avg revenue ' + stat('revenue') + '; avg cost ' + stat('cost') + '; avg profit gap ' + stat('gap') + '; avg receivable days ' + stat('dso');
    try { await navigator.clipboard.writeText(text); setCopied('Copied to clipboard'); } catch (e) { setCopied('Copy is not available in this browser'); }
    setTimeout(() => setCopied(''), 2500);
  };
  const tip = { background: c.surface, border: '1px solid ' + c.border, borderRadius: 8 };
  const label = METRICS.find((m) => m[0] === metric)[1];

  return (
    <div className="stack">
      <FilterBar segments={segs} minDate={rows[0].week} maxDate={rows[rows.length - 1].week} />
      <div className="kpi-grid">
        {[['Weeks in view', fr.length], ['Average ' + term('revenue'), stat('revenue')], ['Average operating cost', stat('cost')], ['Average profit gap', stat('gap')], ['Average receivable days', stat('dso')]].map(([k, v]) => (
          <div className="kpi-card" key={k}><div className="kpi-label">{k}</div><div className="kpi-value">{v}</div></div>
        ))}
      </div>
      <div className="row"><label className="small">Measure <select value={metric} onChange={(e) => setMetric(e.target.value)}>{METRICS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
        <button className="btn ghost no-print" onClick={copy}>Copy summary</button><span className="tiny muted">{copied}</span></div>
      <div className="card">
        <h3>{label} over time</h3>
        <div className="chart-box"><ErrorBoundary>
          {fr.length === 0 ? <EmptyState message="No weeks match these filters." /> : (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={fr} margin={{ top: 10, right: 20, bottom: 24, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={c.grid} />
                <XAxis dataKey="week" tick={{ fill: c.text, fontSize: 12 }} minTickGap={48} />
                <YAxis tick={{ fill: c.text, fontSize: 12 }} tickFormatter={(v) => fmtNum(v, 1)} domain={['auto', 'auto']} />
                <Tooltip contentStyle={tip} formatter={(v) => fmtNum(v, 2)} />
                <Line type="monotone" dataKey={metric} name={label} stroke={c.accent} strokeWidth={2} dot={false} isAnimationActive={false} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ErrorBoundary></div>
      </div>
      {segs.length > 0 && (
        <div className="grid cols-2">
          {[['weeks', 'Weeks per week type (click a bar to filter)'], ['avg', 'Average of selected measure per week type']].map(([key, title]) => (
            <div className="card" key={key}><h3>{title}</h3>
              <div className="chart-box" style={{ height: 240 }}><ErrorBoundary>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={bySeg} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={c.grid} />
                    <XAxis dataKey="segment" tick={{ fill: c.text, fontSize: 12 }} />
                    <YAxis tick={{ fill: c.text, fontSize: 12 }} tickFormatter={(v) => fmtNum(v, 1)} />
                    <Tooltip contentStyle={tip} formatter={(v) => fmtNum(v, 2)} />
                    <Bar dataKey={key} onClick={pickSeg} cursor="pointer">
                      {bySeg.map((b) => <Cell key={b.segment} fill={segColor(b.segment, c)} fillOpacity={filters.segment && filters.segment !== b.segment ? 0.3 : 1} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ErrorBoundary></div>
            </div>
          ))}
        </div>
      )}
      <div className="card">
        <h3>Weeks in view (click a row to drill down)</h3>
        <div className="table-wrap"><table>
          <thead><tr>{head('week', 'Week')}{head('revenue', 'Revenue', 1)}{head('cost', 'Cost', 1)}{head('gap', 'Profit gap', 1)}{head('cash', 'Cash', 1)}{head('dso', 'Receivable days', 1)}{head('segment', 'Week type')}{head('anomaly', 'Unusual')}</tr></thead>
          <tbody>{sorted.map((r) => (
            <tr key={r.week} className="clickable" onClick={() => setDrill({ type: 'week', row: r })}>
              <td>{shortDate(r.week)}</td><td className="num">{fmtNum(r.revenue)}</td><td className="num">{fmtNum(r.cost)}</td><td className="num">{fmtNum(r.gap)}</td>
              <td className="num">{fmtNum(r.cash)}</td><td className="num">{fmtNum(r.dso)}</td><td>{r.segment || '\u2014'}</td><td>{r.anomaly ? 'Yes' : ''}</td>
            </tr>))}</tbody>
        </table></div>
        <p className="tiny muted">Revenue and cost are 4-week averages, as drawn in the Analysis Charts. Showing up to 80 weeks.</p>
      </div>
      <DrillDownPanel drill={drill} rows={fr} onClose={() => setDrill(null)} />
    </div>
  );
}

export function InteractiveExplorer() {
  return <ExplorerProvider><Inner /></ExplorerProvider>;
}
