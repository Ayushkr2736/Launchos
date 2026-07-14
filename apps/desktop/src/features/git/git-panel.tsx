import { Button, ScrollArea, cn } from '@launchos/ui';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Download,
  GitBranch,
  History,
  Package,
  RefreshCw,
} from 'lucide-react';
import { useEffect, useMemo } from 'react';

import type { GitFileEntry, GitPanelView } from '@/features/git/types';

import { PanelHeader } from '@/components/molecules/panel-header';
import { GitBranchPicker } from '@/features/git/molecules/git-branch-picker';
import { GitCloneDialog } from '@/features/git/molecules/git-clone-dialog';
import { GitCommitForm } from '@/features/git/molecules/git-commit-form';
import { GitDiffView } from '@/features/git/molecules/git-diff-view';
import { GitFileList } from '@/features/git/molecules/git-file-list';
import { GitHistoryList } from '@/features/git/molecules/git-history-list';
import { GitStashPanel } from '@/features/git/molecules/git-stash-panel';
import { useGitStore } from '@/stores/git-store';
import { useProjectStore } from '@/stores/project-store';

const VIEWS: Array<{ id: GitPanelView; label: string; icon: typeof GitBranch }> = [
  { id: 'changes', label: 'Changes', icon: GitBranch },
  { id: 'history', label: 'History', icon: History },
  { id: 'stash', label: 'Stash', icon: Package },
];

