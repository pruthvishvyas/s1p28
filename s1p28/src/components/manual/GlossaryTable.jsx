import { escapeRegExp } from '../../utils/formatters';

export function GlossaryTable({ entries, q }) {
  const s = (q || '').toLowerCase();
  const list = s ? entries.filter(([t, d]) => (t + ' ' + d).toLowerCase().includes(s)) : entries;
  return (
    <div className="table-wrap">
      <table className="data">
        <thead><tr><th>Word</th><th>What it means</th></tr></thead>
        <tbody>
          {list.map(([t, d]) => <tr key={t}><td><b>{t}</b></td><td>{d}</td></tr>)}
          {list.length === 0 && <tr><td colSpan={2} className="muted">No matching words.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
