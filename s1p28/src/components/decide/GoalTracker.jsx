import { useState } from 'react';
import { useGoals } from '../../hooks/decide/useGoals';
import { useGoalProgress } from '../../hooks/monitor/useGoalProgress';
import { validateGoals } from '../../utils/dataValidator';
import { SkeletonCard } from '../shared/SkeletonCard';
import { EmptyState, RUN_HINT } from '../shared/EmptyState';
import { fmtNumber, prettify } from '../../utils/formatters';

function readOverrides() {
  try { return JSON.parse(localStorage.getItem('goal_overrides') || '{}') || {}; } catch (e) { return {}; }
}

export function GoalTracker() {
  const { data: raw, loading, error } = useGoals();
  const { data: prog } = useGoalProgress();
  const [ov, setOv] = useState(readOverrides);
  if (loading) return <SkeletonCard height={140} count={3} />;
  const v = validateGoals(raw);
  if (!v.valid || error) return <EmptyState message="No goals configured yet." action={v.error || error || RUN_HINT} />;
  const actuals = {};
  if (prog && Array.isArray(prog.goals)) prog.goals.forEach(g => { actuals[g.goal] = g; });
  const save = (key, val) => {
    const next = { ...ov };
    if (val === '' || val === null) delete next[key]; else next[key] = Number(val);
    setOv(next);
    try { localStorage.setItem('goal_overrides', JSON.stringify(next)); } catch (e) { /* ignore */ }
  };
  return (
    <div>
      <p className="muted small">Targets marked "you set this" can be changed here. Changes are kept in this browser only; the pipeline's goals file stays the master copy.</p>
      <div className="grid grid-3">
        {v.data.map(([key, g]) => {
          const target = ov[key] !== undefined ? ov[key] : g.value;
          const a = actuals[key];
          const higherBetter = key.indexOf('max_') !== 0;
          const ok = a && target !== null && target !== undefined ? (higherBetter ? a.actual >= target : a.actual <= target) : null;
          return (
            <div className="card hoverable" key={key}>
              <div className="card-head"><span className="card-title">{prettify(key)}</span>{ok !== null && <span className={'badge ' + (ok ? 'badge-success' : 'badge-danger')}>{ok ? 'On track' : 'Off track'}</span>}</div>
              <div className="muted small">{g.description || ''}</div>
              <div className="kpi-value">{target === null || target === undefined ? 'Not set' : fmtNumber(target, 2)} <span className="muted small">{g.unit}</span></div>
              {a && <div className="small">Latest actual: <b>{fmtNumber(a.actual, 2)}</b></div>}
              {g.client_sets && (
                <p className="small">You set this:{' '}
                  <input type="number" style={{ width: 110 }} value={ov[key] !== undefined ? ov[key] : ''} placeholder={g.value === null || g.value === undefined ? 'enter target' : String(g.value)} onChange={e => save(key, e.target.value)} />
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
