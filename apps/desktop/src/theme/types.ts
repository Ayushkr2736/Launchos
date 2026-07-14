export type ThemeMode = 'light' | 'dark' | 'system';

export type ResolvedTheme = 'light' | 'dark';

export interface ThemeTokens {
  readonly background: string;
  readonly foreground: string;
  readonly card: string;
  readonly cardForeground: string;
  readonly popover: string;
  readonly popoverForeground: string;
  readonly primary: string;
  readonly primaryForeground: string;
  readonly secondary: string;
  readonly secondaryForeground: string;
  readonly muted: string;
  readonly mutedForeground: string;
  readonly accent: string;
  readonly accentForeground: string;
  readonly destructive: string;
  readonly destructiveForeground: string;
  readonly border: string;
  readonly input: string;
  readonly ring: string;
  readonly sidebar: string;
  readonly sidebarForeground: string;
  readonly sidebarAccent: string;
  readonly sidebarBorder: string;
  readonly panel: string;
  readonly panelForeground: string;
}
