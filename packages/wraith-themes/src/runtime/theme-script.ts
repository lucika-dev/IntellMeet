export const THEME_SCRIPT = `
(() => {
  try {
    const css =
      localStorage.getItem(
        'wraith-theme-css'
      );

    if (!css) {
      return;
    }

    let style =
      document.getElementById(
        'wraith-theme'
      );

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

    style.textContent = css;

    console.log(
      '[THEME_SCRIPT] restored cached theme'
    );
  } catch (error) {
    console.error(
      '[THEME_SCRIPT] failed',
      error
    );
  }
})();
`;