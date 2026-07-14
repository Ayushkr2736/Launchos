import { create } from 'zustand';

import type {
  GitBranchInfo,
  GitCommitInfo,
  GitDiffRequest,
  GitFileEntry,
  GitPanelStatus,
  GitPanelView,
  GitStashEntry,
  GitStatusSnapshot,
} from '@/features/git/types';

import {
  checkoutGitBranch,
  cloneGitRepo,
  commitGit,
  fetchGitDiff,
  fetchGitLog,
  fetchGitShow,
  fetchGitStatus,
  fetchRemote,
  initGitRepo,
  listGitBranches,
  listGitStashes,
  pullRemote,
  pushRemote,
  stageGitPaths,
  stashGitApply,
  stashGitDrop,
  stashGitPop,
  stashGitPush,
  unstageGitPaths,
} from '@/features/git/lib/git-bridge';

interface GitStoreState {
  status: GitPanelStatus;
  errorMessage: string | null;
  lastActionMessage: string | null;
  branch: string | null;
  upstream: string | null;
  ahead: number;
  behind: number;
  hasConflicts: boolean;
  files: GitFileEntry[];
  commitMessage: string;
  selectedDiff: GitDiffRequest | null;
  diffText: string;
  diffLoading: boolean;
  busy: boolean;
  view: GitPanelView;
  branches: GitBranchInfo[];
  branchesLoading: boolean;
  commits: GitCommitInfo[];
  historyLoading: boolean;
  selectedCommitHash: string | null;
  stashes: GitStashEntry[];
  stashLoading: boolean;
  stashMessage: string;
  cloneOpen: boolean;
  cloneUrl: string;
  cloneDestination: string;
  setCommitMessage: (message: string) => void;
  setView: (view: GitPanelView) => void;
  setStashMessage: (message: string) => void;
  setCloneOpen: (open: boolean) => void;
  setCloneUrl: (url: string) => void;
  setCloneDestination: (path: string) => void;
  clearActionMessage: () => void;
  refresh: (repoPath: string | null) => Promise<void>;
  loadBranches: (repoPath: string) => Promise<void>;
  loadHistory: (repoPath: string) => Promise<void>;
  loadStashes: (repoPath: string) => Promise<void>;
  selectDiff: (repoPath: string, request: GitDiffRequest) => Promise<void>;
  selectCommit: (repoPath: string, hash: string) => Promise<void>;
  clearDiff: () => void;
  stage: (repoPath: string, paths: string[]) => Promise<void>;
  unstage: (repoPath: string, paths: string[]) => Promise<void>;
  stageAll: (repoPath: string) => Promise<void>;
  unstageAll: (repoPath: string) => Promise<void>;
  commit: (repoPath: string) => Promise<boolean>;
  fetch: (repoPath: string) => Promise<void>;
  pull: (repoPath: string) => Promise<void>;
  push: (repoPath: string) => Promise<void>;
  checkout: (repoPath: string, branch: string, create?: boolean) => Promise<boolean>;
  initRepo: (repoPath: string) => Promise<boolean>;
  cloneRepo: () => Promise<string | null>;
  stashPush: (repoPath: string) => Promise<void>;
  stashApply: (repoPath: string, reflog?: string) => Promise<void>;
  stashPop: (repoPath: string, reflog?: string) => Promise<void>;
  stashDrop: (repoPath: string, reflog?: string) => Promise<void>;
}

function applySnapshot(
  set: (partial: Partial<GitStoreState>) => void,
  snapshot: GitStatusSnapshot,
): void {
  if (!snapshot.isRepo) {
    set({
      status: 'not-repo',
      branch: null,
      upstream: null,
      ahead: 0,
      behind: 0,
      hasConflicts: false,
      files: [],
      errorMessage: null,
    });
    return;
  }
  set({
    status: 'ready',
    branch: snapshot.branch,
    upstream: snapshot.upstream,
    ahead: snapshot.ahead,
    behind: snapshot.behind,
    hasConflicts: snapshot.hasConflicts,
    files: snapshot.files,
    errorMessage: null,
  });
}

