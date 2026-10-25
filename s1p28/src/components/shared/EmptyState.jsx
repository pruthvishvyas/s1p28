export function EmptyState({ message, action, icon = '\uD83D\uDCCA' }) {
  return (
    <div className="empty-state">
      <span className="empty-icon">{icon}</span>
      <p className="empty-message">{message}</p>
      {action && <p className="empty-action">{action}</p>}
    </div>
  );
}

export const RUN_HINT = 'Run the pipeline, then export_for_frontend, then python generate_react_frontend.py and npm run deploy.';
