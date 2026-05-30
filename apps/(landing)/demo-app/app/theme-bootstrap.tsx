'use client';

import { useEffect }
  from 'react';

import {
  themeManager,
} from '@wraith/themes';

export function ThemeBootstrap() {
  useEffect(() => {
    themeManager.restoreTheme();
  }, []);

  return null;
}