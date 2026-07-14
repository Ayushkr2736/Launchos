import type { ThemeTokens } from '@/theme/types';

/**
 * Cursor-inspired semantic tokens as HSL channel triples (no `hsl()` wrapper).
 * Consumed by CSS variables and Tailwind `hsl(var(--token))` utilities.
 */
export const lightThemeTokens = {
  background: '0 0% 100%',
  foreground: '0 0% 9%',
  card: '0 0% 100%',
  cardForeground: '0 0% 9%',
  popover: '0 0% 100%',
  popoverForeground: '0 0% 9%',
  primary: '212 100% 46%',
  primaryForeground: '0 0% 100%',
  secondary: '0 0% 96%',
  secondaryForeground: '0 0% 12%',
  muted: '0 0% 96%',
  mutedForeground: '0 0% 42%',
  accent: '0 0% 95%',
  accentForeground: '0 0% 12%',
  destructive: '0 72% 51%',
  destructiveForeground: '0 0% 100%',
  border: '0 0% 90%',
  input: '0 0% 90%',
  ring: '212 100% 46%',
  sidebar: '0 0% 98%',
  sidebarForeground: '0 0% 20%',
  sidebarAccent: '0 0% 94%',
  sidebarBorder: '0 0% 90%',
  panel: '0 0% 99%',
  panelForeground: '0 0% 12%',
} as const satisfies ThemeTokens;

export const darkThemeTokens = {
  background: '0 0% 7%',
  foreground: '0 0% 93%',
  card: '0 0% 9%',
  cardForeground: '0 0% 93%',
  popover: '0 0% 10%',
  popoverForeground: '0 0% 93%',
  primary: '212 100% 56%',
  primaryForeground: '0 0% 100%',
  secondary: '0 0% 14%',
  secondaryForeground: '0 0% 93%',
  muted: '0 0% 12%',
  mutedForeground: '0 0% 58%',
  accent: '0 0% 14%',
  accentForeground: '0 0% 93%',
  destructive: '0 62% 45%',
  destructiveForeground: '0 0% 98%',
  border: '0 0% 16%',
  input: '0 0% 16%',
  ring: '212 100% 56%',
  sidebar: '0 0% 8%',
  sidebarForeground: '0 0% 78%',
  sidebarAccent: '0 0% 12%',
  sidebarBorder: '0 0% 14%',
  panel: '0 0% 8%',
  panelForeground: '0 0% 90%',
} as const satisfies ThemeTokens;

export const THEME_STORAGE_KEY = 'launchos.theme.mode';
export const THEME_TRANSITION_CLASS = 'theme-transition';
export const THEME_TRANSITION_MS = 200;
export const THEME_MODE_ORDER = ['system', 'light', 'dark'] as const;
