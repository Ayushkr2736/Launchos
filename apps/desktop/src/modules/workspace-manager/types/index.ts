import type { NativeFsPath } from '@/modules/filesystem';

/** Stable workspace id — normalized absolute path. */
export type WorkspaceId = string;

export interface WorkspaceEntry {
  readonly id: WorkspaceId;
  readonly path: NativeFsPath;
  readonly name: string;
  readonly openedAt: number;
  readonly lastOpenedAt: number;
  readonly pinnedAt: number | null;
}

export interface WorkspaceMetadata {
  readonly path: NativeFsPath;
  readonly name: string;
  readonly exists: boolean;
  readonly isDirectory: boolean;
  readonly lastCheckedAt: number;
  readonly errorMessage: string | null;
}

export interface WorkspaceSettings {
  /** Auto-expand explorer when this workspace opens. */
  readonly expandExplorerOnOpen: boolean;
  /** Prefer this as the default restore target when pinned. */
  readonly preferOnLaunch: boolean;
  /** Optional display color token for future UI chips. */
  readonly accent: string | null;
  /** Free-form notes. */
  readonly notes: string;
}

export const DEFAULT_WORKSPACE_SETTINGS: WorkspaceSettings = {
  expandExplorerOnOpen: true,
  preferOnLaunch: false,
  accent: null,
  notes: '',
};

export type WorkspaceManagerStatus = 'idle' | 'switching' | 'ready' | 'error';
