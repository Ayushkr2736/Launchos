import type { TerminalShellPreference } from '@/features/terminal/types';

export const TERMINAL_SCROLLBACK = 10_000;

export const TERMINAL_FONT_FAMILY =
  '"JetBrains Mono", "SF Mono", Menlo, Monaco, "Cascadia Code", "Fira Code", ui-monospace, monospace';

export const TERMINAL_FONT_SIZE = 13;

/** Cap restored tabs so a large persisted set does not spawn too many PTYs at once. */
export const TERMINAL_PERSIST_MAX_SESSIONS = 8;

export const TERMINAL_STORAGE_KEY = 'launchos.terminal';

export const TERMINAL_SHELL_OPTIONS: Array<{
  id: TerminalShellPreference;
  label: string;
}> = [
  { id: 'auto', label: 'Default shell' },
  { id: 'zsh', label: 'zsh' },
  { id: 'bash', label: 'bash' },
];

/** Dark theme aligned with LaunchOS panel tokens (`--panel` ≈ #141414). */
export const TERMINAL_DARK_THEME = {
  background: '#141414',
  foreground: '#e8e8e8',
  cursor: '#3b9eff',
  cursorAccent: '#141414',
  selectionBackground: '#264f78',
  selectionForeground: '#ffffff',
  black: '#1a1a1a',
  red: '#f44747',
  green: '#6a9955',
  yellow: '#dcdcaa',
  blue: '#569cd6',
  magenta: '#c586c0',
  cyan: '#4ec9b0',
  white: '#d4d4d4',
  brightBlack: '#808080',
  brightRed: '#f44747',
  brightGreen: '#89d185',
  brightYellow: '#dcdcaa',
  brightBlue: '#4fc1ff',
  brightMagenta: '#c586c0',
  brightCyan: '#9cdcfe',
  brightWhite: '#ffffff',
} as const;

export function shellArgForPreference(preference: TerminalShellPreference): string {
  if (preference === 'auto') {
    return '';
  }
  return preference;
}

export function titleForShell(shell: string): string | undefined {
  if (!shell || shell === 'auto') {
    return undefined;
  }
  if (shell === 'zsh' || shell.endsWith('/zsh')) {
    return 'zsh';
  }
  if (shell === 'bash' || shell.endsWith('/bash')) {
    return 'bash';
  }
  if (shell === 'pwsh' || shell.includes('pwsh')) {
    return 'pwsh';
  }
  if (shell.includes('powershell')) {
    return 'powershell';
  }
  return undefined;
}
