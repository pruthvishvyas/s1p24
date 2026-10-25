// Each validator returns { valid, data, error }
export const isPlaceholder = (d) => d && typeof d === 'object' && !Array.isArray(d) && 'status' in d && 'reason' in d && Object.keys(d).length === 2;
const bad = (error, data = null) => ({ valid: false, data, error });

export function validateKPIs(raw) {
  const cards = raw && Array.isArray(raw.kpi_cards) ? raw.kpi_cards.filter((k) => k && typeof k.label === 'string' && k.value !== undefined) : [];
  if (cards.length === 0) return bad('No valid KPI entries');
  return { valid: true, data: { cards, period: raw.period || null }, error: null };
}
export function validateChartData(raw) {
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.data) || raw.data.length === 0) return bad('Chart has no data rows');
  if (typeof raw.data[0] !== 'object' || raw.data[0] === null) return bad('Chart rows have an unexpected shape');
  return { valid: true, data: raw, error: null };
}
export function validateInsights(raw) {
  const items = raw && Array.isArray(raw.items) ? raw.items.filter((i) => i && i.finding && i.severity) : [];
  return items.length ? { valid: true, data: items, error: null } : bad('No valid insights');
}
export function validateForecast(raw) {
  const s = raw && raw.series && typeof raw.series === 'object' ? raw.series : null;
  const ok = s && Object.keys(s).some((k) => Array.isArray(s[k]) && s[k].length > 0);
  return ok ? { valid: true, data: raw, error: null } : bad('Invalid forecast data');
}
export function validateAnomalies(raw) {
  return raw && Array.isArray(raw.items) ? { valid: true, data: raw, error: null } : bad('Anomalies must contain an items list');
}
export function validateSegments(raw) {
  return raw && Array.isArray(raw.profiles) && raw.profiles.length ? { valid: true, data: raw, error: null } : bad('No segment profiles');
}
export function validateRecs(raw) {
  return raw && Array.isArray(raw.recommendations) && raw.recommendations.length ? { valid: true, data: raw, error: null } : bad('No recommendations');
}
export function validateSim(raw) {
  return raw && Array.isArray(raw.scenarios) && raw.scenarios.length ? { valid: true, data: raw, error: null } : bad('No scenarios');
}
export function validateGoals(raw) {
  return raw && raw.goals && typeof raw.goals === 'object' && Object.keys(raw.goals).length ? { valid: true, data: raw.goals, error: null } : bad('No goals');
}
export function validateGoalProgress(raw) {
  return raw && Array.isArray(raw.goals) && raw.goals.length ? { valid: true, data: raw.goals, error: null } : bad('No goal progress');
}
export function validateAlerts(raw) {
  return raw && Array.isArray(raw.alerts) ? { valid: true, data: raw.alerts, error: null } : bad('Alerts must be a list');
}
