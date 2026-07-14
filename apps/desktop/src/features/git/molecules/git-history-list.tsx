import { cn } from '@launchos/ui';

import { useGitStore } from '@/stores/git-store';

interface GitHistoryListProps {
  repoPath: string;
}

function formatRelative(timestamp: number): string {
  if (!timestamp) {
    return '';
  }
  const delta = Date.now() / 1000 - timestamp;
  if (delta < 60) {
    return 'just now';
  }
  if (delta < 3600) {
    return `${Math.floor(delta / 60)}m ago`;
  }
  if (delta < 86400) {
    return `${Math.floor(delta / 3600)}h ago`;
  }
  if (delta < 86400 * 30) {
    return `${Math.floor(delta / 86400)}d ago`;
  }
  return new Date(timestamp * 1000).toLocaleDateString();
}

export function GitHistoryList({ repoPath }: GitHistoryListProps) {
  const commits = useGitStore((state) => state.commits);
  const historyLoading = useGitStore((state) => state.historyLoading);
  const selectedCommitHash = useGitStore((state) => state.selectedCommitHash);
  const selectCommit = useGitStore((state) => state.selectCommit);

  if (historyLoading && commits.length === 0) {
    return <p className="text-muted-foreground px-3 py-4 text-[11px]">Loading history…</p>;
  }

  if (commits.length === 0) {
    return <p className="text-muted-foreground px-3 py-4 text-[11px]">No commits yet.</p>;
  }

  return (
    <ul className="pb-2">
      {commits.map((commit) => {
        const selected = selectedCommitHash === commit.hash;
        return (
          <li key={commit.hash}>
            <button
              type="button"
              className={cn(
                'flex w-full flex-col gap-0.5 px-2 py-1.5 text-left text-xs',
                selected ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50',
              )}
              onClick={() => {
                void selectCommit(repoPath, commit.hash);
              }}
            >
              <span className="truncate font-medium">{commit.subject}</span>
              <span className="text-muted-foreground flex items-center gap-2 text-[10px]">
                <span className="font-mono">{commit.shortHash}</span>
                <span className="truncate">{commit.author}</span>
                <span className="ml-auto shrink-0">{formatRelative(commit.timestamp)}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
