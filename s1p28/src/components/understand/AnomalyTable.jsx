import { useAnomalies } from '../../hooks/understand/useAnomalies';
import { validateAnomalies } from '../../utils/dataValidator';
import { SkeletonCard } from '../shared/SkeletonCard';
import { EmptyState, RUN_HINT } from '../shared/EmptyState';
import { DataTable } from '../shared/DataTable';
import { useTerm } from '../shared/TerminologyProvider';
import { fmtNumber, fmtPct, fmtDate, prettify } from '../../utils/formatters';

export function AnomalyTable() {
  const term = useTerm();
  const { data: raw, loading, error } = useAnomalies();
  if (loading) return <SkeletonCard height={200} count={2} />;
  const v = validateAnomalies(raw);
  if (!v.valid || error) return <EmptyState message="No anomaly data available yet." action={v.error || error || RUN_HINT} />;
  const a = v.data;
  const first = a.routes[0] || {};
  const preferred = ['Route_ID', 'Route_Date', 'Depot', 'Zone_Type', 'Driver_ID', 'Margin_pct', 'Gross_Profit', 'anomaly_score', 'anomaly_reason'];
  const keys = preferred.filter(k => k in first).concat(Object.keys(first).filter(k => !preferred.includes(k)));
  const columns = keys.map(k => ({
    key: k, label: prettify(k),
    format: k.toLowerCase().includes('date') ? fmtDate : (x => (typeof x === 'number' ? fmtNumber(x, Number.isInteger(x) ? 0 : 2) : (x ?? '\u2014'))),
    mono: typeof first[k] === 'number'
  }));
  return (
    <div>
      <div className="kpi-grid" style={{ marginBottom: 24 }}>
        <div className="kpi-card"><div className="kpi-label">Unusual {term('transaction', true).toLowerCase()}</div><div className="kpi-value">{fmtNumber(a.count, 0)}</div></div>
        <div className="kpi-card"><div className="kpi-label">Share of all {term('transaction', true).toLowerCase()}</div><div className="kpi-value">{fmtPct(a.rate_pct, 1)}</div></div>
      </div>
      <p className="muted small">Showing the {a.routes.length} most unusual {term('transaction', true).toLowerCase()}. Click a column heading to sort.</p>
      <DataTable rows={a.routes} columns={columns} defaultSort={{ key: 'anomaly_score', dir: 'desc' }} />
    </div>
  );
}
