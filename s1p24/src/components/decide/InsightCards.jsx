import { useState } from 'react';
import { useInsights } from '../../hooks/decide/useInsights.js';
import { validateInsights } from '../../utils/dataValidator.js';
import { DataBoundary } from '../shared/DataBoundary.jsx';
import { SeverityBadge } from '../shared/SeverityBadge.jsx';
import { fmtNum } from '../../utils/formatters.js';

export function InsightCards() {
  const state = useInsights();
  const [sev, setSev] = useState('ALL');
  return (
    <DataBoundary state={state} validate={(d) => validateInsights(d)} emptyMessage="No insights available yet.">
      {(items) => {
        const list = [...items].sort((a, b) => (a.rank || 99) - (b.rank || 99)).filter((i) => sev === 'ALL' || i.severity === sev);
        return (
          <>
            <div className="chips">
              {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((s) => <button key={s} className={'chip' + (sev === s ? ' on' : '')} onClick={() => setSev(s)}>{s}</button>)}
            </div>
            <div className="grid cols-2">
              {list.map((i, n) => (
                <div className="card" key={(i.rank || n) + i.category}>
                  <div className="row"><SeverityBadge level={i.severity} /><b>{i.category}</b></div>
                  <p>{i.finding}</p>
                  <p className="small muted">Evidence: {i.evidence}</p>
                  <p className="small"><b>What to do:</b> {i.action}</p>
                  {i.impact_annualized !== null && i.impact_annualized !== undefined && <p className="tiny muted">Estimated value at stake: {fmtNum(i.impact_annualized)} per year</p>}
                </div>
              ))}
            </div>
          </>
        );
      }}
    </DataBoundary>
  );
}
