import { severityClass } from '../../utils/colors.js';

export function SeverityBadge({ level, label }) {
  const s = severityClass(level);
  return <span className={'badge ' + s}>{label || String(level).replace(/_/g, ' ')}</span>;
}
