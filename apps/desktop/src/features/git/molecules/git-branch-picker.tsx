import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
} from '@launchos/ui';
import { Check, ChevronDown, GitBranch, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';

import { useGitStore } from '@/stores/git-store';

interface GitBranchPickerProps {
  repoPath: string;
  disabled?: boolean;
}

export function GitBranchPicker({ repoPath, disabled }: GitBranchPickerProps) {
  const branch = useGitStore((state) => state.branch);
  const branches = useGitStore((state) => state.branches);
  const busy = useGitStore((state) => state.busy);
  const checkout = useGitStore((state) => state.checkout);
  const loadBranches = useGitStore((state) => state.loadBranches);
  const [newBranch, setNewBranch] = useState('');

  const local = useMemo(() => branches.filter((item) => !item.isRemote), [branches]);
  const remote = useMemo(() => branches.filter((item) => item.isRemote), [branches]);

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open) {
          void loadBranches(repoPath);
        }
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 max-w-[12rem] gap-1 px-2 text-xs"
          disabled={disabled || busy}
        >
          <GitBranch className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="truncate">{branch ?? 'Branch'}</span>
          <ChevronDown className="h-3 w-3 shrink-0 opacity-60" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-72 min-w-56 overflow-y-auto">
        <DropdownMenuLabel className="text-muted-foreground text-[10px] uppercase tracking-wide">
          Create branch
        </DropdownMenuLabel>
        <div className="flex items-center gap-1 px-2 pb-2">
          <Input
            value={newBranch}
            placeholder="name"
            className="h-7 text-xs"
            onChange={(event) => {
              setNewBranch(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && newBranch.trim()) {
                event.preventDefault();
                void checkout(repoPath, newBranch.trim(), true).then((ok) => {
                  if (ok) {
                    setNewBranch('');
                  }
                });
              }
            }}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            aria-label="Create branch"
            disabled={!newBranch.trim() || busy}
            onClick={() => {
              void checkout(repoPath, newBranch.trim(), true).then((ok) => {
                if (ok) {
                  setNewBranch('');
                }
              });
            }}
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
          </Button>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-muted-foreground text-[10px] uppercase tracking-wide">
          Local
        </DropdownMenuLabel>
        {local.length === 0 ? (
          <p className="text-muted-foreground px-2 py-1 text-[11px]">No local branches</p>
        ) : (
          local.map((item) => (
            <DropdownMenuItem
              key={`local:${item.name}`}
              disabled={item.isCurrent || busy}
              onSelect={() => {
                void checkout(repoPath, item.name);
              }}
            >
              <span className="flex min-w-0 flex-1 items-center gap-2">
                {item.isCurrent ? (
                  <Check className="h-3.5 w-3.5 shrink-0" aria-hidden />
                ) : (
                  <span className="w-3.5" />
                )}
                <span className="truncate">{item.name}</span>
              </span>
              <span className="text-muted-foreground ml-2 font-mono text-[10px]">{item.tip}</span>
            </DropdownMenuItem>
          ))
        )}
        {remote.length > 0 ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-muted-foreground text-[10px] uppercase tracking-wide">
              Remote
            </DropdownMenuLabel>
            {remote.map((item) => (
              <DropdownMenuItem
                key={`remote:${item.name}`}
                disabled={busy}
                onSelect={() => {
                  void checkout(repoPath, item.name);
                }}
              >
                <span className="truncate">{item.name}</span>
                <span className="text-muted-foreground ml-2 font-mono text-[10px]">{item.tip}</span>
              </DropdownMenuItem>
            ))}
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
