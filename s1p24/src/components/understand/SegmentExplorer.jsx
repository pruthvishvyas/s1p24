import { useSegments } from '../../hooks/understand/useSegments.js';
import { validateSegments } from '../../utils/dataValidator.js';
import { DataBoundary } from '../shared/DataBoundary.jsx';
import { fmtNum, fmtPct, humanize } from '../../utils/formatters.js';

export function SegmentExplorer() {
  const state = useSegments();
  return (
    <DataBoundary state={state} validate={validateSegments} emptyMessage="No week-type data available yet.">
      {(d) => {
        const metrics = Array.from(new Set(d.profiles.flatMap((p) => Object.keys(p.means || {}))));
        const sil = Number(d.silhouette);
        const clarity = !Number.isFinite(sil) ? '' : sil >= 0.5 ? 'clearly separated' : sil >= 0.25 ? 'moderately separated' : 'only loosely separated';
        return (
          <div className="stack">
            <div className="grid cols-3">
              {d.profiles.map((p) => (
                <div className="card" key={p.segment}>
                  <h3><span className={'badge seg-' + p.segment} style={{ color: '#fff' }}>{p.segment}</span></h3>
                  <p className="small">{p.weeks} weeks ({fmtPct(p.share_pct, 0)} of all weeks)</p>
                </div>
              ))}
            </div>
            {clarity && <p className="small muted">These {d.profiles.length} week types are {clarity} in the data.</p>}
            <div className="card">
              <h3>When each type happened</h3>
              <div className="timeline">{(d.timeline || []).map((t) => <span key={t.week} className={'seg-' + t.segment} title={t.week + ': ' + t.segment} />)}</div>
              <p className="tiny muted">Oldest week on the left, newest on the right.</p>
            </div>
            <div className="card table-wrap">
              <table>
                <thead><tr><th>Average of</th>{d.profiles.map((p) => <th key={p.segment} className="num">{p.segment}</th>)}</tr></thead>
                <tbody>
                  {metrics.map((m) => (
                    <tr key={m}><td>{humanize(m)}</td>{d.profiles.map((p) => <td key={p.segment} className="num">{fmtNum(p.means[m])}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      }}
    </DataBoundary>
  );
}
