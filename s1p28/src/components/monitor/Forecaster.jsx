import { useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useForecast } from '../../hooks/monitor/useForecast';
import { useTokens } from '../../hooks/shared/useTheme';
import { validateForecast } from '../../utils/dataValidator';
import { SkeletonCard } from '../shared/SkeletonCard';
import { EmptyState, RUN_HINT } from '../shared/EmptyState';
import { ErrorBoundary } from '../shared/ErrorBoundary';
import { DataTable } from '../shared/DataTable';
import { fmtNumber, fmtDate, prettify } from '../../utils/formatters';

export function Forecaster() {
  const tk = useTokens();
  const { data: raw, loading, error } = useForecast();
  const [metric, setMetric] = useState(null);
  const [day, setDay] = useState('1');
  const [busy, setBusy] = useState(false);
  const [answer, setAnswer] = useState(null);
  const [askErr, setAskErr] = useState(null);
  if (loading) return <SkeletonCard height={300} count={2} />;
  const v = validateForecast(raw);
  if (!v.valid || error) return <EmptyState message="No forecast available yet." action={v.error || error || RUN_HINT} />;
  const f = v.data;
  const metrics = Object.keys(f.rows[0]).filter(k => k.endsWith('_forecast')).map(k => k.replace('_forecast', ''));
  const m = metric && metrics.includes(metric) ? metric : (metrics.includes('profit') ? 'profit' : metrics[0]);
  const chart = f.rows.map(r => ({ date: fmtDate(r.date), forecast: r[m + '_forecast'], lower: r[m + '_lower'], upper: r[m + '_upper'] }));
  const info = (f.model_info && f.model_info[m]) || null;
  const axis = { fill: tk.text2, fontSize: 12 };
  const horizon = f.rows.length;

  async function ask() {
    setBusy(true); setAnswer(null); setAskErr(null);
    const n = Number(day);
    if (!Number.isFinite(n) || n < 1) {
      setAskErr('Enter a day number between 1 and ' + horizon);
      setBusy(false);
      return;
    }
    let result = null;
    try {
      const res = await fetch('/api', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ input: n, metric: m }) });
      const text = await res.text();
      let body = null;
      try { body = JSON.parse(text); } catch (e) { body = null; }
      if (res.ok && body && body.prediction !== undefined && body.prediction !== null) result = { ...body, via: 'the forecast service' };
    } catch (e) { /* service not reachable (for example local preview): use the values already on this page */ }
    if (!result) {
      const idx = Math.min(Math.max(Math.round(n), 1), horizon) - 1;
      const r = f.rows[idx];
      result = { prediction: r[m + '_forecast'], range_low: r[m + '_lower'], range_high: r[m + '_upper'], nearest_key: idx + 1, via: 'the values on this page' };
    }
    setAnswer(result);
    setBusy(false);
  }

  return (
    <div>
      <div className="chips">
        {metrics.map(x => <button key={x} className={'chip' + (m === x ? ' active' : '')} onClick={() => setMetric(x)}>{prettify(x)}</button>)}
      </div>
      <div className="card chart-card">
        <h3>{prettify(m)} - next {horizon} days (with likely range)</h3>
        <ErrorBoundary>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chart} margin={{ top: 10, right: 20, bottom: 40, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={tk.border} />
              <XAxis dataKey="date" tick={axis} minTickGap={20} /><YAxis tick={axis} />
              <Tooltip contentStyle={{ background: tk.surface, border: '1px solid ' + tk.border, borderRadius: 8 }} formatter={x => fmtNumber(x, 1)} />
              <Legend />
              <Line type="monotone" dataKey="upper" name="Upper range" stroke={tk.text2} strokeDasharray="4 4" dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="forecast" name="Forecast" stroke={tk.accent} strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="lower" name="Lower range" stroke={tk.text2} strokeDasharray="4 4" dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </ErrorBoundary>
        {info && <p className="muted small">Method: {prettify(info.model)}. Typical error: about {fmtNumber(info.mae, 1)} per day{info.validated_on_holdout ? ' (checked on recent days)' : ' (limited history - treat as a guide)'}.</p>}
      </div>
      <h3 className="section-title">Ask the forecaster</h3>
      <div className="card">
        <p className="small muted" style={{ marginTop: 0 }}>Pick a day (1 = tomorrow) and see the predicted {prettify(m).toLowerCase()}.</p>
        <input type="number" min={1} max={horizon} value={day} onChange={e => setDay(e.target.value)} style={{ width: 100 }} />{' '}
        <button className="btn" onClick={ask} disabled={busy}>{busy ? 'Working...' : 'Get forecast'}</button>
        {answer && (
          <p>Day {answer.nearest_key}: <b className="mono">{fmtNumber(answer.prediction, 1)}</b>
            {answer.range_low !== null && answer.range_low !== undefined && <span className="muted small"> (likely between {fmtNumber(answer.range_low, 1)} and {fmtNumber(answer.range_high, 1)})</span>}
            <span className="muted small"> - from {answer.via}</span></p>
        )}
        {askErr && <p className="neg small">{askErr}</p>}
      </div>
      <h3 className="section-title">Day by day</h3>
      <DataTable rows={f.rows} searchable={false} pageSize={20}
        columns={[{ key: 'date', label: 'Date', format: fmtDate }, ...metrics.flatMap(x => [{ key: x + '_forecast', label: prettify(x), mono: true, format: y => fmtNumber(y, 1) }])]} />
    </div>
  );
}
