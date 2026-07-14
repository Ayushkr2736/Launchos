import { useEffect, useRef, type ReactNode } from 'react';

import { useThemeStore } from '@/stores/theme-store';
import {
  applyResolvedTheme,
  enableThemeTransition,
  resolveTheme,
  subscribeToSystemTheme,
} from '@/theme/apply-theme';
import { THEME_TRANSITION_MS } from '@/theme/tokens';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const mode = useThemeStore((state) => state.mode);
  const hasMountedRef = useRef(false);

  useEffect(() => {
    const resolved = resolveTheme(mode);
    if (hasMountedRef.current) {
      enableThemeTransition(THEME_TRANSITION_MS);
    } else {
      hasMountedRef.current = true;
    }
    applyResolvedTheme(resolved);
  }, [mode]);

  useEffect(() => {
    if (mode !== 'system') {
      return;
    }

    return subscribeToSystemTheme((resolved) => {
      enableThemeTransition(THEME_TRANSITION_MS);
      applyResolvedTheme(resolved);
    });
  }, [mode]);

  return children;
}
