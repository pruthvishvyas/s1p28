export function fmtNumber(v, d = 0) {
  if (v === null || v === undefined || v === '' || Number.isNaN(Number(v))) return '\u2014';
  return Number(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
}
export function fmtPct(v, d = 1) {
  if (v === null || v === undefined || v === '' || Number.isNaN(Number(v))) return '\u2014';
  return Number(v).toFixed(d) + '%';
}
export function fmtAuto(v) {
  if (v === null || v === undefined || v === '') return '\u2014';
  if (typeof v === 'number') return Number.isInteger(v) ? fmtNumber(v, 0) : fmtNumber(v, 2);
  return String(v);
}
export function fmtDate(v) {
  if (!v) return '\u2014';
  return String(v).slice(0, 10);
}
export function prettify(key) {
  return String(key).replace(/_/g, ' ').replace(/\s+/g, ' ').trim().replace(/^./, c => c.toUpperCase());
}
export function timeAgo(iso) {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  const mins = Math.max(0, Math.round((Date.now() - t) / 60000));
  if (mins < 2) return 'just now';
  if (mins < 120) return mins + ' minutes ago';
  const hrs = Math.round(mins / 60);
  if (hrs < 48) return hrs + ' hours ago';
  return Math.round(hrs / 24) + ' days ago';
}
export function escapeRegExp(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
