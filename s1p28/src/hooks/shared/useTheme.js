import { useState, useEffect } from 'react';
import { readTokens } from '../../utils/colors';

// Returns concrete colour values (from the CSS tokens) and refreshes whenever the theme changes
export function useTokens() {
  const [tokens, setTokens] = useState(() => readTokens());
  useEffect(() => {
    const update = () => setTokens(readTokens());
    update();
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);
  return tokens;
}

export function useTheme() {
  const [theme, setTheme] = useState(() => document.documentElement.getAttribute('data-theme') || 'light');
  const toggle = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) { /* ignore */ }
    setTheme(next);
  };
  return { theme, toggle };
}
