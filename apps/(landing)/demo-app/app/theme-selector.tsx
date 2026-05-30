'use client';

import {
  useEffect,
  useState,
} from 'react';

import {
  themeManager,
} from '@wraith/themes';

const ACTIVE_THEME_KEY =
  'wraith-active-theme';

export function ThemeSelector() {
  const [selectedTheme, setSelectedTheme] =
    useState('default');

  useEffect(() => {
    const syncTheme = () => {
      const current =
        localStorage.getItem(
          ACTIVE_THEME_KEY
        ) || 'default';

      console.log(
        '[ThemeSelector] sync',
        current
      );

      setSelectedTheme(
        current
      );
    };

    syncTheme();

    window.addEventListener(
      'storage',
      syncTheme
    );

    window.addEventListener(
      'focus',
      syncTheme
    );

    window.addEventListener(
      'pageshow',
      syncTheme
    );

    document.addEventListener(
      'visibilitychange',
      syncTheme
    );

    return () => {
      window.removeEventListener(
        'storage',
        syncTheme
      );

      window.removeEventListener(
        'focus',
        syncTheme
      );

      window.removeEventListener(
        'pageshow',
        syncTheme
      );

      document.removeEventListener(
        'visibilitychange',
        syncTheme
      );
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50">
      <select
        className="bg-card text-card-foreground border-border rounded-md border px-3 py-2"
        value={selectedTheme}
        onChange={async (e) => {
          const theme =
            e.target.value as Parameters<
              typeof themeManager.setTheme
            >[0];

          setSelectedTheme(
            theme
          );

          await themeManager.setTheme(
            theme
          );
        }}
      >
        {Object.keys(
          themeManager.themes
        ).map((theme) => (
          <option
            key={theme}
            value={theme}
          >
            {theme}
          </option>
        ))}
      </select>
    </div>
  );
}