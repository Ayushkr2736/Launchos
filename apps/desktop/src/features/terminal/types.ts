/** Shell preference for new sessions. `auto` uses OS default (zsh preferred on macOS). */
export type TerminalShellPreference = 'auto' | 'zsh' | 'bash' | 'pwsh' | 'powershell';

export interface TerminalSession {
  readonly id: string;
  readonly title: string;
  readonly cwd: string | null;
  /** Empty / auto → Rust `detect_shell`. Otherwise shell id (`zsh`, `bash`) or absolute path. */
  readonly shell: string;
  readonly createdAt: number;
  readonly exited: boolean;
}

export interface TerminalCreateOptions {
  cwd?: string | null;
  shell?: string;
  title?: string;
}

export interface ShellInfo {
  id: string;
  label: string;
  path: string;
  available: boolean;
}
