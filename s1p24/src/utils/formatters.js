export function fmtNum(v, d = 1) {
  const n = Number(v);
  if (v === null || v === undefined || !Number.isFinite(n)) return '\u2014';
  const a = Math.abs(n);
  if (a >= 1e9) return (n / 1e9).toFixed(d) + 'B';
  if (a >= 1e6) return (n / 1e6).toFixed(d) + 'M';
  if (a >= 1e4) return (n / 1e3).toFixed(d) + 'K';
  return n.toLocaleString('en-US', { maximumFractionDigits: a < 100 ? 2 : 0 });
}
export const fmtFull = (v) => (Number.isFinite(Number(v)) && v !== null ? Number(v).toLocaleString('en-US', { maximumFractionDigits: 0 }) : '\u2014');
export const fmtPct = (v, d = 1) => (Number.isFinite(Number(v)) && v !== null ? Number(v).toFixed(d) + '%' : '\u2014');
export function fmtByUnit(v, unit) {
  switch (unit) {
    case 'percent': return fmtPct(v);
    case 'days': return Number.isFinite(Number(v)) && v !== null ? Number(v).toFixed(1) + ' days' : '\u2014';
    case 'weeks': return Number.isFinite(Number(v)) && v !== null ? Number(v).toFixed(1) + ' weeks' : '\u2014';
    case 'count': return fmtFull(v);
    default: return fmtNum(v);
  }
}
export function pctChange(cur, prev) {
  if (cur === null || cur === undefined || prev === null || prev === undefined) return null;
  if (!Number.isFinite(Number(cur)) || !Number.isFinite(Number(prev)) || Number(prev) === 0) return null;
  return ((Number(cur) - Number(prev)) / Math.abs(Number(prev))) * 100;
}
export const humanize = (s) => String(s === null || s === undefined ? '' : s).replace(/_pct\b/gi, ' %').replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
export const shortDate = (s) => String(s || '').slice(0, 10);
export const avg = (arr) => { const v = arr.filter((x) => x !== null && x !== undefined && Number.isFinite(Number(x))).map(Number); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };
