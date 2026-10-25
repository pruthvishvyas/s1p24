import { fmtNum, avg } from '../../utils/formatters.js';

export function DrillDownPanel({ drill, rows, onClose }) {
  if (!drill) return null;
  let title, lines;
  if (drill.type === 'segment') {
    const r = rows.filter((x) => x.segment === drill.value);
    title = 'Week type: ' + drill.value;
    lines = [['Weeks', r.length], ['Average revenue (4-week avg)', fmtNum(avg(r.map((x) => x.revenue)))], ['Average operating cost (4-week avg)', fmtNum(avg(r.map((x) => x.cost)))],
      ['Average profit gap', fmtNum(avg(r.map((x) => x.gap)))], ['Average receivable days', fmtNum(avg(r.map((x) => x.dso)))], ['Unusual weeks', r.filter((x) => x.anomaly).length]];
  } else {
    const x = drill.row;
    title = 'Week of ' + x.week;
    lines = [['Revenue (4-week avg)', fmtNum(x.revenue)], ['Operating cost (4-week avg)', fmtNum(x.cost)], ['Profit gap', fmtNum(x.gap)], ['Cash balance', fmtNum(x.cash)],
      ['Receivable days', fmtNum(x.dso)], ['Week type', x.segment || 'n/a'], ['Unusual week', x.anomaly ? 'Yes' : 'No']];
  }
  return (
    <aside className="drill" role="dialog" aria-label={title}>
      <div className="row" style={{ justifyContent: 'space-between' }}><h3>{title}</h3><button className="btn ghost" onClick={onClose}>Close \u00D7</button></div>
      <table><tbody>{lines.map(([k, v]) => <tr key={k}><td>{k}</td><td className="num">{v}</td></tr>)}</tbody></table>
    </aside>
  );
}
