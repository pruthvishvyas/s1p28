import { useState } from 'react';
import { useRecommendations } from '../../hooks/decide/useRecommendations';
import { validateRecommendations } from '../../utils/dataValidator';
import { SkeletonCard } from '../shared/SkeletonCard';
import { EmptyState, RUN_HINT } from '../shared/EmptyState';
import { SeverityBadge } from '../shared/SeverityBadge';
import { DataTable } from '../shared/DataTable';
import { useTerm } from '../shared/TerminologyProvider';
import { fmtNumber, fmtDate } from '../../utils/formatters';

export function RecommendationEngine() {
  const term = useTerm();
  const [prio, setPrio] = useState('ALL');
  const { data: raw, loading, error } = useRecommendations();
  if (loading) return <SkeletonCard height={160} count={3} />;
  const v = validateRecommendations(raw);
  if (!v.valid || error) return <EmptyState message="No recommendations available yet." action={v.error || error || RUN_HINT} />;
  const { strategic, route_actions } = v.data;
  const rows = route_actions.filter(r => prio === 'ALL' || r.priority === prio);
  const columns = [
    { key: 'Route_ID', label: term('transaction') + ' ID', mono: true },
    { key: 'Route_Date', label: 'Date', format: fmtDate },
    { key: 'Depot', label: 'Depot' },
    { key: 'Zone_Type', label: 'Zone' },
    { key: 'Driver_ID', label: 'Driver' },
    { key: 'Gross_Profit', label: 'Result', mono: true, format: x => fmtNumber(x, 0) },
    { key: 'priority', label: 'Priority', render: r => <SeverityBadge level={r.priority} /> },
    { key: 'primary_loss_driver', label: 'Biggest cost problem', format: x => x || '\u2014' },
    { key: 'recommendations', label: 'What to do' }
  ];
  return (
    <div>
      {strategic.length > 0 && (
        <>
          <h3 className="section-title" style={{ marginTop: 0 }}>Where to act first</h3>
          <div className="grid grid-2">
            {strategic.map((s, i) => (
              <div className="card hoverable" key={i}>
                <div className="card-head"><span className="card-title">#{s.rank ?? i + 1} {s.target}</span><span className="badge badge-neutral">{s.scope}</span></div>
                <div className="small">{s.finding}</div>
                <div className="label-strong">Action</div>
                <div className="small"><b>{s.action}</b></div>
                {Number(s.loss_at_stake) > 0 && <div className="label-strong">Money at stake</div>}
                {Number(s.loss_at_stake) > 0 && <div className="mono neg">{fmtNumber(s.loss_at_stake, 0)}</div>}
              </div>
            ))}
          </div>
        </>
      )}
      {route_actions.length > 0 && (
        <>
          <h3 className="section-title">{term('transaction')} action list</h3>
          <div className="chips">
            {['ALL', 'P1_URGENT', 'P2_HIGH'].map(p => <button key={p} className={'chip' + (prio === p ? ' active' : '')} onClick={() => setPrio(p)}>{p === 'ALL' ? 'All' : p.replace('_', ' ')}</button>)}
          </div>
          <DataTable rows={rows} columns={columns} pageSize={15} />
        </>
      )}
    </div>
  );
}
