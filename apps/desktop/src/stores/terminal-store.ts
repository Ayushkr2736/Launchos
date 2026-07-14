import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type {
  TerminalCreateOptions,
  TerminalSession,
  TerminalShellPreference,
} from '@/features/terminal/types';

import {
  shellArgForPreference,
  TERMINAL_PERSIST_MAX_SESSIONS,
  TERMINAL_STORAGE_KEY,
  titleForShell,
} from '@/features/terminal/constants';
import { killPty } from '@/features/terminal/lib/pty-bridge';
import {
  clearTerminalSession,
  copyTerminalSession,
  focusTerminalSession,
  pasteTerminalSession,
} from '@/features/terminal/lib/session-registry';

export interface TerminalStoreState {
  sessions: TerminalSession[];
  activeSessionId: string | null;
  preferredShell: TerminalShellPreference;
  hydrated: boolean;
  createSession: (options?: TerminalCreateOptions) => string;
  closeSession: (id: string) => void;
  setActiveSession: (id: string) => void;
  markExited: (id: string) => void;
  renameSession: (id: string, title: string) => void;
  setPreferredShell: (shell: TerminalShellPreference) => void;
  clearActive: () => boolean;
  copyActive: () => Promise<boolean>;
  pasteActive: () => Promise<boolean>;
  focusActive: () => void;
  setHydrated: (value: boolean) => void;
}

function nextTitle(existing: TerminalSession[], shell?: string): string {
  const shellTitle = shell ? titleForShell(shell) : undefined;
  const prefix = shellTitle ?? 'Terminal';
  const used = new Set(existing.map((session) => session.title));
  let index = 1;
  for (;;) {
    const title = index === 1 ? prefix : `${prefix} ${index}`;
    if (!used.has(title)) {
      return title;
    }
    index += 1;
  }
}

function sanitizePersistedSessions(sessions: TerminalSession[]): TerminalSession[] {
  return sessions.slice(0, TERMINAL_PERSIST_MAX_SESSIONS).map((session) => ({
    ...session,
    exited: false,
  }));
}

export const useTerminalStore = create<TerminalStoreState>()(
  persist(
    (set, get) => ({
      sessions: [],
      activeSessionId: null,
      preferredShell: 'auto',
      hydrated: false,
      createSession: (options = {}) => {
        const id = crypto.randomUUID();
        const sessions = get().sessions;
        const preferred = get().preferredShell;
        const shell =
          options.shell ?? (preferred === 'auto' ? '' : shellArgForPreference(preferred));
        const session: TerminalSession = {
          id,
          title: options.title ?? nextTitle(sessions, shell),
          cwd: options.cwd ?? null,
          shell,
          createdAt: Date.now(),
          exited: false,
        };
        set({
          sessions: [...sessions, session],
          activeSessionId: id,
        });
        return id;
      },
      closeSession: (id) => {
        void killPty(id);
        const sessions = get().sessions.filter((session) => session.id !== id);
        const activeSessionId = get().activeSessionId;
        const nextActive =
          activeSessionId === id ? (sessions[sessions.length - 1]?.id ?? null) : activeSessionId;
        set({ sessions, activeSessionId: nextActive });
      },
      setActiveSession: (id) => {
        if (!get().sessions.some((session) => session.id === id)) {
          return;
        }
        set({ activeSessionId: id });
      },
      markExited: (id) => {
        set({
          sessions: get().sessions.map((session) =>
            session.id === id ? { ...session, exited: true } : session,
          ),
        });
      },
      renameSession: (id, title) => {
        const trimmed = title.trim();
        if (!trimmed) {
          return;
        }
        set({
          sessions: get().sessions.map((session) =>
            session.id === id ? { ...session, title: trimmed } : session,
          ),
        });
      },
      setPreferredShell: (shell) => {
        set({ preferredShell: shell });
      },
      clearActive: () => {
        const id = get().activeSessionId;
        if (!id) {
          return false;
        }
        return clearTerminalSession(id);
      },
      copyActive: async () => {
        const id = get().activeSessionId;
        if (!id) {
          return false;
        }
        return copyTerminalSession(id);
      },
      pasteActive: async () => {
        const id = get().activeSessionId;
        if (!id) {
          return false;
        }
        return pasteTerminalSession(id);
      },
      focusActive: () => {
        const id = get().activeSessionId;
        if (!id) {
          return;
        }
        focusTerminalSession(id);
      },
      setHydrated: (value) => {
        set({ hydrated: value });
      },
    }),
    {
      name: TERMINAL_STORAGE_KEY,
      partialize: (state) => ({
        sessions: sanitizePersistedSessions(state.sessions),
        activeSessionId: state.activeSessionId,
        preferredShell: state.preferredShell,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.sessions = sanitizePersistedSessions(state.sessions);
          if (
            state.activeSessionId &&
            !state.sessions.some((session) => session.id === state.activeSessionId)
          ) {
            state.activeSessionId = state.sessions[0]?.id ?? null;
          }
          state.hydrated = true;
        } else {
          useTerminalStore.getState().setHydrated(true);
        }
      },
    },
  ),
);

if (typeof window !== 'undefined') {
  if (useTerminalStore.persist.hasHydrated()) {
    useTerminalStore.getState().setHydrated(true);
  } else {
    useTerminalStore.persist.onFinishHydration(() => {
      useTerminalStore.getState().setHydrated(true);
    });
  }
}
