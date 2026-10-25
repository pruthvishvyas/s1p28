export function Sidebar({ title, tabs, active, onSelect, open, badges = {} }) {
  return (
    <aside className={'sidebar' + (open ? ' open' : '')}>
      <div className="sidebar-title">{title}</div>
      {tabs.map(g => (
        <div className="sidebar-group" key={g.outcome}>
          <div className="sidebar-group-label">{g.outcome} - {g.blurb}</div>
          {g.items.map(it => (
            <button key={it.id} className={'sidebar-item' + (active === it.id ? ' active' : '')} onClick={() => onSelect(it.id)}>
              <span>{it.label}</span>
              {badges[it.id] > 0 && <span className="sidebar-count">{badges[it.id]}</span>}
            </button>
          ))}
        </div>
      ))}
    </aside>
  );
}
