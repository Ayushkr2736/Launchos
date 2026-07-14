import { invoke } from '@tauri-apps/api/core';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';

import type { ShellInfo } from '@/features/terminal/types';

import { detectTauriRuntime } from '@/window/native';

export interface TerminalOutputEvent {
  data: string;
}

export interface TerminalExitEvent {
  code: number | null;
}

export async function createPtySession(params: {
  sessionId: string;
  cols: number;
  rows: number;
  cwd?: string | null;
  shell?: string | null;
}): Promise<void> {
  if (!detectTauriRuntime()) {
    throw new Error('Terminal requires the LaunchOS desktop app');
  }
  await invoke('terminal_create', {
    sessionId: params.sessionId,
    cols: params.cols,
    rows: params.rows,
    cwd: params.cwd ?? null,
    shell: params.shell && params.shell.length > 0 ? params.shell : null,
  });
}

export async function writePty(sessionId: string, data: string): Promise<void> {
  if (!detectTauriRuntime()) {
    return;
  }
  await invoke('terminal_write', { sessionId, data });
}

export async function resizePty(sessionId: string, cols: number, rows: number): Promise<void> {
  if (!detectTauriRuntime()) {
    return;
  }
  await invoke('terminal_resize', { sessionId, cols, rows });
}

export async function killPty(sessionId: string): Promise<void> {
  if (!detectTauriRuntime()) {
    return;
  }
  await invoke('terminal_kill', { sessionId });
}

export async function listShells(): Promise<ShellInfo[]> {
  if (!detectTauriRuntime()) {
    return [
      { id: 'zsh', label: 'zsh', path: '/bin/zsh', available: true },
      { id: 'bash', label: 'bash', path: '/bin/bash', available: true },
    ];
  }
  return invoke<ShellInfo[]>('terminal_list_shells');
}

export async function listenPtyOutput(
  sessionId: string,
  onData: (data: string) => void,
): Promise<UnlistenFn> {
  return listen<TerminalOutputEvent>(`terminal-output-${sessionId}`, (event) => {
    onData(event.payload.data);
  });
}

export async function listenPtyExit(
  sessionId: string,
  onExit: (code: number | null) => void,
): Promise<UnlistenFn> {
  return listen<TerminalExitEvent>(`terminal-exit-${sessionId}`, (event) => {
    onExit(event.payload.code ?? null);
  });
}
