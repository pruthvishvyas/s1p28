import { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ReferenceLine } from 'recharts';
import { useSimulations } from '../../hooks/decide/useSimulations';
import { useData } from '../../hooks/useData';
import { useTokens } from '../../hooks/shared/useTheme';
import { validateSimulation } from '../../utils/dataValidator';
import { SkeletonCard } from '../shared/SkeletonCard';
import { EmptyState, RUN_HINT } from '../shared/EmptyState';
import { ErrorBoundary } from '../shared/ErrorBoundary';
import { fmtNumber, fmtPct, prettify } from '../../utils/formatters';

const VAR_LABELS = { reduction_pct: 'Reduction (%)', price_change_pct: 'Price change (%)', routes_consolidated_pct: 'Routes merged (%)' };

function ScenarioView({ path }) {
  const tk = useTokens();
  const { data, loading, error } = useData(path);
  const [idx, setIdx] = useState(0);
  const [elas, setElas] = useState(null);
  if (loading) return <SkeletonCard height={300} />;
  const v = validateSimulation(data);
  if (!v.valid || error) return <EmptyState message="This scenario is not available yet." action={v.error || error || RUN_HINT} />;
  const sim = v.data;
  const variable = sim.variable;
  const hasElas = sim.results.some(r => r.elasticity !== undefined);
  const elasVals = hasElas ? [...new Set(sim.results.map(r => r.elasticity))] : [];
  const e = hasElas ? (elas === null ? elasVals[0] : elas) : null;
  const rows = hasElas ? sim.results.filter(r => r.elasticity === e) : sim.results;
  const i = Math.min(idx, rows.length - 1);
  const cur = rows[i];
  const base = sim.baseline || {};
  const chart = rows.map((r, k) => ({ x: String(r[variable]), change: Number(r.profit_change) || 0, k }));
  const axis = { fill: tk.text2, fontSize: 12 };
  return (
    <div>
      {sim.description && <p className="muted">{sim.description}</p>}
      <div className="card" style={{ marginBottom: 16 }}>
        <label className="label-strong" style={{ marginTop: 0 }}>{VAR_LABELS[variable] || prettify(variable)}: <b className="mono">{cur[variable]}</b></label>
        <input type="range" min={0} max={rows.length - 1} step={1} value={i} onChange={ev => setIdx(Number(ev.target.value))} />
        {hasElas && (
          <p className="small">How sensitive is demand to price?{' '}
            <select value={e} onChange={ev => setElas(Number(ev.target.value))}>
              {elasVals.map(x => <option key={x} value={x}>{x === 0 ? 'Not sensitive (0)' : 'Elasticity ' + x}</option>)}
            </select>
          </p>
        )}
      </div>
      <div className="kpi-grid">
        <div className="kpi-card"><div className="kpi-label">Profit today</div><div className="kpi-value">{fmtNumber(base.profit, 0)}</div></div>
        <div className="kpi-card"><div className="kpi-label">Projected profit</div><div className="kpi-value">{fmtNumber(cur.new_profit, 0)}</div></div>
        <div className="kpi-card"><div className="kpi-label">Change</div><div className={'kpi-value ' + (Number(cur.profit_change) < 0 ? 'neg' : 'pos')}>{Number(cur.profit_change) > 0 ? '+' : ''}{fmtNumber(cur.profit_change, 0)}</div></div>
        <div className="kpi-card"><div className="kpi-label">Projected margin</div><div className="kpi-value">{fmtPct(cur.new_margin_pct, 1)}</div><div className="kpi-note">Today: {fmtPct(base.margin_pct, 1)}</div></div>
        {cur.cost_saved !== undefined && <div className="kpi-card"><div className="kpi-label">Cost saved</div><div className="kpi-value">{fmtNumber(cur.cost_saved, 0)}</div></div>}
      </div>
      <h3 className="section-title">Profit change across the range</h3>
      <div className="card"><ErrorBoundary>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chart} margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={tk.border} />
            <XAxis dataKey="x" tick={axis} /><YAxis tick={axis} />
            <Tooltip contentStyle={{ background: tk.surface, border: '1px solid ' + tk.border, borderRadius: 8 }} formatter={x => fmtNumber(x, 0)} />
            <ReferenceLine y={0} stroke={tk.border} />
            <Bar dataKey="change" radius={[4, 4, 0, 0]} isAnimationActive={false}>
              {chart.map((c, k) => <Cell key={k} fill={c.change < 0 ? tk.danger : tk.accent} fillOpacity={k === i ? 1 : 0.45} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ErrorBoundary></div>
      {Array.isArray(sim.assumptions) && sim.assumptions.length > 0 && (
        <><h3 className="section-title">Assumptions</h3><ul className="small muted">{sim.assumptions.map((a, k) => <li key={k}>{a}</li>)}</ul></>
      )}
    </div>
  );
}

export function WhatIfSimulator() {
  const { items, loading, error } = useSimulations();
  const [sel, setSel] = useState(null);
  if (loading) return <SkeletonCard height={200} count={2} />;
  if (error || items.length === 0) return <EmptyState message="No what-if scenarios available yet." action={error || RUN_HINT} />;
  const cur = items.find(x => x.id === sel) || items[0];
  return (
    <div>
      <div className="chips">
        {items.map(x => <button key={x.id} className={'chip' + (cur.id === x.id ? ' active' : '')} onClick={() => setSel(x.id)}>{prettify(x.id)}</button>)}
      </div>
      <ErrorBoundary key={cur.id}><ScenarioView path={cur.path} /></ErrorBoundary>
    </div>
  );
}
