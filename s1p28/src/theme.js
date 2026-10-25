// Runs before React mounts (the same logic is inlined in index.html <head> to avoid any flash of the wrong theme)
(function () {
  try {
    var saved = localStorage.getItem('theme');
    var preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', saved || preferred);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
