import { useTheme } from '../../hooks/shared/useTheme';

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button className="theme-toggle" onClick={toggle} aria-label="Toggle theme" title="Switch between light and dark">
      {theme === 'light' ? '\uD83C\uDF19' : '\u2600\uFE0F'}
    </button>
  );
}
