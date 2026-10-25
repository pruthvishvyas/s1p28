import { useKPIs } from '../../hooks/understand/useKPIs';
import { validateKPIs } from '../../utils/dataValidator';
import { SkeletonCard } from '../shared/SkeletonCard';
import { EmptyState, RUN_HINT } from '../shared/EmptyState';
import { useTerm } from '../shared/TerminologyProvider';
import { fmtNumber, fmtPct, fmtDate } from '../../utils/formatters';

function formatCard(k) {
  if (k.value === null || k.value === undefined) return '\u2014';
  if (k.unit === 'percent') return fmtPct(k.value, 1);
  if (k.unit === 'currency') return fmtNumber(k.value, 0);
  if (k.unit === 'count') return fmtNumber(k.value, 0);
  return typeof k.value === 'number' ? fmtNumber(k.value, 2) : String(k.value);
}

export function KPICards() {
  const term = useTerm();
  const { data: raw, loading, error } = useKPIs();
  if (loading) return <SkeletonCard height={120} count={4} />;
  const v = validateKPIs(raw);
  if (!v.valid || error) {
    return <EmptyState message={'No ' + term('revenue') + ' data available yet.'} action={v.error || error || RUN_HINT} />;
  }
  const { cards, raw: k } = v.data;
  const extras = [
    ['total_revenue', 'Total ' + term('revenue'), x => fmtNumber(x, 0)],
    ['total_cost', 'Total cost', x => fmtNumber(x, 0)],
    ['loss_making_routes', 'Loss-making ' + term('transaction', true).toLowerCase(), x => fmtNumber(x, 0)],
    ['avg_cost_per_parcel', 'Average cost per ' + term('product').toLowerCase(), x => fmtNumber(x, 2)],
    ['overtime_route_share_pct', term('transaction', true) + ' with overtime', x => fmtPct(x, 1)],
    ['avg_rating', 'Average ' + term('customer').toLowerCase() + ' rating', x => fmtNumber(x, 2)],
    ['avg_route_stress', 'Average ' + term('transaction').toLowerCase() + ' stress score', x => fmtNumber(x, 1)],
    ['anomaly_count', 'Unusual ' + term('transaction', true).toLowerCase(), x => fmtNumber(x, 0)],
    ['p1_count', 'Urgent ' + term('transaction', true).toLowerCase() + ' (P1)', x => fmtNumber(x, 0)],
    ['co2_kg_total', 'CO2 (kg)', x => fmtNumber(x, 0)]
  ].filter(([key]) => k[key] !== null && k[key] !== undefined);

  return (
    <div>
      <div className="kpi-grid">
        {cards.map(c => (
          <div key={c.key || c.label} className="kpi-card">
            <div className="kpi-label">{c.label}</div>
            <div className={'kpi-value' + (typeof c.value === 'number' && c.value < 0 ? ' neg' : '')}>{formatCard(c)}</div>
          </div>
        ))}
      </div>
      {(k.date_from || k.date_to) && (
        <p className="muted small">Period covered: {fmtDate(k.date_from)} to {fmtDate(k.date_to)}</p>
      )}
      {extras.length > 0 && (
        <>
          <h3 className="section-title">More detail</h3>
          <div className="kpi-grid">
            {extras.map(([key, label, f]) => (
              <div key={key} className="kpi-card small">
                <div className="kpi-label">{label}</div>
                <div className="kpi-value">{f(k[key])}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
