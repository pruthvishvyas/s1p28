import { useMemo, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ReferenceLine } from 'recharts';
import { useOutcomeData } from '../../hooks/shared/useContract';
import { useTokens } from '../../hooks/shared/useTheme';
import { ExplorerProvider, useExplorer } from '../../context/ExplorerContext';
import { validateExplorer } from '../../utils/dataValidator';
import { SkeletonCard } from '../shared/SkeletonCard';
import { EmptyState, RUN_HINT } from '../shared/EmptyState';
import { ErrorBoundary } from '../shared/ErrorBoundary';
import { DataTable } from '../shared/DataTable';
import { FilterBar } from './FilterBar';
import { DrillDownPanel } from './DrillDownPanel';
import { calc, groupBy } from './explorerMath';
import { fmtNumber, fmtPct } from '../../utils/formatters';

function fmtMetric(m, v) {
  if (v === null || v === undefined) return '\u2014';
  return m.kind === 'ratio' ? fmtPct(v, 1) : fmtNumber(v, m.decimals ?? 0);
}

function DimChart({ ex, rows, dimKey, metric, big }) {
  const tk = useTokens();
  const { filters, setFilter, setDrill } = useExplorer();
  const dim = ex.dims.find(d => d.key === dimKey);
  const data = useMemo(() => {
    const g = groupBy(rows, dimKey);
    let arr = [...g.entries()].map(([name, rs]) => ({ name, value: calc(rs, metric) }));
    if (dimKey === 'date') arr.sort((a, b) => a.name.localeCompare(b.name));
    else arr = arr.sort((a, b) => b.value - a.value).slice(0, 15);
    return arr;
  }, [rows, dimKey, metric]);
  if (!dim || !metric) return null;
  const axis = { fill: tk.text2, fontSize: 12 };
  const tip = { background: tk.surface, border: '1px solid ' + tk.border, borderRadius: 8 };
  const picked = filters[dimKey];
  const click = d => {
    const nm = d && d.payload && d.payload.name !== undefined ? d.payload.name : (d && d.name);
    if (nm === undefined) return;
    setFilter(dimKey, picked === nm ? '' : nm);
    setDrill({ dimKey, value: nm });
  };
  const h = big ? 350 : 260;
  return (
    <div className="card chart-card">
      <h3>{metric.label} by {dim.label.toLowerCase()}</h3>
      {data.length === 0 ? <EmptyState message="No records match the current filters." /> : (
        <ErrorBoundary>
          <ResponsiveContainer width="100%" height={h}>
            {dimKey === 'date' ? (
              <LineChart data={data} margin={{ top: 10, right: 20, bottom: 30, left: 10 }} onClick={st => st && st.activeLabel && click({ name: st.activeLabel })}>
                <CartesianGrid strokeDasharray="3 3" stroke={tk.border} />
                <XAxis dataKey="name" tick={axis} minTickGap={24} /><YAxis tick={axis} />
                <Tooltip contentStyle={tip} formatter={v => fmtMetric(metric, v)} />
                <ReferenceLine y={0} stroke={tk.border} />
                <Line type="monotone" dataKey="value" stroke={tk.accent} strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            ) : (
              <BarChart data={data} margin={{ top: 10, right: 20, bottom: 40, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={tk.border} />
                <XAxis dataKey="name" tick={{ fill: tk.text2, fontSize: 11 }} interval={0} angle={data.length > 5 ? -25 : 0} textAnchor={data.length > 5 ? 'end' : 'middle'} height={data.length > 5 ? 60 : 30} />
                <YAxis tick={axis} />
                <Tooltip contentStyle={tip} formatter={v => fmtMetric(metric, v)} />
                <ReferenceLine y={0} stroke={tk.border} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} onClick={click} cursor="pointer" isAnimationActive={false}>
                  {data.map((d, i) => <Cell key={i} fill={d.value < 0 ? tk.danger : tk.accent} fillOpacity={picked && picked !== d.name ? 0.3 : 1} />)}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </ErrorBoundary>
      )}
      <p className="muted small">Click a bar to filter every chart and open the detail panel.</p>
    </div>
  );
}

function ExplorerBody({ ex }) {
  const { filters, dateFrom, dateTo, activeFilters } = useExplorer();
  const dimsAll = [{ key: 'date', label: 'Day' }, ...ex.dims];
  const exAll = { ...ex, dims: dimsAll };
  const [dimKey, setDimKey] = useState(ex.dims[0] ? ex.dims[0].key : 'date');
  const [metricKey, setMetricKey] = useState((ex.metrics.find(m => m.key === 'profit') || ex.metrics[0]).key);
  const metric = ex.metrics.find(m => m.key === metricKey) || ex.metrics[0];

  const rows = useMemo(() => ex.rows.filter(r => {
    if (dateFrom && r.date && r.date < dateFrom) return false;
    if (dateTo && r.date && r.date > dateTo) return false;
    return Object.entries(filters).every(([k, v]) => String(r[k]) === String(v));
  }), [ex, filters, dateFrom, dateTo]);
  // rows used by the drill panel ignore nothing: it shows the same filtered view
  const others = ex.dims.filter(d => d.key !== dimKey && Array.isArray(d.values) && d.values.length <= 12).slice(0, 2);
  const kpiMetrics = ['routes', 'profit', 'margin', 'loss'].map(k => ex.metrics.find(m => m.key === k)).filter(Boolean);
  const tableCols = [
    { key: 'id', label: 'ID', mono: true }, { key: 'date', label: 'Date' },
    ...ex.dims.filter(d => Array.isArray(d.values) && d.values.length <= 40).slice(0, 4).map(d => ({ key: d.key, label: d.label })),
    ...ex.metrics.filter(m => m.kind === 'sum' && ['profit', 'revenue'].includes(m.key)).map(m => ({ key: m.field, label: m.label, mono: true, format: v => fmtNumber(v, 0) }))
  ].filter(c => rows.length === 0 || c.key in rows[0] || c.key === 'id');

  const copySummary = () => {
    const lines = ['Explorer summary', 'Records: ' + rows.length, 'Filters: ' + (activeFilters ? JSON.stringify(filters) + (dateFrom ? ' from ' + dateFrom : '') + (dateTo ? ' to ' + dateTo : '') : 'none')];
    ex.metrics.forEach(m => lines.push(m.label + ': ' + fmtMetric(m, calc(rows, m))));
    const text = lines.join('\n');
    try {
      navigator.clipboard.writeText(text).catch(() => window.prompt('Copy this summary:', text));
    } catch (e) {
      window.prompt('Copy this summary:', text);
    }
  };

  return (
    <div>
      <FilterBar ex={exAll} />
      <p className="muted small">{ex.note}</p>
      <div className="kpi-grid" style={{ marginBottom: 16 }}>
        {kpiMetrics.map(m => {
          const v = calc(rows, m);
          return <div key={m.key} className="kpi-card small"><div className="kpi-label">{m.label}</div><div className={'kpi-value' + (v < 0 ? ' neg' : '')}>{fmtMetric(m, v)}</div></div>;
        })}
      </div>
      <div className="explorer-layout">
        <div className="explorer-side">
          <div className="label-strong" style={{ marginTop: 0 }}>Measure</div>
          {ex.metrics.map(m => <button key={m.key} className={'chip' + (metricKey === m.key ? ' active' : '')} onClick={() => setMetricKey(m.key)}>{m.label}</button>)}
          <div className="label-strong">Group by</div>
          {dimsAll.map(d => <button key={d.key} className={'chip' + (dimKey === d.key ? ' active' : '')} onClick={() => setDimKey(d.key)}>{d.label}</button>)}
          <button className="btn secondary no-print" style={{ marginTop: 12 }} onClick={copySummary}>Copy summary</button>
        </div>
        <div>
          <DimChart ex={exAll} rows={rows} dimKey={dimKey} metric={metric} big />
          <div className="grid grid-2" style={{ marginTop: 16 }}>
            {others.map(d => <DimChart key={d.key} ex={exAll} rows={rows} dimKey={d.key} metric={metric} />)}
          </div>
        </div>
      </div>
      <h3 className="section-title">Records in this view</h3>
      <DataTable rows={rows} columns={tableCols} pageSize={20} />
      <DrillDownPanel ex={exAll} rows={rows} />
    </div>
  );
}

export function InteractiveExplorer() {
  const { data, loading, error } = useOutcomeData('explorer.routes');
  if (loading) return <SkeletonCard height={200} count={3} />;
  const v = validateExplorer(data);
  if (!v.valid || error) return <EmptyState message="The explorer has no data yet." action={v.error || error || RUN_HINT} />;
  return <ExplorerProvider><ExplorerBody ex={v.data} /></ExplorerProvider>;
}
