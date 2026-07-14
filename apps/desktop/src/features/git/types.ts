export interface GitFileEntry {
  readonly path: string;
  readonly status: string;
  readonly staged: boolean;
  readonly unstaged: boolean;
  readonly untracked: boolean;
  readonly conflicted: boolean;
}

export interface GitStatusSnapshot {
  readonly isRepo: boolean;
  readonly branch: string | null;
  readonly upstream: string | null;
  readonly ahead: number;
  readonly behind: number;
  readonly hasConflicts: boolean;
  readonly files: GitFileEntry[];
}

export interface GitCommandResult {
  readonly ok: boolean;
  readonly stdout: string;
  readonly stderr: string;
}

export interface GitBranchInfo {
  readonly name: string;
  readonly isCurrent: boolean;
  readonly isRemote: boolean;
  readonly upstream: string | null;
  readonly tip: string;
}

export interface GitCommitInfo {
  readonly hash: string;
  readonly shortHash: string;
  readonly author: string;
  readonly email: string;
  readonly timestamp: number;
  readonly subject: string;
}

export interface GitStashEntry {
  readonly index: number;
  readonly reflog: string;
  readonly message: string;
  readonly timestamp: number;
}

export type GitPanelStatus = 'idle' | 'loading' | 'ready' | 'error' | 'not-repo' | 'no-workspace';

export type GitPanelView = 'changes' | 'history' | 'stash';

export interface GitDiffRequest {
  path: string | null;
  staged: boolean;
}
