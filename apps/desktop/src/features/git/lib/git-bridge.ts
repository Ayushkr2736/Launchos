import { invoke } from '@tauri-apps/api/core';

import type {
  GitBranchInfo,
  GitCommandResult,
  GitCommitInfo,
  GitStashEntry,
  GitStatusSnapshot,
} from '@/features/git/types';

import { detectTauriRuntime } from '@/window/native';

function requireTauri(): void {
  if (!detectTauriRuntime()) {
    throw new Error('Git requires the LaunchOS desktop app');
  }
}

export async function fetchGitStatus(repoPath: string): Promise<GitStatusSnapshot> {
  requireTauri();
  return invoke<GitStatusSnapshot>('git_status', { repoPath });
}

export async function fetchGitDiff(
  repoPath: string,
  path: string | null,
  staged: boolean,
): Promise<string> {
  requireTauri();
  return invoke<string>('git_diff', { repoPath, path, staged });
}

export async function stageGitPaths(repoPath: string, paths: string[]): Promise<void> {
  requireTauri();
  await invoke('git_stage', { repoPath, paths });
}

export async function unstageGitPaths(repoPath: string, paths: string[]): Promise<void> {
  requireTauri();
  await invoke('git_unstage', { repoPath, paths });
}

export async function commitGit(repoPath: string, message: string): Promise<GitCommandResult> {
  requireTauri();
  return invoke<GitCommandResult>('git_commit', { repoPath, message });
}

export async function fetchRemote(repoPath: string): Promise<GitCommandResult> {
  requireTauri();
  return invoke<GitCommandResult>('git_fetch', { repoPath });
}

export async function pullRemote(repoPath: string): Promise<GitCommandResult> {
  requireTauri();
  return invoke<GitCommandResult>('git_pull', { repoPath });
}

export async function pushRemote(repoPath: string): Promise<GitCommandResult> {
  requireTauri();
  return invoke<GitCommandResult>('git_push', { repoPath });
}

export async function listGitBranches(repoPath: string): Promise<GitBranchInfo[]> {
  requireTauri();
  return invoke<GitBranchInfo[]>('git_branches', { repoPath });
}

export async function checkoutGitBranch(
  repoPath: string,
  branch: string,
  create = false,
): Promise<GitCommandResult> {
  requireTauri();
  return invoke<GitCommandResult>('git_checkout', { repoPath, branch, create });
}

export async function cloneGitRepo(url: string, destination: string): Promise<GitCommandResult> {
  requireTauri();
  return invoke<GitCommandResult>('git_clone', { url, destination });
}

export async function initGitRepo(repoPath: string): Promise<GitCommandResult> {
  requireTauri();
  return invoke<GitCommandResult>('git_init', { repoPath });
}

export async function fetchGitLog(repoPath: string, limit = 50): Promise<GitCommitInfo[]> {
  requireTauri();
  return invoke<GitCommitInfo[]>('git_log', { repoPath, limit });
}

export async function fetchGitShow(repoPath: string, revision: string): Promise<string> {
  requireTauri();
  return invoke<string>('git_show', { repoPath, revision });
}

export async function listGitStashes(repoPath: string): Promise<GitStashEntry[]> {
  requireTauri();
  return invoke<GitStashEntry[]>('git_stash_list', { repoPath });
}

export async function stashGitPush(
  repoPath: string,
  message?: string | null,
  includeUntracked = true,
): Promise<GitCommandResult> {
  requireTauri();
  return invoke<GitCommandResult>('git_stash_push', {
    repoPath,
    message: message ?? null,
    includeUntracked,
  });
}

export async function stashGitApply(
  repoPath: string,
  reflog?: string | null,
): Promise<GitCommandResult> {
  requireTauri();
  return invoke<GitCommandResult>('git_stash_apply', {
    repoPath,
    reflog: reflog ?? null,
  });
}

export async function stashGitPop(
  repoPath: string,
  reflog?: string | null,
): Promise<GitCommandResult> {
  requireTauri();
  return invoke<GitCommandResult>('git_stash_pop', {
    repoPath,
    reflog: reflog ?? null,
  });
}

export async function stashGitDrop(
  repoPath: string,
  reflog?: string | null,
): Promise<GitCommandResult> {
  requireTauri();
  return invoke<GitCommandResult>('git_stash_drop', {
    repoPath,
    reflog: reflog ?? null,
  });
}
