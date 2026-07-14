import type { ResolvedTheme, ThemeMode } from '@/theme/types';

const SYSTEM_COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';

export function getSystemResolvedTheme(): ResolvedTheme {
  if (typeof window === 'undefined') {
    return 'dark';
  }

  return window.matchMedia(SYSTEM_COLOR_SCHEME_QUERY).matches ? 'dark' : 'light';
}

export function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === 'light' || mode === 'dark') {
    return mode;
  }

  return getSystemResolvedTheme();
}

export function applyResolvedTheme(resolved: ResolvedTheme): void {
  const root = document.documentElement;
  root.classList.toggle('dark', resolved === 'dark');
  root.dataset['theme'] = resolved;
  root.style.colorScheme = resolved;
}

export function enableThemeTransition(durationMs: number): void {
  const root = document.documentElement;
  root.classList.add('theme-transition');

  window.setTimeout(() => {
    root.classList.remove('theme-transition');
  }, durationMs);
}

export function subscribeToSystemTheme(onChange: (resolved: ResolvedTheme) => void): () => void {
  const media = window.matchMedia(SYSTEM_COLOR_SCHEME_QUERY);
  const listener = (event: MediaQueryListEvent) => {
    onChange(event.matches ? 'dark' : 'light');
  };

  media.addEventListener('change', listener);
  return () => {
    media.removeEventListener('change', listener);
  };
}
