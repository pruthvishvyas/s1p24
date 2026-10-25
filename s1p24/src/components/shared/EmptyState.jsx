export function EmptyState({ message, action }) {
  return (
    <div className="empty-state">
      <span className="empty-icon">{'\uD83D\uDCCA'}</span>
      <p className="empty-message">{message}</p>
      {action && <p className="empty-action">{action}</p>}
    </div>
  );
}
