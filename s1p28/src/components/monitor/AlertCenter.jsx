import { useAlerts } from '../../hooks/monitor/useAlerts';
import { validateAlerts } from '../../utils/dataValidator';
import { SkeletonCard } from '../shared/SkeletonCard';
import { EmptyState, RUN_HINT } from '../shared/EmptyState';
import { SeverityBadge } from '../shared/SeverityBadge';
import { fmtDate } from '../../utils/formatters';

export function AlertCenter() {
  const { data: raw, loading, error } = useAlerts();
  if (loading) return <SkeletonCard height={100} count={3} />;
  const v = validateAlerts(raw);
  if (!v.valid || error) return <EmptyState message="No alert data available yet." action={v.error || error || RUN_HINT} />;
  const list = v.data.alerts;
  if (list.length === 0) return <EmptyState icon={'\u2705'} message="Nothing needs your attention right now." action={'Checked ' + fmtDate(v.data.generated_at)} />;
  return (
    <div className="grid" style={{ gap: 16 }}>
      {list.map((a, i) => (
        <div key={i} className={'card insight-card hoverable ' + String(a.severity).toUpperCase()}>
          <div className="card-head"><span className="card-title">{a.category}</span><SeverityBadge level={a.severity} /></div>
          <div>{a.message}</div>
          <div className="label-strong">What to do</div>
          <div className="small"><b>{a.action}</b></div>
        </div>
      ))}
    </div>
  );
}
