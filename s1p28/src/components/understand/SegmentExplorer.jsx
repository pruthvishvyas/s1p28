import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { useSegments } from '../../hooks/understand/useSegments';
import { useTokens } from '../../hooks/shared/useTheme';
import { validateSegments } from '../../utils/dataValidator';
import { SkeletonCard } from '../shared/SkeletonCard';
import { EmptyState, RUN_HINT } from '../shared/EmptyState';
import { ErrorBoundary } from '../shared/ErrorBoundary';
import { DataTable } from '../shared/DataTable';
import { useTerm } from '../shared/TerminologyProvider';
import { fmtNumber, fmtPct, prettify } from '../../utils/formatters';

export function SegmentExplorer() {
  const term = useTerm();
  const tk = useTokens();
  const { data: raw, loading, error } = useSegments();
  if (loading) return <SkeletonCard height={200} count={3} />;
  const v = validateSegments(raw);
  if (!v.valid || error) return <EmptyState message="No segments available yet." action={v.error || error || RUN_HINT} />;
  const { segments, by_depot } = v.data;
  const chart = segments.map(s => ({ name: s.segment, margin: Number(s.avg_margin_pct) || 0 }));
  const depots = [...new Set((by_depot || []).map(r => r.Depot))];
  const pivot = segments.map(s => {
    const row = { segment: s.segment };
    depots.forEach(d => { const hit = (by_depot || []).find(r => r.route_segment === s.segment && r.Depot === d); row[d] = hit ? hit.routes : 0; });
    return row;
  });
  const axis = { fill: tk.text2, fontSize: 12 };
  return (
    <div>
      <div className="grid grid-3">
        {segments.map(s => (
          <div key={s.segment} className="card hoverable">
            <div className="card-head"><span className="card-title">{s.segment}</span><span className="badge badge-neutral">{fmtPct(s.share_pct, 1)} of {term('transaction', true).toLowerCase()}</span></div>
            <div className="kpi-value">{fmtNumber(s.routes, 0)} <span className="muted small">{term('transaction', true).toLowerCase()}</span></div>
            <p className="small">Average margin: <b className={Number(s.avg_margin_pct) < 0 ? 'neg' : 'pos'}>{fmtPct(s.avg_margin_pct, 1)}</b></p>
            <p className="small">Loss-making: <b>{fmtPct(Number(s.loss_share) * 100, 0)}</b> | Net result: <b className={Number(s.net_profit) < 0 ? 'neg' : 'pos'}>{fmtNumber(s.net_profit, 0)}</b></p>
            <p className="small muted">Stops/hour {fmtNumber(s.avg_stops_per_hour, 1)} | Load {fmtNumber(s.avg_load_pct, 0)}% | Cost per {term('product').toLowerCase()} {fmtNumber(s.avg_cost_per_parcel, 2)}</p>
          </div>
        ))}
      </div>
      <h3 className="section-title">Average margin by segment</h3>
      <div className="card"><div className="chart-box"><ErrorBoundary>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chart} margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={tk.border} />
            <XAxis dataKey="name" tick={axis} /><YAxis tick={axis} />
            <Tooltip contentStyle={{ background: tk.surface, border: '1px solid ' + tk.border, borderRadius: 8 }} formatter={x => fmtNumber(x, 1) + '%'} />
            <Bar dataKey="margin" radius={[4, 4, 0, 0]} isAnimationActive={false}>{chart.map((c, i) => <Cell key={i} fill={c.margin < 0 ? tk.danger : tk.accent} />)}</Bar>
          </BarChart>
        </ResponsiveContainer>
      </ErrorBoundary></div></div>
      {depots.length > 0 && (
        <>
          <h3 className="section-title">{term('transaction', true)} per segment and depot</h3>
          <DataTable rows={pivot} columns={[{ key: 'segment', label: 'Segment' }, ...depots.map(d => ({ key: d, label: prettify(d), mono: true }))]} searchable={false} pageSize={50} />
        </>
      )}
    </div>
  );
}
