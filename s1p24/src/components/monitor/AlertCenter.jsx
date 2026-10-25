import { useAlerts } from '../../hooks/monitor/useAlerts.js';
import { validateAlerts } from '../../utils/dataValidator.js';
import { DataBoundary } from '../shared/DataBoundary.jsx';
import { SeverityBadge } from '../shared/SeverityBadge.jsx';
import { fmtNum } from '../../utils/formatters.js';

export function AlertCenter() {
  const state = useAlerts();
  return (
    <DataBoundary state={state} validate={validateAlerts} emptyMessage="Alert data is not available yet.">
      {(alerts) => alerts.length === 0 ? (
        <div className="card"><p className="good"><b>No active alerts.</b></p><p className="small muted">Everything this dashboard watches is inside your limits.</p></div>
      ) : (
        <div className="stack">
          {alerts.map((a) => (
            <div className="card" key={a.id}>
              <div className="row"><SeverityBadge level={a.severity} /><b>{a.message}</b></div>
              <p className="small muted">Value {fmtNum(a.value, 2)} against limit {fmtNum(a.threshold, 2)}</p>
            </div>
          ))}
        </div>
      )}
    </DataBoundary>
  );
}
