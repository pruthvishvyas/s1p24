import { useKPIs } from '../../hooks/understand/useKPIs.js';
import { validateKPIs } from '../../utils/dataValidator.js';
import { DataBoundary } from '../shared/DataBoundary.jsx';
import { SkeletonCard } from '../shared/SkeletonCard.jsx';
import { useTerm } from '../shared/TerminologyProvider.jsx';
import { fmtByUnit, pctChange } from '../../utils/formatters.js';

const LOWER_IS_BETTER = new Set(['operating_ratio', 'dso', 'loss_weeks']);

export function KPICards() {
  const term = useTerm();
  const state = useKPIs();
  return (
    <DataBoundary state={state} validate={validateKPIs} skeleton={<div className="kpi-grid"><SkeletonCard height={120} count={4} /></div>}
      emptyMessage={'No ' + term('revenue') + ' data available yet.'}>
      {({ cards, period }) => (
        <>
          {period && <p className="small muted">Covers {String(period.first_week).slice(0, 10)} to {String(period.last_week).slice(0, 10)} ({period.weeks} weeks)</p>}
          <div className="kpi-grid">
            {cards.map((k) => {
              const ch = pctChange(k.value, k.previous_13_weeks);
              const good = ch === null ? null : (LOWER_IS_BETTER.has(k.key) ? ch <= 0 : ch >= 0);
              return (
                <div key={k.key || k.label} className="kpi-card">
                  <div className="kpi-label">{k.label}</div>
                  <div className="kpi-value">{fmtByUnit(k.value, k.unit)}</div>
                  {ch !== null && <div className={'kpi-trend ' + (good ? 'good' : 'bad')}>{ch >= 0 ? '\u2191' : '\u2193'} {Math.abs(ch).toFixed(1)}% vs previous 13 weeks</div>}
                </div>
              );
            })}
          </div>
        </>
      )}
    </DataBoundary>
  );
}
