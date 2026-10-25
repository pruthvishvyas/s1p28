import { useMemo, useState } from 'react';
import { fmtAuto } from '../../utils/formatters';

function cmp(a, b) {
  if (a === null || a === undefined || a === '') return 1;
  if (b === null || b === undefined || b === '') return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b));
}

export function DataTable({ rows, columns, pageSize = 25, searchable = true, defaultSort = null, onRowClick, empty = 'No rows to show.' }) {
  const [q, setQ] = useState('');
  const [sort, setSort] = useState(defaultSort);
  const [limit, setLimit] = useState(pageSize);

  const filtered = useMemo(() => {
    let out = Array.isArray(rows) ? rows : [];
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      out = out.filter(r => columns.some(c => String(r[c.key] ?? '').toLowerCase().includes(s)));
    }
    if (sort && sort.key) {
      const dir = sort.dir === 'desc' ? -1 : 1;
      out = [...out].sort((a, b) => {
        const av = a[sort.key], bv = b[sort.key];
        if (av === null || av === undefined || av === '') return 1;
        if (bv === null || bv === undefined || bv === '') return -1;
        return cmp(av, bv) * dir;
      });
    }
    return out;
  }, [rows, columns, q, sort]);

  const toggleSort = key => setSort(prev => (prev && prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }));

  return (
    <div>
      <div className="table-tools">
        {searchable ? <input type="search" placeholder="Search..." value={q} onChange={e => { setQ(e.target.value); setLimit(pageSize); }} /> : <span />}
        <span className="muted small">{filtered.length} rows</span>
      </div>
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              {columns.map(c => (
                <th key={c.key} onClick={() => toggleSort(c.key)}>
                  {c.label}{sort && sort.key === c.key ? (sort.dir === 'asc' ? ' \u25B2' : ' \u25BC') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, limit).map((r, i) => (
              <tr key={i} className={onRowClick ? 'clickable' : ''} onClick={onRowClick ? () => onRowClick(r) : undefined}>
                {columns.map(c => (
                  <td key={c.key} className={c.mono ? 'mono' : ''}>
                    {c.render ? c.render(r) : (c.format ? c.format(r[c.key]) : fmtAuto(r[c.key]))}
                  </td>
                ))}
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={columns.length} className="muted">{empty}</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {filtered.length > limit && (
        <p><button className="btn secondary" onClick={() => setLimit(limit + pageSize)}>Show more ({filtered.length - limit} left)</button></p>
      )}
    </div>
  );
}
