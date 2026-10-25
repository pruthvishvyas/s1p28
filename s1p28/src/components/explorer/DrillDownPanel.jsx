import { useExplorer } from '../../context/ExplorerContext';
import { fmtNumber, fmtPct } from '../../utils/formatters';
import { calc } from './explorerMath';

export function DrillDownPanel({ ex, rows }) {
  const { drill, setDrill } = useExplorer();
  const open = Boolean(drill);
  let body = null;
  if (open) {
    const dim = ex.dims.find(d => d.key === drill.dimKey) || { label: drill.dimKey };
    const sub = rows.filter(r => String(r[drill.dimKey]) === String(drill.value));
    const other = ex.dims.find(d => d.key !== drill.dimKey && d.key !== 'date' && Array.isArray(d.values) && d.values.length <= 12);
    const breakdown = [];
    if (other) {
      const m = {};
      sub.forEach(r => { const k = String(r[other.key]); (m[k] = m[k] || []).push(r); });
      Object.entries(m).forEach(([k, rs]) => breakdown.push({ k, n: rs.length, profit: calc(rs, ex.metrics.find(x => x.key === 'profit')) }));
      breakdown.sort((a, b) => b.n - a.n);
    }
    body = (
      <div>
        <h3>{dim.label}: {drill.value}</h3>
        <p className="muted small">{fmtNumber(sub.length, 0)} records in the current view</p>
        {ex.metrics.map(m => {
          const val = calc(sub, m);
          return <div key={m.key} className="kpi-card small" style={{ marginBottom: 8 }}><div className="kpi-label">{m.label}</div><div className={'kpi-value' + (val < 0 ? ' neg' : '')}>{m.kind === 'ratio' ? fmtPct(val, 1) : fmtNumber(val, m.decimals ?? 0)}</div></div>;
        })}
        {other && breakdown.length > 0 && (
          <>
            <h4 style={{ margin: '16px 0 8px' }}>Split by {other.label.toLowerCase()}</h4>
            <table className="data"><tbody>{breakdown.slice(0, 6).map(b => <tr key={b.k}><td>{b.k}</td><td className="mono">{fmtNumber(b.n, 0)}</td>{breakdown[0].profit !== null && <td className={'mono ' + (b.profit < 0 ? 'neg' : '')}>{fmtNumber(b.profit, 0)}</td>}</tr>)}</tbody></table>
          </>
        )}
      </div>
    );
  }
  return (
    <aside className={'drill-panel' + (open ? ' open' : '')} aria-hidden={!open}>
      <button className="btn secondary" onClick={() => setDrill(null)}>Close {'\u00D7'}</button>
      {body}
    </aside>
  );
}
