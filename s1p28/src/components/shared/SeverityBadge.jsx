export function SeverityBadge({ level }) {
  const l = String(level || 'LOW').toUpperCase();
  let cls = 'success';
  if (l === 'HIGH' || l === 'P1_URGENT') cls = 'danger';
  else if (l === 'MEDIUM' || l === 'P2_HIGH' || l === 'P3_MEDIUM') cls = 'warning';
  return <span className={'badge badge-' + cls}>{l.replace(/_/g, ' ')}</span>;
}
