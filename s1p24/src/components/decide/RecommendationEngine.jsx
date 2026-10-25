import { useRecommendations } from '../../hooks/decide/useRecommendations.js';
import { validateRecs } from '../../utils/dataValidator.js';
import { DataBoundary } from '../shared/DataBoundary.jsx';
import { SeverityBadge } from '../shared/SeverityBadge.jsx';
import { shortDate } from '../../utils/formatters.js';

export function RecommendationEngine() {
  const state = useRecommendations();
  return (
    <DataBoundary state={state} validate={validateRecs} emptyMessage="No recommendations available yet.">
      {(d) => {
        const now = (d.this_week || [])[0];
        return (
          <div className="stack">
            {now && (
              <div className="card">
                <h3>Latest week ({shortDate(now.Week_Start)}) <SeverityBadge level={now.Priority} /></h3>
                <p className="small">{now.Triggered_Rules ? 'Triggered: ' + now.Triggered_Rules : 'No rules triggered this week.'}</p>
                {now.Actions && <p className="small"><b>Actions:</b> {now.Actions}</p>}
              </div>
            )}
            <div className="grid cols-2">
              {d.recommendations.map((r) => (
                <div className="card" key={r.rule}>
                  <div className="row"><SeverityBadge level={r.priority} /><b>{r.label}</b></div>
                  <p className="small"><b>Action:</b> {r.action}</p>
                  <p className="small muted">Flagged in {r.weeks_flagged_last_13} of the last 13 weeks ({r.weeks_flagged_total} weeks overall).{r.last_flagged_week ? ' Last seen ' + shortDate(r.last_flagged_week) + '.' : ''}</p>
                </div>
              ))}
            </div>
          </div>
        );
      }}
    </DataBoundary>
  );
}
