import { useExplorer } from '../../context/ExplorerContext';

export function FilterBar({ ex }) {
  const { filters, setFilter, clearFilters, activeFilters, dateFrom, dateTo, setDateFrom, setDateTo } = useExplorer();
  const dims = ex.dims.filter(d => d.key !== 'date' && Array.isArray(d.values));
  return (
    <div className="explorer-bar">
      <span className="small muted">From</span>
      <input type="date" value={dateFrom} min={ex.date_min} max={ex.date_max} onChange={e => setDateFrom(e.target.value)} />
      <span className="small muted">to</span>
      <input type="date" value={dateTo} min={ex.date_min} max={ex.date_max} onChange={e => setDateTo(e.target.value)} />
      {dims.slice(0, 6).map(d => (
        <select key={d.key} value={filters[d.key] || ''} onChange={e => setFilter(d.key, e.target.value)} title={d.label}>
          <option value="">{d.label}: All</option>
          {d.values.slice(0, 200).map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      ))}
      {Object.entries(filters).map(([k, v]) => (
        <span className="filter-chip" key={k}>{(ex.dims.find(d => d.key === k) || {}).label || k}: {v}<button onClick={() => setFilter(k, '')} aria-label="Remove filter">{'\u00D7'}</button></span>
      ))}
      <button className="btn secondary" onClick={clearFilters} disabled={activeFilters === 0}>Clear filters {activeFilters > 0 ? '(' + activeFilters + ')' : ''}</button>
    </div>
  );
}
