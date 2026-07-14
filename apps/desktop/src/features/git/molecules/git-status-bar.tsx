import { cn } from '@launchos/ui';
import { AlertTriangle, ArrowDown, ArrowUp, GitBranch } from 'lucide-react';

import { useGitStore } from '@/stores/git-store';
import { useLayoutStore } from '@/stores/layout-store';
import { useProjectStore } from '@/stores/project-store';

/** Bottom status bar Git indicator (branch, sync, conflicts, dirty count). */
export function GitStatusBar() {
  const workspacePath = useProjectStore((state) => state.workspacePath);
  const status = useGitStore((state) => state.status);
  const branch = useGitStore((state) => state.branch);
  const ahead = useGitStore((state) => state.ahead);
  const behind = useGitStore((state) => state.behind);
  const files = useGitStore((state) => state.files);
  const hasConflicts = useGitStore((state) => state.hasConflicts);
  const expandBottomPanel = useLayoutStore((state) => state.expandBottomPanel);
  const setBottomPanelTab = useLayoutStore((state) => state.setBottomPanelTab);

  const openGit = () => {
    expandBottomPanel();
    setBottomPanelTab('git');
  };

  if (!workspacePath) {
    return (
      <footer className="border-border bg-panel text-muted-foreground flex h-6 shrink-0 items-center border-t px-2 text-[11px]">
        <span>No folder open</span>
      </footer>
    );
  }

  if (status === 'not-repo') {
    return (
      <footer className="border-border bg-panel text-muted-foreground flex h-6 shrink-0 items-center border-t px-2 text-[11px]">
        <button
          type="button"
          className="hover:text-foreground inline-flex items-center gap-1.5"
          onClick={openGit}
        >
          <GitBranch className="h-3 w-3" aria-hidden />
          No Git repository
        </button>
      </footer>
    );
  }

  const dirty = files.filter((file) => !file.conflicted).length;
  const conflicts = files.filter((file) => file.conflicted).length;

  return (
    <footer className="border-border bg-panel text-muted-foreground flex h-6 shrink-0 items-center gap-3 border-t px-2 text-[11px]">
      <button
        type="button"
        className={cn(
          'hover:text-foreground inline-flex max-w-[16rem] items-center gap-1.5 truncate',
          hasConflicts && 'text-orange-500 hover:text-orange-400',
        )}
        title="Open Source Control"
        onClick={openGit}
      >
        <GitBranch className="h-3 w-3 shrink-0" aria-hidden />
        <span className="truncate">{branch ?? '…'}</span>
        {ahead > 0 ? (
          <span className="inline-flex items-center gap-0.5">
            <ArrowUp className="h-3 w-3" aria-hidden />
            {ahead}
          </span>
        ) : null}
        {behind > 0 ? (
          <span className="inline-flex items-center gap-0.5">
            <ArrowDown className="h-3 w-3" aria-hidden />
            {behind}
          </span>
        ) : null}
      </button>

      {hasConflicts ? (
        <button
          type="button"
          className="inline-flex items-center gap-1 text-orange-500 hover:text-orange-400"
          onClick={openGit}
        >
          <AlertTriangle className="h-3 w-3" aria-hidden />
          {conflicts} conflict{conflicts === 1 ? '' : 's'}
        </button>
      ) : null}

      {dirty > 0 ? (
        <button
          type="button"
          className="hover:text-foreground inline-flex items-center gap-1"
          onClick={openGit}
        >
          {dirty} change{dirty === 1 ? '' : 's'}
        </button>
      ) : (
        <span className="text-muted-foreground/70">Clean</span>
      )}
    </footer>
  );
}