export function GitPanel() {
  const workspacePath = useProjectStore((state) => state.workspacePath);
  const status = useGitStore((state) => state.status);
  const errorMessage = useGitStore((state) => state.errorMessage);
  const lastActionMessage = useGitStore((state) => state.lastActionMessage);
  const upstream = useGitStore((state) => state.upstream);
  const ahead = useGitStore((state) => state.ahead);
  const behind = useGitStore((state) => state.behind);
  const hasConflicts = useGitStore((state) => state.hasConflicts);
  const files = useGitStore((state) => state.files);
  const selectedDiff = useGitStore((state) => state.selectedDiff);
  const busy = useGitStore((state) => state.busy);
  const view = useGitStore((state) => state.view);
  const refresh = useGitStore((state) => state.refresh);
  const selectDiff = useGitStore((state) => state.selectDiff);
  const stage = useGitStore((state) => state.stage);
  const unstage = useGitStore((state) => state.unstage);
  const stageAll = useGitStore((state) => state.stageAll);
  const unstageAll = useGitStore((state) => state.unstageAll);
  const fetch = useGitStore((state) => state.fetch);
  const pull = useGitStore((state) => state.pull);
  const push = useGitStore((state) => state.push);
  const setView = useGitStore((state) => state.setView);
  const loadHistory = useGitStore((state) => state.loadHistory);
  const loadStashes = useGitStore((state) => state.loadStashes);
  const initRepo = useGitStore((state) => state.initRepo);
  const setCloneOpen = useGitStore((state) => state.setCloneOpen);
  const setCloneDestination = useGitStore((state) => state.setCloneDestination);

  const conflicts = useMemo(() => files.filter((file) => file.conflicted), [files]);
  const staged = useMemo(
    () => files.filter((file) => file.staged && !file.untracked && !file.conflicted),
    [files],
  );
  const changed = useMemo(
    () => files.filter((file) => (file.unstaged || file.untracked) && !file.conflicted),
    [files],
  );

  useEffect(() => {
    if (!workspacePath || status !== 'ready') {
      return;
    }
    if (view === 'history') {
      void loadHistory(workspacePath);
    }
    if (view === 'stash') {
      void loadStashes(workspacePath);
    }
  }, [loadHistory, loadStashes, status, view, workspacePath]);

  if (!workspacePath) {
    return (
      <div className="flex h-full flex-col">
        <PanelHeader title="Source Control" />
        <p className="text-muted-foreground px-3 py-8 text-center text-xs">
          Open a folder to use Git.
        </p>
        <div className="flex justify-center">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              setCloneOpen(true);
            }}
          >
            Clone Repository…
          </Button>
        </div>
        <GitCloneDialog />
      </div>
    );
  }

  if (status === 'not-repo') {
    return (
      <div className="flex h-full flex-col">
        <PanelHeader
          title="Source Control"
          actions={
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              aria-label="Refresh"
              onClick={() => {
                void refresh(workspacePath);
              }}
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden />
            </Button>
          }
        />
        <p className="text-muted-foreground px-3 py-6 text-center text-xs">
          This folder is not a Git repository.
        </p>
        <div className="flex flex-col items-center gap-2 px-3">
          <Button
            type="button"
            size="sm"
            disabled={busy}
            onClick={() => {
              void initRepo(workspacePath);
            }}
          >
            Initialize Repository
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => {
              setCloneDestination(workspacePath);
              setCloneOpen(true);
            }}
          >
            Clone Repository…
          </Button>
        </div>
        {errorMessage ? (
          <p className="text-destructive mt-3 px-3 text-center text-xs">{errorMessage}</p>
        ) : null}
        <GitCloneDialog />
      </div>
    );
  }

  const openDiff = (file: GitFileEntry, stagedSection: boolean) => {
    void selectDiff(workspacePath, {
      path: file.path,
      staged: stagedSection,
    });
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PanelHeader
        title="Source Control"
        actions={
          <div className="flex items-center gap-0.5">
            <GitBranchPicker repoPath={workspacePath} disabled={busy} />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              aria-label="Fetch"
              disabled={busy}
              onClick={() => {
                void fetch(workspacePath);
              }}
            >
              <Download className="h-3.5 w-3.5" aria-hidden />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              aria-label="Pull"
              disabled={busy}
              onClick={() => {
                void pull(workspacePath);
              }}
            >
              <ArrowDownToLine className="h-3.5 w-3.5" aria-hidden />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              aria-label="Push"
              disabled={busy}
              onClick={() => {
                void push(workspacePath);
              }}
            >
              <ArrowUpFromLine className="h-3.5 w-3.5" aria-hidden />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              aria-label="Refresh"
              disabled={busy}
              onClick={() => {
                void refresh(workspacePath);
              }}
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden />
            </Button>
          </div>
        }
      />

      <div className="border-border text-muted-foreground flex h-6 shrink-0 items-center gap-2 border-b px-2 text-[10px]">
        {upstream ? <span className="truncate">↔ {upstream}</span> : <span>No upstream</span>}
        {ahead > 0 ? <span>↑{ahead}</span> : null}
        {behind > 0 ? <span>↓{behind}</span> : null}
        {hasConflicts ? (
          <span className="text-orange-500">
            {conflicts.length} conflict{conflicts.length === 1 ? '' : 's'}
          </span>
        ) : null}
        {lastActionMessage ? (
          <span className="ml-auto text-emerald-500">{lastActionMessage}</span>
        ) : null}
        {errorMessage ? (
          <span className="text-destructive ml-auto truncate">{errorMessage}</span>
        ) : null}
      </div>

      <div className="border-border flex h-7 shrink-0 items-center gap-0.5 border-b px-1">
        {VIEWS.map((item) => {
          const Icon = item.icon;
          const active = view === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={cn(
                'inline-flex h-6 items-center gap-1 rounded-md px-2 text-[11px]',
                active
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground',
              )}
              onClick={() => {
                setView(item.id);
              }}
            >
              <Icon className="h-3 w-3" aria-hidden />
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-2">
        <ScrollArea className="border-border min-h-0 border-b md:border-b-0 md:border-r">
          {view === 'changes' ? (
            <>
              <GitCommitForm
                repoPath={workspacePath}
                stagedCount={staged.length}
                disabled={busy || status === 'loading' || hasConflicts}
              />
              {conflicts.length > 0 ? (
                <GitFileList
                  title="Merge Conflicts"
                  files={conflicts}
                  emptyLabel="No conflicts"
                  selectedPath={selectedDiff?.path ?? null}
                  selectedStaged={selectedDiff?.staged ?? false}
                  sectionStaged={false}
                  onSelect={(file) => {
                    openDiff(file, false);
                  }}
                  onToggleStage={(file) => {
                    void stage(workspacePath, [file.path]);
                  }}
                />
              ) : null}
              <GitFileList
                title="Staged Changes"
                files={staged}
                emptyLabel="No staged changes"
                selectedPath={selectedDiff?.path ?? null}
                selectedStaged={selectedDiff?.staged ?? false}
                sectionStaged
                toggleAllLabel="Unstage All"
                onToggleAll={() => {
                  void unstageAll(workspacePath);
                }}
                onSelect={(file) => {
                  openDiff(file, true);
                }}
                onToggleStage={(file) => {
                  void unstage(workspacePath, [file.path]);
                }}
              />
              <GitFileList
                title="Changes"
                files={changed}
                emptyLabel="No changes"
                selectedPath={selectedDiff?.path ?? null}
                selectedStaged={selectedDiff?.staged ?? false}
                sectionStaged={false}
                toggleAllLabel="Stage All"
                onToggleAll={() => {
                  void stageAll(workspacePath);
                }}
                onSelect={(file) => {
                  openDiff(file, false);
                }}
                onToggleStage={(file) => {
                  void stage(workspacePath, [file.path]);
                }}
              />
            </>
          ) : null}
          {view === 'history' ? <GitHistoryList repoPath={workspacePath} /> : null}
          {view === 'stash' ? <GitStashPanel repoPath={workspacePath} disabled={busy} /> : null}
        </ScrollArea>
        <div className="flex min-h-0 flex-col">
          <GitDiffView />
        </div>
      </div>
      <GitCloneDialog />
    </div>
  );
}
