import { Button } from '@launchos/ui';

import { useGitStore } from '@/stores/git-store';

interface GitCommitFormProps {
  repoPath: string;
  stagedCount: number;
  disabled?: boolean;
}

export function GitCommitForm({ repoPath, stagedCount, disabled }: GitCommitFormProps) {
  const commitMessage = useGitStore((state) => state.commitMessage);
  const setCommitMessage = useGitStore((state) => state.setCommitMessage);
  const commit = useGitStore((state) => state.commit);
  const busy = useGitStore((state) => state.busy);

  return (
    <div className="border-border space-y-2 border-b p-2">
      <textarea
        value={commitMessage}
        onChange={(event) => {
          setCommitMessage(event.target.value);
        }}
        placeholder="Commit message"
        rows={3}
        disabled={disabled || busy}
        className="border-border bg-background text-foreground focus-visible:ring-ring w-full resize-none rounded-md border px-2 py-1.5 text-xs outline-none focus-visible:ring-1"
        aria-label="Commit message"
      />
      <div className="flex items-center justify-between gap-2">
        <p className="text-muted-foreground text-[10px]">
          {stagedCount} staged file{stagedCount === 1 ? '' : 's'}
        </p>
        <Button
          type="button"
          size="sm"
          className="h-7 px-3 text-xs"
          disabled={disabled || busy || stagedCount === 0 || !commitMessage.trim()}
          onClick={() => {
            void commit(repoPath);
          }}
        >
          Commit
        </Button>
      </div>
    </div>
  );
}
