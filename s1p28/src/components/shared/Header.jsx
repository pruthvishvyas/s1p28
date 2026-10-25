import { ThemeToggle } from './ThemeToggle';
import { useSummary } from '../../hooks/shared/useRunLog';
import { timeAgo } from '../../utils/formatters';

export function Header({ title, sub, onMenu }) {
  const { data } = useSummary();
  const ago = data && !Array.isArray(data) ? timeAgo(data.last_run) : null;
  return (
    <header className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="menu-btn" onClick={onMenu} aria-label="Menu">{'\u2630'}</button>
        <div>
          <div className="header-title">{title}</div>
          {sub && <div className="header-sub">{sub}</div>}
        </div>
      </div>
      <div className="header-right">
        {ago && <span className="header-sub">Last updated: {ago}</span>}
        <ThemeToggle />
      </div>
    </header>
  );
}
