import { useGoalProgress } from '../../hooks/monitor/useGoalProgress.js';
import { validateGoalProgress } from '../../utils/dataValidator.js';
import { DataBoundary } from '../shared/DataBoundary.jsx';
import { SeverityBadge } from '../shared/SeverityBadge.jsx';
import { fmtNum, fmtPct } from '../../utils/formatters.js';

const show = (goal, v) => (/ratio|delivery|on-time/i.test(goal) ? fmtPct(v) : /days/i.test(goal) ? fmtNum(v) + ' days' : /weeks/i.test(goal) ? fmtNum(v) + ' weeks' : fmtNum(v));

export function GoalProgress() {
  const state = useGoalProgress();
  return (
    <DataBoundary state={state} validate={validateGoalProgress} emptyMessage="No goal progress available yet.">
      {(goals) => (
        <div className="grid cols-2">
          {goals.map((g) => {
            const lower = /ratio|days/i.test(g.goal);
            const ratio = lower ? g.target / g.actual : g.actual / g.target;
            const pct = Number.isFinite(ratio) ? Math.max(0, Math.min(100, ratio * 100)) : 0;
            return (
              <div className="card" key={g.goal}>
                <div className="row"><SeverityBadge level={g.status} label={g.status === 'ON_TRACK' ? 'On track' : 'Off track'} /><b>{g.goal}</b></div>
                <p className="small">Now <b>{show(g.goal, g.actual)}</b> &middot; target {lower ? 'at most' : 'at least'} {show(g.goal, g.target)}</p>
                <div className="bar"><span style={{ width: pct + '%' }} /></div>
              </div>
            );
          })}
        </div>
      )}
    </DataBoundary>
  );
}
