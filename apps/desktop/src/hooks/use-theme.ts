import { useCallback, useMemo, useSyncExternalStore } from 'react';

import type { ResolvedTheme, ThemeMode } from '@/theme/types';

import { useThemeStore } from '@/stores/theme-store';
import { getSystemResolvedTheme, resolveTheme } from '@/theme/apply-theme';

function subscribeToSystemPreference(onStoreChange: () => void): () => void {
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener('change', onStoreChange);
  return () => {
    media.removeEventListener('change', onStoreChange);
  };
}

function getSystemSnapshot(): ResolvedTheme {
  return getSystemResolvedTheme();
}

function getServerSnapshot(): ResolvedTheme {
  return 'dark';
}

export interface UseThemeResult {
  mode: ThemeMode;
  resolved: ResolvedTheme;
  isDark: boolean;
  isLight: boolean;
  isSystem: boolean;
  setMode: (mode: ThemeMode) => void;
  cycleMode: () => void;
  setLight: () => void;
  setDark: () => void;
  setSystem: () => void;
}

export function useTheme(): UseThemeResult {
  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);
  const cycleMode = useThemeStore((state) => state.cycleMode);

  const systemResolved = useSyncExternalStore(
    subscribeToSystemPreference,
    getSystemSnapshot,
    getServerSnapshot,
  );

  const resolved = useMemo(() => {
    if (mode === 'system') {
      return systemResolved;
    }
    return resolveTheme(mode);
  }, [mode, systemResolved]);

  const setLight = useCallback(() => {
    setMode('light');
  }, [setMode]);

  const setDark = useCallback(() => {
    setMode('dark');
  }, [setMode]);

  const setSystem = useCallback(() => {
    setMode('system');
  }, [setMode]);

  return {
    mode,
    resolved,
    isDark: resolved === 'dark',
    isLight: resolved === 'light',
    isSystem: mode === 'system',
    setMode,
    cycleMode,
    setLight,
    setDark,
    setSystem,
  };
}
