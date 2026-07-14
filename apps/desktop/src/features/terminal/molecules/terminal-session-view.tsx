import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from '@launchos/ui';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { Terminal } from '@xterm/xterm';
import { useEffect, useRef } from 'react';

import type { TerminalSession } from '@/features/terminal/types';

import {
  TERMINAL_DARK_THEME,
  TERMINAL_FONT_FAMILY,
  TERMINAL_FONT_SIZE,
  TERMINAL_SCROLLBACK,
} from '@/features/terminal/constants';
import {
  createPtySession,
  listenPtyExit,
  listenPtyOutput,
  resizePty,
  writePty,
} from '@/features/terminal/lib/pty-bridge';
import { registerTerminalSession } from '@/features/terminal/lib/session-registry';
import { useTerminalStore } from '@/stores/terminal-store';
import { detectTauriRuntime } from '@/window/native';

import '@xterm/xterm/css/xterm.css';

interface TerminalSessionViewProps {
  session: TerminalSession;
  active: boolean;
}

export function TerminalSessionView({ session, active }: TerminalSessionViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitRef = useRef<FitAddon | null>(null);
  const markExited = useTerminalStore((state) => state.markExited);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) {
      return;
    }

    const term = new Terminal({
      cursorBlink: true,
      cursorStyle: 'bar',
      fontSize: TERMINAL_FONT_SIZE,
      fontFamily: TERMINAL_FONT_FAMILY,
      theme: { ...TERMINAL_DARK_THEME },
      scrollback: TERMINAL_SCROLLBACK,
      allowProposedApi: true,
      convertEol: false,
      macOptionIsMeta: true,
      rightClickSelectsWord: false,
    });

    const fit = new FitAddon();
    term.loadAddon(fit);
    term.loadAddon(new WebLinksAddon());
    term.open(el);
    fit.fit();

    termRef.current = term;
    fitRef.current = fit;

    let disposed = false;
    const unlisteners: Array<() => void> = [];

    const copySelection = async (): Promise<boolean> => {
      const selection = term.getSelection();
      if (!selection) {
        return false;
      }
      await navigator.clipboard.writeText(selection);
      return true;
    };

    const pasteClipboard = async (): Promise<boolean> => {
      try {
        const text = await navigator.clipboard.readText();
        if (!text) {
          return false;
        }
        await writePty(session.id, text);
        return true;
      } catch {
        return false;
      }
    };

    const clearBuffer = () => {
      term.clear();
    };

    const unregister = registerTerminalSession(session.id, {
      clear: clearBuffer,
      copy: copySelection,
      paste: pasteClipboard,
      focus: () => {
        term.focus();
      },
      hasSelection: () => term.hasSelection(),
    });

    const boot = async () => {
      if (!detectTauriRuntime()) {
        term.writeln('\x1b[33mTerminal requires the LaunchOS desktop app (Tauri).\x1b[0m');
        return;
      }

      try {
        await createPtySession({
          sessionId: session.id,
          cols: term.cols,
          rows: term.rows,
          cwd: session.cwd,
          shell: session.shell || null,
        });
        void resizePty(session.id, term.cols, term.rows);
      } catch (error) {
        term.writeln(
          `\x1b[31mFailed to start shell: ${error instanceof Error ? error.message : String(error)}\x1b[0m`,
        );
        markExited(session.id);
        return;
      }

      if (disposed) {
        // Strict Mode remount — keep PTY; remount will re-attach.
        return;
      }

      const unlistenOutput = await listenPtyOutput(session.id, (data) => {
        term.write(data);
      });
      const unlistenExit = await listenPtyExit(session.id, () => {
        term.writeln('\r\n\x1b[90m[Process exited]\x1b[0m');
        markExited(session.id);
      });
      unlisteners.push(unlistenOutput, unlistenExit);

      term.onData((data) => {
        void writePty(session.id, data);
      });

      term.onResize(({ cols, rows }) => {
        void resizePty(session.id, cols, rows);
      });

      term.attachCustomKeyEventHandler((event) => {
        if (event.type !== 'keydown') {
          return true;
        }
        const meta = event.metaKey || event.ctrlKey;
        const key = event.key.toLowerCase();

        if (meta && event.shiftKey && key === 'k') {
          clearBuffer();
          return false;
        }
        if (meta && event.shiftKey && key === 'c') {
          void copySelection();
          return false;
        }
        if (meta && event.shiftKey && key === 'v') {
          void pasteClipboard();
          return false;
        }
        if (meta && !event.shiftKey && key === 'c' && term.hasSelection()) {
          void copySelection();
          return false;
        }
        if (meta && !event.shiftKey && key === 'v') {
          void pasteClipboard();
          return false;
        }
        return true;
      });
    };

    void boot();

    const observer = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        fit.fit();
      });
    });
    observer.observe(el);

    return () => {
      disposed = true;
      unregister();
      observer.disconnect();
      for (const unlisten of unlisteners) {
        unlisten();
      }
      // PTY lifetime is owned by the terminal store (`closeSession`).
      term.dispose();
      termRef.current = null;
      fitRef.current = null;
    };
  }, [markExited, session.cwd, session.id, session.shell]);

  useEffect(() => {
    if (!active) {
      return;
    }
    requestAnimationFrame(() => {
      fitRef.current?.fit();
      termRef.current?.focus();
    });
  }, [active]);

  const onClear = () => {
    useTerminalStore.getState().clearActive();
  };
  const onCopy = () => {
    void useTerminalStore.getState().copyActive();
  };
  const onPaste = () => {
    void useTerminalStore.getState().pasteActive();
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          className="h-full min-h-0 w-full overflow-hidden bg-[#141414] p-1"
          data-terminal-session={session.id}
        >
          <div ref={containerRef} className="launchos-terminal h-full w-full" />
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="min-w-44">
        <ContextMenuItem onSelect={onCopy}>
          Copy
          <ContextMenuShortcut>⌘C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onSelect={onPaste}>
          Paste
          <ContextMenuShortcut>⌘V</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={onClear}>
          Clear
          <ContextMenuShortcut>⌘⇧K</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
