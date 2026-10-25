// Metric maths shared by the explorer panels
export function calc(rows, metric) {
  if (!metric) return null;
  const n = rows.length;
  if (metric.kind === 'count') return n;
  const sum = f => rows.reduce((s, r) => s + (Number(r[f]) || 0), 0);
  if (metric.kind === 'sum') return sum(metric.field);
  if (metric.kind === 'ratio') {
    const d = sum(metric.den);
    return d ? (sum(metric.num) / d) * 100 : 0;
  }
  return null;
}

export function groupBy(rows, key) {
  const m = new Map();
  rows.forEach(r => {
    const k = r[key] === null || r[key] === undefined || r[key] === '' ? 'Unknown' : String(r[key]);
    if (!m.has(k)) m.set(k, []);
    m.get(k).push(r);
  });
  return m;
}