async function runRemoteAction(
  set: (partial: Partial<GitStoreState>) => void,
  get: () => GitStoreState,
  repoPath: string,
  action: () => Promise<{ ok: boolean; stdout: string; stderr: string }>,
  successLabel: string,
  failureLabel: string,
): Promise<void> {
  set({ busy: true, lastActionMessage: null, errorMessage: null });
  try {
    const result = await action();
    if (!result.ok) {
      set({ errorMessage: result.stderr || result.stdout || failureLabel });
    } else {
      set({ lastActionMessage: successLabel });
    }
    await get().refresh(repoPath);
  } catch (error) {
    set({
      errorMessage: error instanceof Error ? error.message : String(error),
    });
  } finally {
    set({ busy: false });
  }
}

export const useGitStore = create<GitStoreState>((set, get) => ({
  status: 'idle',
  errorMessage: null,
  lastActionMessage: null,
  branch: null,
  upstream: null,
  ahead: 0,
  behind: 0,
  hasConflicts: false,
  files: [],
  commitMessage: '',
  selectedDiff: null,
  diffText: '',
  diffLoading: false,
  busy: false,
  view: 'changes',
  branches: [],
  branchesLoading: false,
  commits: [],
  historyLoading: false,
  selectedCommitHash: null,
  stashes: [],
  stashLoading: false,
  stashMessage: '',
  cloneOpen: false,
  cloneUrl: '',
  cloneDestination: '',
  setCommitMessage: (message) => {
    set({ commitMessage: message });
  },
  setView: (view) => {
    set({ view });
  },
  setStashMessage: (message) => {
    set({ stashMessage: message });
  },
  setCloneOpen: (open) => {
    set({ cloneOpen: open });
  },
  setCloneUrl: (url) => {
    set({ cloneUrl: url });
  },
  setCloneDestination: (path) => {
    set({ cloneDestination: path });
  },
  clearActionMessage: () => {
    set({ lastActionMessage: null });
  },
  refresh: async (repoPath) => {
    if (!repoPath) {
      set({
        status: 'no-workspace',
        branch: null,
        upstream: null,
        ahead: 0,
        behind: 0,
        hasConflicts: false,
        files: [],
        branches: [],
        commits: [],
        stashes: [],
        selectedDiff: null,
        diffText: '',
        errorMessage: null,
      });
      return;
    }
    set({ status: 'loading', errorMessage: null });
    try {
      const snapshot = await fetchGitStatus(repoPath);
      applySnapshot(set, snapshot);
      const selected = get().selectedDiff;
      if (selected?.path && snapshot.isRepo) {
        await get().selectDiff(repoPath, selected);
      }
      if (snapshot.isRepo) {
        void get().loadBranches(repoPath);
        if (get().view === 'history') {
          void get().loadHistory(repoPath);
        }
        if (get().view === 'stash') {
          void get().loadStashes(repoPath);
        }
      }
    } catch (error) {
      set({
        status: 'error',
        errorMessage: error instanceof Error ? error.message : String(error),
      });
    }
  },
  loadBranches: async (repoPath) => {
    set({ branchesLoading: true });
    try {
      const branches = await listGitBranches(repoPath);
      set({ branches, branchesLoading: false });
    } catch (error) {
      set({
        branchesLoading: false,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
    }
  },
  loadHistory: async (repoPath) => {
    set({ historyLoading: true });
    try {
      const commits = await fetchGitLog(repoPath, 80);
      set({ commits, historyLoading: false });
    } catch (error) {
      set({
        historyLoading: false,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
    }
  },
  loadStashes: async (repoPath) => {
    set({ stashLoading: true });
    try {
      const stashes = await listGitStashes(repoPath);
      set({ stashes, stashLoading: false });
    } catch (error) {
      set({
        stashLoading: false,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
    }
  },
  selectDiff: async (repoPath, request) => {
    set({
      selectedDiff: request,
      selectedCommitHash: null,
      diffLoading: true,
      diffText: '',
    });
    try {
      const text = await fetchGitDiff(repoPath, request.path, request.staged);
      set({
        diffText: text || 'No changes in this diff.',
        diffLoading: false,
      });
    } catch (error) {
      set({
        diffText: error instanceof Error ? error.message : String(error),
        diffLoading: false,
      });
    }
  },
  selectCommit: async (repoPath, hash) => {
    set({
      selectedCommitHash: hash,
      selectedDiff: null,
      diffLoading: true,
      diffText: '',
    });
    try {
      const text = await fetchGitShow(repoPath, hash);
      set({
        diffText: text || 'No commit content.',
        diffLoading: false,
      });
    } catch (error) {
      set({
        diffText: error instanceof Error ? error.message : String(error),
        diffLoading: false,
      });
    }
  },
  clearDiff: () => {
    set({
      selectedDiff: null,
      selectedCommitHash: null,
      diffText: '',
      diffLoading: false,
    });
  },
  stage: async (repoPath, paths) => {
    set({ busy: true, lastActionMessage: null });
    try {
      await stageGitPaths(repoPath, paths);
      await get().refresh(repoPath);
    } catch (error) {
      set({
        errorMessage: error instanceof Error ? error.message : String(error),
      });
    } finally {
      set({ busy: false });
    }
  },
  unstage: async (repoPath, paths) => {
    set({ busy: true, lastActionMessage: null });
    try {
      await unstageGitPaths(repoPath, paths);
      await get().refresh(repoPath);
    } catch (error) {
      set({
        errorMessage: error instanceof Error ? error.message : String(error),
      });
    } finally {
      set({ busy: false });
    }
  },
  stageAll: async (repoPath) => {
    await get().stage(repoPath, []);
  },
  unstageAll: async (repoPath) => {
    await get().unstage(repoPath, []);
  },
  commit: async (repoPath) => {
    const message = get().commitMessage.trim();
    if (!message) {
      set({ errorMessage: 'Enter a commit message' });
      return false;
    }
    set({ busy: true, errorMessage: null, lastActionMessage: null });
    try {
      const result = await commitGit(repoPath, message);
      if (!result.ok) {
        set({
          errorMessage: result.stderr || result.stdout || 'Commit failed',
          busy: false,
        });
        return false;
      }
      set({ commitMessage: '', lastActionMessage: 'Committed' });
      await get().refresh(repoPath);
      get().clearDiff();
      return true;
    } catch (error) {
      set({
        errorMessage: error instanceof Error ? error.message : String(error),
      });
      return false;
    } finally {
      set({ busy: false });
    }
  },
  fetch: async (repoPath) => {
    await runRemoteAction(
      set,
      get,
      repoPath,
      () => fetchRemote(repoPath),
      'Fetched',
      'Fetch failed',
    );
  },
  pull: async (repoPath) => {
    await runRemoteAction(set, get, repoPath, () => pullRemote(repoPath), 'Pulled', 'Pull failed');
  },
  push: async (repoPath) => {
    await runRemoteAction(set, get, repoPath, () => pushRemote(repoPath), 'Pushed', 'Push failed');
  },
  checkout: async (repoPath, branch, create = false) => {
    set({ busy: true, errorMessage: null, lastActionMessage: null });
    try {
      const result = await checkoutGitBranch(repoPath, branch, create);
      if (!result.ok) {
        set({
          errorMessage: result.stderr || result.stdout || 'Checkout failed',
          busy: false,
        });
        return false;
      }
      set({ lastActionMessage: create ? `Created ${branch}` : `Checked out ${branch}` });
      await get().refresh(repoPath);
      return true;
    } catch (error) {
      set({
        errorMessage: error instanceof Error ? error.message : String(error),
      });
      return false;
    } finally {
      set({ busy: false });
    }
  },
  initRepo: async (repoPath) => {
    set({ busy: true, errorMessage: null, lastActionMessage: null });
    try {
      const result = await initGitRepo(repoPath);
      if (!result.ok) {
        set({
          errorMessage: result.stderr || result.stdout || 'git init failed',
          busy: false,
        });
        return false;
      }
      set({ lastActionMessage: 'Initialized repository' });
      await get().refresh(repoPath);
      return true;
    } catch (error) {
      set({
        errorMessage: error instanceof Error ? error.message : String(error),
      });
      return false;
    } finally {
      set({ busy: false });
    }
  },
  cloneRepo: async () => {
    const url = get().cloneUrl.trim();
    const destination = get().cloneDestination.trim();
    if (!url || !destination) {
      set({ errorMessage: 'Clone URL and destination are required' });
      return null;
    }
    set({ busy: true, errorMessage: null, lastActionMessage: null });
    try {
      const result = await cloneGitRepo(url, destination);
      if (!result.ok) {
        set({
          errorMessage: result.stderr || result.stdout || 'Clone failed',
          busy: false,
        });
        return null;
      }
      set({
        cloneOpen: false,
        cloneUrl: '',
        lastActionMessage: 'Cloned',
      });
      return destination;
    } catch (error) {
      set({
        errorMessage: error instanceof Error ? error.message : String(error),
      });
      return null;
    } finally {
      set({ busy: false });
    }
  },
  stashPush: async (repoPath) => {
    set({ busy: true, errorMessage: null, lastActionMessage: null });
    try {
      const result = await stashGitPush(repoPath, get().stashMessage || null, true);
      if (!result.ok) {
        set({ errorMessage: result.stderr || result.stdout || 'Stash failed' });
      } else {
        set({ stashMessage: '', lastActionMessage: 'Stashed' });
      }
      await get().refresh(repoPath);
      await get().loadStashes(repoPath);
    } catch (error) {
      set({
        errorMessage: error instanceof Error ? error.message : String(error),
      });
    } finally {
      set({ busy: false });
    }
  },
  stashApply: async (repoPath, reflog) => {
    set({ busy: true, errorMessage: null, lastActionMessage: null });
    try {
      const result = await stashGitApply(repoPath, reflog);
      if (!result.ok) {
        set({ errorMessage: result.stderr || result.stdout || 'Apply failed' });
      } else {
        set({ lastActionMessage: 'Stash applied' });
      }
      await get().refresh(repoPath);
      await get().loadStashes(repoPath);
    } catch (error) {
      set({
        errorMessage: error instanceof Error ? error.message : String(error),
      });
    } finally {
      set({ busy: false });
    }
  },
  stashPop: async (repoPath, reflog) => {
    set({ busy: true, errorMessage: null, lastActionMessage: null });
    try {
      const result = await stashGitPop(repoPath, reflog);
      if (!result.ok) {
        set({ errorMessage: result.stderr || result.stdout || 'Pop failed' });
      } else {
        set({ lastActionMessage: 'Stash popped' });
      }
      await get().refresh(repoPath);
      await get().loadStashes(repoPath);
    } catch (error) {
      set({
        errorMessage: error instanceof Error ? error.message : String(error),
      });
    } finally {
      set({ busy: false });
    }
  },
  stashDrop: async (repoPath, reflog) => {
    set({ busy: true, errorMessage: null, lastActionMessage: null });
    try {
      const result = await stashGitDrop(repoPath, reflog);
      if (!result.ok) {
        set({ errorMessage: result.stderr || result.stdout || 'Drop failed' });
      } else {
        set({ lastActionMessage: 'Stash dropped' });
      }
      await get().loadStashes(repoPath);
    } catch (error) {
      set({
        errorMessage: error instanceof Error ? error.message : String(error),
      });
    } finally {
      set({ busy: false });
    }
  },
}));
