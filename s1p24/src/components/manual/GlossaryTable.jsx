import { highlight } from './ManualSection.jsx';

export function GlossaryTable({ entries, q }) {
  return (
    <div className="card table-wrap">
      <table>
        <thead><tr><th>Word</th><th>What it means</th></tr></thead>
        <tbody>{entries.map(([k, v]) => <tr key={k}><td><b>{highlight(k, q)}</b></td><td>{highlight(v, q)}</td></tr>)}</tbody>
      </table>
    </div>
  );
}
