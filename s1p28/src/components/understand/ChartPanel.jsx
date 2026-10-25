import { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ReferenceLine } from 'recharts';
import { useCharts } from '../../hooks/understand/useCharts';
import { useData } from '../../hooks/useData';
import { useTokens } from '../../hooks/shared/useTheme';
import { validateChartData } from '../../utils/dataValidator';
import { SkeletonCard } from '../shared/SkeletonCard';
import { EmptyState, RUN_HINT } from '../shared/EmptyState';
import { ErrorBoundary } from '../shared/ErrorBoundary';
import { fmtNumber } from '../../utils/formatters';

function Heatmap({ chart, tk }) {
  const parsed = chart.data.map(d => { const p = d.label.split(' | '); return { r: p[0], c: p.slice(1).join(' | ') || '-', v: d.value }; });
  const rows = [...new Set(parsed.map(p => p.r))];
  const cols = [...new Set(parsed.map(p => p.c))];
  const max = Math.max(...parsed.map(p => Math.abs(p.v)), 1);
  const get = (r, c) => parsed.find(p => p.r === r && p.c === c);
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="heat">
        <thead><tr><th></th>{cols.map(c => <th key={c}>{c}</th>)}</tr></thead>
        <tbody>
          {rows.map(r => (
            <tr key={r}>
              <th style={{ textAlign: 'left' }}>{r}</th>
              {cols.map(c => {
                const cell = get(r, c);
                const bg = cell ? 'color-mix(in srgb, ' + (cell.v < 0 ? 'var(--color-danger)' : 'var(--color-success)') + ' ' + Math.round(15 + 55 * Math.abs(cell.v) / max) + '%, transparent)' : 'transparent';
                return <td key={c} className="cell" style={{ background: bg }}>{cell ? fmtNumber(cell.v, 1) : '\u2014'}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderChart(chart, tk) {
  const pts = chart.data.map(d => ({ x: d.label, y: d.value }));
  const axis = { fill: tk.text2, fontSize: 12 };
  const tip = { background: tk.surface, border: '1px solid ' + tk.border, borderRadius: 8, color: tk.text };
  const hasNeg = pts.some(p => p.y < 0);
  switch (chart.type) {
    case 'heatmap':
      return <Heatmap chart={chart} tk={tk} />;
    case 'line':
      return (
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={pts} margin={{ top: 10, right: 20, bottom: 40, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={tk.border} />
            <XAxis dataKey="x" tick={axis} minTickGap={24} />
            <YAxis tick={axis} />
            <Tooltip contentStyle={tip} formatter={v => fmtNumber(v, 2)} />
            {hasNeg && <ReferenceLine y={0} stroke={tk.danger} strokeDasharray="4 4" />}
            <Line type="monotone" dataKey="y" stroke={tk.accent} strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      );
    case 'scatter': {
      const sp = pts.map(p => ({ x: Number(p.x), y: p.y })).filter(p => Number.isFinite(p.x));
      return (
        <ResponsiveContainer width="100%" height={350}>
          <ScatterChart margin={{ top: 10, right: 20, bottom: 40, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={tk.border} />
            <XAxis type="number" dataKey="x" name={chart.x_label} tick={axis} />
            <YAxis type="number" dataKey="y" name={chart.y_label} tick={axis} />
            <Tooltip contentStyle={tip} cursor={{ strokeDasharray: '3 3' }} />
            <ReferenceLine y={0} stroke={tk.danger} strokeDasharray="4 4" />
            <Scatter data={sp} fill={tk.accent} isAnimationActive={false} />
          </ScatterChart>
        </ResponsiveContainer>
      );
    }
    default: {
      const horizontal = chart.type !== 'histogram' && (pts.length > 8 || pts.some(p => p.x.length > 14));
      if (horizontal) {
        const h = Math.max(350, pts.length * 30 + 60);
        return (
          <ResponsiveContainer width="100%" height={h}>
            <BarChart data={pts} layout="vertical" margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={tk.border} />
              <XAxis type="number" tick={axis} />
              <YAxis type="category" dataKey="x" tick={{ fill: tk.text2, fontSize: 11 }} width={170} />
              <Tooltip contentStyle={tip} formatter={v => fmtNumber(v, 2)} />
              <Bar dataKey="y" radius={[0, 4, 4, 0]} isAnimationActive={false}>
                {pts.map((p, i) => <Cell key={i} fill={p.y < 0 ? tk.danger : tk.accent} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      }
      return (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={pts} margin={{ top: 10, right: 20, bottom: 40, left: 10 }} barCategoryGap={chart.type === 'histogram' ? 1 : '20%'}>
            <CartesianGrid strokeDasharray="3 3" stroke={tk.border} />
            <XAxis dataKey="x" tick={axis} interval={chart.type === 'histogram' ? 'preserveStartEnd' : 0} />
            <YAxis tick={axis} />
            <Tooltip contentStyle={tip} formatter={v => fmtNumber(v, 2)} />
            <Bar dataKey="y" radius={[4, 4, 0, 0]} isAnimationActive={false}>
              {pts.map((p, i) => <Cell key={i} fill={chart.type === 'histogram' && Number(p.x) < 0 ? tk.danger : (p.y < 0 ? tk.danger : tk.accent)} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );
    }
  }
}

function ChartCard({ entry, path }) {
  const tk = useTokens();
  const { data, loading, error } = useData(path);
  return (
    <div className="card chart-card hoverable">
      <div className="card-head">
        <h3>{entry.title}</h3>
        <span className="badge badge-neutral">{String(entry.outcome || '').toLowerCase()}</span>
      </div>
      {data && data.question && <p className="muted small" style={{ marginTop: 0 }}>{data.question}</p>}
      {loading ? <SkeletonCard height={350} /> : (() => {
        const v = validateChartData(data);
        if (!v.valid || error) return <EmptyState message={v.error || error} action={RUN_HINT} />;
        return <ErrorBoundary>{renderChart(v.data, tk)}</ErrorBoundary>;
      })()}
      {data && data.x_label && !loading && <p className="muted small">Horizontal: {data.x_label} | Vertical: {data.y_label}</p>}
    </div>
  );
}

export function ChartPanel({ outcome }) {
  const { data, loading, error, chartPath } = useCharts();
  if (loading) return <SkeletonCard height={350} count={2} />;
  const list = Array.isArray(data) ? data.filter(c => c && c.file && (!outcome || String(c.outcome).toUpperCase() === outcome.toUpperCase())) : [];
  if (error || list.length === 0) {
    return <EmptyState message="No charts available yet." action={error || RUN_HINT} />;
  }
  return (
    <div className="grid grid-2">
      {list.map(c => <ChartCard key={c.id || c.file} entry={c} path={chartPath(c)} />)}
    </div>
  );
}
