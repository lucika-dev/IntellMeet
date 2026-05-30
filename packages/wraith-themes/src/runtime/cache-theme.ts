const THEME_CSS_KEY =
  'wraith-theme-css';

export function setCachedThemeCss(
  css: string
) {
  localStorage.setItem(
    THEME_CSS_KEY,
    css
  );
}

export function getCachedThemeCss() {
  return localStorage.getItem(
    THEME_CSS_KEY
  );
}