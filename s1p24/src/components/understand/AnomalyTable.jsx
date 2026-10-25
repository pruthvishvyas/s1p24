import { useAnomalies } from '../../hooks/understand/useAnomalies.js';
import { validateAnomalies } from '../../utils/dataValidator.js';
import { DataBoundary } from '../shared/DataBoundary.jsx';
import { fmtNum, fmtPct, humanize, shortDate } from '../../utils/formatters.js';

export function AnomalyTable() {
  const state = useAnomalies();
  return (
    <DataBoundary state={state} validate={validateAnomalies} emptyMessage="No unusual-week data available yet.">
      {(d) => {
        const items = [...d.items].sort((a, b) => String(b.Week_Start).localeCompare(String(a.Week_Start)));
        return (
          <div className="card">
            <p className="small"><b>{d.flagged_weeks}</b> of {d.total_weeks} weeks were flagged as unusual. Newest first.</p>
            {items.length === 0 ? <p className="muted">No unusual weeks found.</p> : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Week</th><th className="num">Operating ratio</th><th className="num">Operating profit</th><th className="num">Risk score</th><th>Main reason</th></tr></thead>
                  <tbody>
                    {items.map((r) => (
                      <tr key={r.Week_Start}>
                        <td>{shortDate(r.Week_Start)}</td>
                        <td className="num">{fmtPct(r.Operating_Ratio_pct)}</td>
                        <td className="num">{fmtNum(r.Operating_Profit)}</td>
                        <td className="num">{fmtNum(r.Risk_Score, 0)}</td>
                        <td>{humanize(r.Top_Driver)} ({Number(r.Top_Driver_z) >= 0 ? 'above' : 'below'} normal)</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      }}
    </DataBoundary>
  );
}
