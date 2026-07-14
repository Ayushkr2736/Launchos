import {
  cn,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@launchos/ui';
import { ChevronDown, ClipboardPaste, Copy, Eraser, Plus, X } from 'lucide-react';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';

import type {
  ShellInfo,
  TerminalSession,
  TerminalShellPreference,
} from '@/features/terminal/types';

import { TERMINAL_SHELL_OPTIONS } from '@/features/terminal/constants';
import { listShells } from '@/features/terminal/lib/pty-bridge';

interface TerminalTabBarProps {
  sessions: TerminalSession[];
  activeSessionId: string | null;
  preferredShell: TerminalShellPreference;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
  onCreate: (shell?: string) => void;
  onRename: (id: string, title: string) => void;
  onPreferredShell: (shell: TerminalShellPreference) => void;
  onClear: () => void;
  onCopy: () => void;
  onPaste: () => void;
}

export function TerminalTabBar({
  sessions,
  activeSessionId,
  preferredShell,
  onSelect,
  onClose,
  onCreate,
  onRename,
  onPreferredShell,
  onClear,
  onCopy,
  onPaste,
}: TerminalTabBarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [shells, setShells] = useState<ShellInfo[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void listShells().then(setShells);
  }, []);

  useEffect(() => {
    if (editingId) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editingId]);

  const shellAvailable = (id: string) =>
    shells.length === 0 || shells.some((shell) => shell.id === id && shell.available);

  const commitRename = (id: string) => {
    onRename(id, draft);
    setEditingId(null);
  };

  const onRenameKey = (event: KeyboardEvent<HTMLInputElement>, id: string) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      commitRename(id);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setEditingId(null);
    }
  };

  return (
    <div className="border-border bg-panel flex h-8 shrink-0 items-center gap-0.5 border-b px-1">
      <div className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto">
        {sessions.map((session) => {
          const active = session.id === activeSessionId;
          const editing = editingId === session.id;
          return (
            <div
              key={session.id}
              className={cn(
                'group flex h-6 max-w-[10rem] shrink-0 items-center gap-1 rounded-md px-2 text-[11px]',
                active
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground',
              )}
            >
              {editing ? (
                <input
                  ref={inputRef}
                  className="min-w-0 flex-1 bg-transparent text-[11px] outline-none"
                  value={draft}
                  onChange={(event) => {
                    setDraft(event.target.value);
                  }}
                  onBlur={() => {
                    commitRename(session.id);
                  }}
                  onKeyDown={(event) => {
                    onRenameKey(event, session.id);
                  }}
                />
              ) : (
                <button
                  type="button"
                  className="min-w-0 flex-1 truncate text-left"
                  onClick={() => {
                    onSelect(session.id);
                  }}
                  onDoubleClick={() => {
                    setEditingId(session.id);
                    setDraft(session.title);
                  }}
                >
                  {session.title}
                  {session.exited ? ' · exited' : ''}
                </button>
              )}
              <button
                type="button"
                className="hover:bg-background/40 rounded p-0.5 opacity-0 group-hover:opacity-100"
                aria-label={`Close ${session.title}`}
                onClick={(event) => {
                  event.stopPropagation();
                  onClose(session.id);
                }}
              >
                <X className="h-3 w-3" aria-hidden />
              </button>
            </div>
          );
        })}
      </div>

      <div className="border-border flex shrink-0 items-center gap-0.5 border-l pl-1">
        <button
          type="button"
          className="text-muted-foreground hover:bg-accent hover:text-accent-foreground inline-flex h-6 w-6 items-center justify-center rounded-md"
          aria-label="Clear terminal"
          title="Clear (⌘⇧K)"
          onClick={onClear}
        >
          <Eraser className="h-3.5 w-3.5" aria-hidden />
        </button>
        <button
          type="button"
          className="text-muted-foreground hover:bg-accent hover:text-accent-foreground inline-flex h-6 w-6 items-center justify-center rounded-md"
          aria-label="Copy"
          title="Copy (⌘C)"
          onClick={onCopy}
        >
          <Copy className="h-3.5 w-3.5" aria-hidden />
        </button>
        <button
          type="button"
          className="text-muted-foreground hover:bg-accent hover:text-accent-foreground inline-flex h-6 w-6 items-center justify-center rounded-md"
          aria-label="Paste"
          title="Paste (⌘V)"
          onClick={onPaste}
        >
          <ClipboardPaste className="h-3.5 w-3.5" aria-hidden />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="text-muted-foreground hover:bg-accent hover:text-accent-foreground inline-flex h-6 items-center gap-0.5 rounded-md px-1.5"
              aria-label="New terminal"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden />
              <ChevronDown className="h-3 w-3" aria-hidden />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-44">
            <DropdownMenuItem
              onSelect={() => {
                onCreate();
              }}
            >
              New Terminal
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-muted-foreground text-[10px] uppercase tracking-wide">
              Shell
            </DropdownMenuLabel>
            {TERMINAL_SHELL_OPTIONS.filter((option) => option.id !== 'auto').map((option) => (
              <DropdownMenuItem
                key={option.id}
                disabled={!shellAvailable(option.id)}
                onSelect={() => {
                  onCreate(option.id);
                }}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-muted-foreground text-[10px] uppercase tracking-wide">
              Default for new
            </DropdownMenuLabel>
            {TERMINAL_SHELL_OPTIONS.map((option) => (
              <DropdownMenuCheckboxItem
                key={`pref-${option.id}`}
                checked={preferredShell === option.id}
                disabled={option.id !== 'auto' && !shellAvailable(option.id)}
                onCheckedChange={() => {
                  onPreferredShell(option.id);
                }}
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
