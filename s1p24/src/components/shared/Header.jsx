import { ThemeToggle } from './ThemeToggle.jsx';
import { useOutcome } from '../../context/OutcomeContext.jsx';
import { useRunLog } from '../../hooks/shared/useRunLog.js';
import { isPlaceholder } from '../../utils/dataValidator.js';

export function Header() {
  const { view } = useOutcome();
  const { data } = useRunLog();
  const ok = data && !isPlaceholder(data);
  const updated = ok && data.last_run ? String(data.last_run).replace('T', ' ').slice(0, 16) : null;
  const synthetic = ok && data.data_provenance === 'synthetic_portfolio';
  return (
    <header className="header">
      <div>
        <h1>{view.label}</h1>
        <div className="meta">
          {view.group}
          {updated ? ' \u00B7 data updated ' + updated : ''}
          {ok && data.first_week ? ' \u00B7 weeks ' + String(data.first_week).slice(0, 10) + ' to ' + String(data.last_week).slice(0, 10) : ''}
          {synthetic ? ' \u00B7 synthetic data' : ''}
        </div>
      </div>
      <ThemeToggle />
    </header>
  );
}
