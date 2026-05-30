import {
  getCachedThemeCss,
} from './cache-theme';

export function loadTheme() {
  const cachedCss =
    getCachedThemeCss();

  console.log(
    '[loadTheme] cached css',
    cachedCss
  );

  if (!cachedCss) {
    console.log(
      '[loadTheme] no cached theme'
    );

    return;
  }

  let style =
    document.getElementById(
      'wraith-theme'
    ) as HTMLStyleElement | null;

  if (!style) {
    style =
      document.createElement(
        'style'
      );

    style.id =
      'wraith-theme';

    document.head.appendChild(
      style
    );
  }

  style.textContent =
    cachedCss;

  console.log(
    '[loadTheme] restored cached theme'
  );
}