import { useGoalProgress } from '../../hooks/monitor/useGoalProgress';
import { validateProgress } from '../../utils/dataValidator';
import { SkeletonCard } from '../shared/SkeletonCard';
import { EmptyState, RUN_HINT } from '../shared/EmptyState';
import { fmtNumber, fmtDate, prettify } from '../../utils/formatters';

export function GoalProgress() {
  const { data: raw, loading, error } = useGoalProgress();
  if (loading) return <SkeletonCard height={140} count={3} />;
  const v = validateProgress(raw);
  if (!v.valid || error) return <EmptyState message="No goal progress available yet." action={v.error || error || RUN_HINT} />;
  const p = v.data;
  const cur = p.current || {}, prev = p.previous || {};
  const keys = Object.keys(cur);
  return (
    <div>
      <p className="muted small">Based on the last {p.window_days} days, up to {fmtDate(p.window_end)}.{p.margin_target_is_default ? ' No margin target has been set yet, so break-even (0%) is used.' : ''}</p>
      <div className="grid grid-3">
        {p.goals.map(g => {
          const span = Math.max(Math.abs(Number(g.target)) || 1, Math.abs(Number(g.actual)) || 1);
          const pct = Math.max(0, Math.min(100, (Math.abs(Number(g.actual)) / span) * 100));
          return (
            <div className="card hoverable" key={g.goal}>
              <div className="card-head"><span className="card-title">{g.label}</span><span className={'badge ' + (g.on_track ? 'badge-success' : 'badge-danger')}>{g.on_track ? 'On track' : 'Off track'}</span></div>
              <div className="kpi-value">{fmtNumber(g.actual, 2)}</div>
              <div className="muted small">Target: {fmtNumber(g.target, 2)} | Gap: {Number(g.gap) > 0 ? '+' : ''}{fmtNumber(g.gap, 2)}</div>
              <div className={'progress' + (g.on_track ? '' : ' bad')}><div style={{ width: pct + '%' }} /></div>
            </div>
          );
        })}
      </div>
      {keys.length > 0 && (
        <>
          <h3 className="section-title">This period compared with the one before</h3>
          <div className="table-wrap"><table className="data"><thead><tr><th>Measure</th><th>Now</th><th>Before</th></tr></thead>
            <tbody>{keys.map(k => <tr key={k}><td>{prettify(k)}</td><td className="mono">{fmtNumber(cur[k], 2)}</td><td className="mono">{prev && prev[k] !== undefined ? fmtNumber(prev[k], 2) : '\u2014'}</td></tr>)}</tbody></table></div>
        </>
      )}
    </div>
  );
}
