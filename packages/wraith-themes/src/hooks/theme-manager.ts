import { THEMES }
  from '../registry/theme-urls';

import { setCachedThemeCss }
  from '../runtime/cache-theme';

import { convertThemeToCss }
  from '../runtime/convert-theme';

const ACTIVE_THEME_KEY =
  'wraith-active-theme';

async function fetchTheme(
  url: string
) {
  const response =
    await fetch(url);

  if (!response.ok) {
    throw new Error(
      'Theme fetch failed'
    );
  }

  return response.json();
}

function injectTheme(
  css: string
) {
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

  if (
    style.textContent !== css
  ) {
    style.textContent = css;
  }
}

export const themeManager = {
  async setTheme(
    themeName: keyof typeof THEMES
  ) {
    try {
      console.log(
        '[themeManager] applying',
        themeName
      );

      const url =
        THEMES[themeName];

      const theme =
        await fetchTheme(
          url
        );

      console.log(
        '[themeManager] fetched theme'
      );

      const css =
        convertThemeToCss(
          theme
        );

      console.log(
        '[themeManager] converted css'
      );

      injectTheme(css);

      console.log(
        '[themeManager] injected css'
      );

      setCachedThemeCss(
        css
      );

      const current =
        localStorage.getItem(
          ACTIVE_THEME_KEY
        );

      if (current !== themeName) {
        localStorage.setItem(
          ACTIVE_THEME_KEY,
          themeName
        );
      }

      console.log(
        '[themeManager] saved',
        themeName
      );
    } catch (error) {
      console.error(
        '[themeManager] failed',
        error
      );
    }
  },

  restoreTheme() {
    const css =
      localStorage.getItem(
        'wraith-theme-css'
      );

    if (!css) {
      console.log(
        '[themeManager] no cached css'
      );

      return;
    }

    injectTheme(css);

    console.log(
      '[themeManager] restored cached css'
    );
  },

  themes: THEMES,
};