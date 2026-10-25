export const severityClass = (s) => String(s || 'LOW').toUpperCase();
export function segColor(name, c) {
  return { Efficient: c.success, Typical: c.series[1], Strained: c.warning, Stressed: c.danger }[name] || c.accent;
}
