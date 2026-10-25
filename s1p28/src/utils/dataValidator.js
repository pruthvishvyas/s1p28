// Every validator returns { valid, data, error }. Shapes follow frontend_contract.json outputs.
function placeholder(raw) {
  if (raw && !Array.isArray(raw) && typeof raw === 'object' && typeof raw.status === 'string' && ['skipped', 'failed'].includes(raw.status.toLowerCase())) {
    return 'This step was ' + raw.status + (raw.reason ? ': ' + raw.reason : '.');
  }
  return null;
}
const isObj = v => v && typeof v === 'object' && !Array.isArray(v);
const bad = (error, data = null) => ({ valid: false, data, error });

export function validateKPIs(raw) {
  const ph = placeholder(raw); if (ph) return bad(ph);
  if (!isObj(raw)) return bad('KPI data has an unexpected shape');
  const cards = Array.isArray(raw.cards) ? raw.cards.filter(k => k && typeof k.label === 'string' && k.value !== undefined) : [];
  if (cards.length === 0) return bad('No valid KPI entries');
  return { valid: true, data: { cards, raw }, error: null };
}

export function validateChartData(raw) {
  const ph = placeholder(raw); if (ph) return bad(ph);
  if (!isObj(raw) || !Array.isArray(raw.data)) return bad('Chart data has an unexpected shape');
  const pts = raw.data.filter(d => d && d.label !== undefined && Number.isFinite(Number(d.value))).map(d => ({ label: String(d.label), value: Number(d.value) }));
  if (pts.length === 0) return bad('This chart has no data points');
  return { valid: true, data: { ...raw, data: pts }, error: null };
}

export function validateInsights(raw) {
  const ph = placeholder(raw); if (ph) return bad(ph, []);
  if (!Array.isArray(raw)) return bad('Insights must be a list', []);
  const cleaned = raw.filter(i => i && i.finding && i.severity);
  return cleaned.length ? { valid: true, data: cleaned, error: null } : bad('No valid insights', []);
}

export function validateForecast(raw) {
  const ph = placeholder(raw); if (ph) return bad(ph);
  if (!isObj(raw)) return bad('Invalid forecast data');
  const rows = Array.isArray(raw.rows) ? raw.rows.filter(r => r && r.date) : [];
  if (rows.length === 0) {
    return bad(raw.status && raw.status !== 'ok' ? 'Forecast not available (' + String(raw.status).replace(/_/g, ' ') + ' - at least 7 days of history are needed).' : 'No forecast rows yet');
  }
  return { valid: true, data: { ...raw, rows }, error: null };
}

export function validateAnomalies(raw) {
  const ph = placeholder(raw); if (ph) return bad(ph);
  if (!isObj(raw) || !Array.isArray(raw.routes)) return bad('Anomaly data has an unexpected shape');
  return { valid: true, data: raw, error: null };
}

export function validateSegments(raw) {
  const ph = placeholder(raw); if (ph) return bad(ph);
  if (!isObj(raw) || !Array.isArray(raw.segments) || raw.segments.length === 0) return bad('No segments available');
  return { valid: true, data: raw, error: null };
}

export function validateRecommendations(raw) {
  const ph = placeholder(raw); if (ph) return bad(ph);
  if (!isObj(raw)) return bad('Recommendation data has an unexpected shape');
  const strategic = Array.isArray(raw.strategic) ? raw.strategic : [];
  const actions = Array.isArray(raw.route_actions) ? raw.route_actions : [];
  if (!strategic.length && !actions.length) return bad('No recommendations yet');
  return { valid: true, data: { strategic, route_actions: actions }, error: null };
}

export function validateGoals(raw) {
  const ph = placeholder(raw); if (ph) return bad(ph);
  if (!isObj(raw)) return bad('Goals have an unexpected shape');
  const entries = Object.entries(raw).filter(([, v]) => isObj(v));
  return entries.length ? { valid: true, data: entries, error: null } : bad('No goals configured');
}

export function validateProgress(raw) {
  const ph = placeholder(raw); if (ph) return bad(ph);
  if (!isObj(raw) || !Array.isArray(raw.goals)) return bad('Goal progress has an unexpected shape');
  return { valid: true, data: raw, error: null };
}

export function validateAlerts(raw) {
  const ph = placeholder(raw); if (ph) return bad(ph);
  if (!isObj(raw) || !Array.isArray(raw.alerts)) return bad('Alert data has an unexpected shape');
  return { valid: true, data: raw, error: null };
}

export function validateSimulation(raw) {
  const ph = placeholder(raw); if (ph) return bad(ph);
  if (!isObj(raw) || !Array.isArray(raw.results) || raw.results.length === 0 || !raw.variable) return bad('Simulation data has an unexpected shape');
  return { valid: true, data: raw, error: null };
}

export function validateExplorer(raw) {
  const ph = placeholder(raw); if (ph) return bad(ph);
  if (!isObj(raw) || !Array.isArray(raw.rows) || raw.rows.length === 0 || !Array.isArray(raw.dims) || !Array.isArray(raw.metrics)) return bad('Explorer data has an unexpected shape');
  return { valid: true, data: raw, error: null };
}
