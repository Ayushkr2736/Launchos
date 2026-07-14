import { Button, Input } from '@launchos/ui';
import { Archive, Trash2 } from 'lucide-react';

import { useGitStore } from '@/stores/git-store';

interface GitStashPanelProps {
  repoPath: string;
  disabled?: boolean;
}

export function GitStashPanel({ repoPath, disabled }: GitStashPanelProps) {
  const stashes = useGitStore((state) => state.stashes);
  const stashLoading = useGitStore((state) => state.stashLoading);
  const stashMessage = useGitStore((state) => state.stashMessage);
  const busy = useGitStore((state) => state.busy);
  const setStashMessage = useGitStore((state) => state.setStashMessage);
  const stashPush = useGitStore((state) => state.stashPush);
  const stashApply = useGitStore((state) => state.stashApply);
  const stashPop = useGitStore((state) => state.stashPop);
  const stashDrop = useGitStore((state) => state.stashDrop);

  return (
    <div className="flex flex-col gap-2 p-2">
      <div className="flex items-center gap-1">
        <Input
          value={stashMessage}
          placeholder="Stash message (optional)"
          className="h-7 text-xs"
          disabled={disabled || busy}
          onChange={(event) => {
            setStashMessage(event.target.value);
          }}
        />
        <Button
          type="button"
          size="sm"
          className="h-7 shrink-0 gap-1 px-2 text-xs"
          disabled={disabled || busy}
          onClick={() => {
            void stashPush(repoPath);
          }}
        >
          <Archive className="h-3.5 w-3.5" aria-hidden />
          Stash
        </Button>
      </div>

      {stashLoading && stashes.length === 0 ? (
        <p className="text-muted-foreground text-[11px]">Loading stashes…</p>
      ) : null}

      {stashes.length === 0 && !stashLoading ? (
        <p className="text-muted-foreground text-[11px]">No stashes.</p>
      ) : (
        <ul className="space-y-1">
          {stashes.map((entry) => (
            <li key={entry.reflog} className="border-border/60 rounded-md border px-2 py-1.5">
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">{entry.message || entry.reflog}</p>
                  <p className="text-muted-foreground font-mono text-[10px]">{entry.reflog}</p>
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-1.5 text-[10px]"
                    disabled={busy}
                    onClick={() => {
                      void stashApply(repoPath, entry.reflog);
                    }}
                  >
                    Apply
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-1.5 text-[10px]"
                    disabled={busy}
                    onClick={() => {
                      void stashPop(repoPath, entry.reflog);
                    }}
                  >
                    Pop
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive h-6 w-6 p-0"
                    aria-label={`Drop ${entry.reflog}`}
                    disabled={busy}
                    onClick={() => {
                      void stashDrop(repoPath, entry.reflog);
                    }}
                  >
                    <Trash2 className="h-3 w-3" aria-hidden />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
