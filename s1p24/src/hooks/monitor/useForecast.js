import { useData } from '../useData.js';
import { useContract } from '../shared/useContract.js';
import { dataPath } from '../../utils/contract.js';

export function useForecast() {
  const { contract } = useContract();
  return useData(contract ? dataPath(contract.outcomes.monitor.forecast) : null);
}

export async function lookupForecast(n, metric, series) {
  try {
    const res = await fetch('/api', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ input: Number(n), metric }) });
    const body = await res.json().catch(() => null);
    if (res.ok && body && body.prediction !== undefined) return { ok: true, ...body, source: 'live' };
    if (res.status !== 404 && res.status !== 405 && body && body.error) return { ok: false, error: body.error };
  } catch (e) { /* fall back to the data already on screen */ }
  const row = ((series || {})[metric] || [])[Number(n) - 1];
  if (!row) return { ok: false, error: 'No forecast for that week.' };
  return { ok: true, prediction: row.forecast, range_low: row.lower_80, range_high: row.upper_80, week: row.week, input_received: Number(n), source: 'local' };
}
