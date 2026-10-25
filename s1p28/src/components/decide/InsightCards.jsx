import { useState } from 'react';
import { useInsights } from '../../hooks/decide/useInsights';
import { validateInsights } from '../../utils/dataValidator';
import { SkeletonCard } from '../shared/SkeletonCard';
import { EmptyState, RUN_HINT } from '../shared/EmptyState';
import { SeverityBadge } from '../shared/SeverityBadge';
import { fmtNumber } from '../../utils/formatters';

export function InsightCards() {
  const [sev, setSev] = useState('ALL');
  const { data: raw, loading, error } = useInsights();
  if (loading) return <SkeletonCard height={160} count={3} />;
  const v = validateInsights(raw);
  if (!v.valid || error) return <EmptyState message="No insights available yet." action={v.error || error || RUN_HINT} />;
  const list = v.data.filter(i => sev === 'ALL' || String(i.severity).toUpperCase() === sev);
  return (
    <div>
      <div className="chips">
        {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map(s => (
          <button key={s} className={'chip' + (sev === s ? ' active' : '')} onClick={() => setSev(s)}>{s === 'ALL' ? 'All insights' : s}</button>
        ))}
      </div>
      <div className="grid" style={{ gap: 16 }}>
        {list.map((i, idx) => (
          <div key={idx} className={'card insight-card hoverable ' + String(i.severity).toUpperCase()}>
            <div className="card-head">
              <span className="card-title">{i.category}</span>
              <SeverityBadge level={i.severity} />
            </div>
            <div>{i.finding}</div>
            {i.evidence && <><div className="label-strong">Evidence</div><div className="small">{i.evidence}</div></>}
            {i.action && <><div className="label-strong">What to do this week</div><div className="small"><b>{i.action}</b></div></>}
            {Number(i.impact) > 0 && <div className="muted small" style={{ marginTop: 8 }}>Money at stake: {fmtNumber(i.impact, 0)}</div>}
          </div>
        ))}
        {list.length === 0 && <EmptyState message="No insights at this level." />}
      </div>
    </div>
  );
}
