import { SkeletonCard } from './SkeletonCard.jsx';
import { EmptyState } from './EmptyState.jsx';
import { isPlaceholder } from '../../utils/dataValidator.js';

const FIX = 'Run the pipeline, then python export_for_frontend.py, then npm run build.';

// One place for loading / error / placeholder / validation states. Children receive validated data.
export function DataBoundary({ state, validate, emptyMessage, skeleton, children }) {
  const { data, loading, error } = state;
  if (loading) return skeleton || <SkeletonCard height={160} />;
  if (error) return <EmptyState message={emptyMessage} action={error + '. ' + FIX} />;
  if (isPlaceholder(data)) return <EmptyState message={emptyMessage} action={'This step did not complete: ' + data.reason} />;
  const v = validate ? validate(data) : { valid: data !== null, data, error: 'No data' };
  if (!v.valid) return <EmptyState message={emptyMessage} action={(v.error || '') + '. ' + FIX} />;
  return children(v.data);
}
