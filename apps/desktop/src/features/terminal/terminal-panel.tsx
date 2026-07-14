import { useCallback, useEffect } from 'react';

import type { TerminalShellPreference } from '@/features/terminal/types';

import { shellArgForPreference } from '@/features/terminal/constants';
import { useTerminalShortcuts } from '@/features/terminal/hooks/use-terminal-shortcuts';
import { TerminalSessionView } from '@/features/terminal/molecules/terminal-session-view';
import { TerminalTabBar } from '@/features/terminal/molecules/terminal-tab-bar';
import { useProjectStore } from '@/stores/project-store';
import { useTerminalStore } from '@/stores/terminal-store';

/**
 * Multi-session terminal host for the bottom panel.
 * New sessions launch in the open workspace folder (or the shell default home).
 * PTY host is Rust `portable-pty` (node-pty equivalent for Tauri).
 */
export function TerminalPanel() {
  const workspacePath = useProjectStore((state) => state.workspacePath);
  const sessions = useTerminalStore((state) => state.sessions);
  const activeSessionId = useTerminalStore((state) => state.activeSessionId);
  const preferredShell = useTerminalStore((state) => state.preferredShell);
  const hydrated = useTerminalStore((state) => state.hydrated);
  const createSession = useTerminalStore((state) => state.createSession);
  const closeSession = useTerminalStore((state) => state.closeSession);
  const setActiveSession = useTerminalStore((state) => state.setActiveSession);
  const renameSession = useTerminalStore((state) => state.renameSession);
  const setPreferredShell = useTerminalStore((state) => state.setPreferredShell);
  const clearActive = useTerminalStore((state) => state.clearActive);
  const copyActive = useTerminalStore((state) => state.copyActive);
  const pasteActive = useTerminalStore((state) => state.pasteActive);

  useTerminalShortcuts();

  const spawn = useCallback(
    (shell?: string) => {
      const resolved =
        shell ?? (preferredShell === 'auto' ? undefined : shellArgForPreference(preferredShell));
      createSession({
        cwd: workspacePath,
        ...(resolved ? { shell: resolved } : {}),
      });
    },
    [createSession, preferredShell, workspacePath],
  );

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    if (sessions.length === 0) {
      spawn();
    }
  }, [hydrated, sessions.length, spawn]);

  const onPreferredShell = useCallback(
    (shell: TerminalShellPreference) => {
      setPreferredShell(shell);
    },
    [setPreferredShell],
  );

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#141414]">
      <TerminalTabBar
        sessions={sessions}
        activeSessionId={activeSessionId}
        preferredShell={preferredShell}
        onSelect={setActiveSession}
        onClose={closeSession}
        onCreate={spawn}
        onRename={renameSession}
        onPreferredShell={onPreferredShell}
        onClear={() => {
          clearActive();
        }}
        onCopy={() => {
          void copyActive();
        }}
        onPaste={() => {
          void pasteActive();
        }}
      />
      <div className="relative min-h-0 flex-1">
        {sessions.map((session) => (
          <div
            key={session.id}
            className={
              session.id === activeSessionId
                ? 'absolute inset-0 z-10'
                : 'invisible absolute inset-0 z-0'
            }
          >
            <TerminalSessionView session={session} active={session.id === activeSessionId} />
          </div>
        ))}
      </div>
    </div>
  );
}
