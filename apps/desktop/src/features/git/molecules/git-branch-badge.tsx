import { cn } from '@launchos/ui';
import { ArrowDown, ArrowUp, GitBranch } from 'lucide-react';

import { useGitStore } from '@/stores/git-store';
import { useLayoutStore } from '@/stores/layout-store';
import { useProjectStore } from '@/stores/project-store';

/** Title-bar status indicator: branch + dirty/sync/conflict cues. */
export function GitBranchBadge() {
  const workspacePath = useProjectStore((state) => state.workspacePath);
  const status = useGitStore((state) => state.status);
  const branch = useGitStore((state) => state.branch);
  const ahead = useGitStore((state) => state.ahead);
  const behind = useGitStore((state) => state.behind);
  const files = useGitStore((state) => state.files);
  const hasConflicts = useGitStore((state) => state.hasConflicts);
  const expandBottomPanel = useLayoutStore((state) => state.expandBottomPanel);
  const setBottomPanelTab = useLayoutStore((state) => state.setBottomPanelTab);

  const dirty = files.length > 0;
  const label = !workspacePath
    ? 'No folder'
    : status === 'not-repo'
      ? 'No git'
      : status === 'loading'
        ? '…'
        : (branch ?? 'No branch');

  return (
    <button
      type="button"
      className={cn(
        'inline-flex h-8 max-w-[14rem] items-center gap-1.5 rounded-md px-2 text-xs transition-colors',
        'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        hasConflicts && 'text-orange-500 hover:text-orange-400',
      )}
      title="Open Source Control"
      onClick={() => {
        expandBottomPanel();
        setBottomPanelTab('git');
      }}
    >
      <span className="relative">
        <GitBranch className="h-3.5 w-3.5" aria-hidden />
        {dirty ? (
          <span
            className={cn(
              'absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full',
              hasConflicts ? 'bg-orange-500' : 'bg-amber-400',
            )}
            aria-hidden
          />
        ) : null}
      </span>
      <span className="truncate">{label}</span>
      {ahead > 0 ? (
        <span className="inline-flex items-center gap-0.5 text-[10px]">
          <ArrowUp className="h-3 w-3" aria-hidden />
          {ahead}
        </span>
      ) : null}
      {behind > 0 ? (
        <span className="inline-flex items-center gap-0.5 text-[10px]">
          <ArrowDown className="h-3 w-3" aria-hidden />
          {behind}
        </span>
      ) : null}
    </button>
  );
}
