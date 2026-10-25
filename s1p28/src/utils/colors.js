export function getToken(name, fallback = '#888888') {
  try {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  } catch (e) {
    return fallback;
  }
}
export function readTokens() {
  return {
    accent: getToken('--color-accent'),
    danger: getToken('--color-danger'),
    warning: getToken('--color-warning'),
    success: getToken('--color-success'),
    border: getToken('--color-border'),
    text: getToken('--color-text-primary'),
    text2: getToken('--color-text-secondary'),
    surface: getToken('--color-surface'),
    palette: [1, 2, 3, 4, 5, 6].map(i => getToken('--chart-' + i))
  };
}
