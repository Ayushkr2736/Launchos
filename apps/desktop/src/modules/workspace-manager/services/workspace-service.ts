import type { NativeFsPath } from '@/modules/filesystem';
import type {
  WorkspaceEntry,
  WorkspaceId,
  WorkspaceMetadata,
} from '@/modules/workspace-manager/types';

import { fileSystemService, getNativeBaseName } from '@/modules/filesystem';

/** Normalize a path into a stable workspace id. */
export function toWorkspaceId(path: NativeFsPath): WorkspaceId {
  return path.replace(/[/\\]+$/, '');
}

export function createWorkspaceEntry(
  path: NativeFsPath,
  options?: { name?: string; pinnedAt?: number | null; openedAt?: number },
): WorkspaceEntry {
  const id = toWorkspaceId(path);
  const now = Date.now();
  return {
    id,
    path: id,
    name: options?.name ?? getNativeBaseName(path),
    openedAt: options?.openedAt ?? now,
    lastOpenedAt: now,
    pinnedAt: options?.pinnedAt ?? null,
  };
}

/**
 * Probe disk for workspace metadata (exists / folder / name).
 */
export async function resolveWorkspaceMetadata(path: NativeFsPath): Promise<WorkspaceMetadata> {
  const normalized = toWorkspaceId(path);
  const name = getNativeBaseName(normalized);
  const now = Date.now();

  try {
    const exists = await fileSystemService.exists(normalized);
    if (!exists) {
      return {
        path: normalized,
        name,
        exists: false,
        isDirectory: false,
        lastCheckedAt: now,
        errorMessage: 'Folder not found',
      };
    }
    const stat = await fileSystemService.stat(normalized);
    return {
      path: normalized,
      name,
      exists: true,
      isDirectory: stat.kind === 'folder',
      lastCheckedAt: now,
      errorMessage: stat.kind === 'folder' ? null : 'Path is not a folder',
    };
  } catch (error) {
    return {
      path: normalized,
      name,
      exists: false,
      isDirectory: false,
      lastCheckedAt: now,
      errorMessage: error instanceof Error ? error.message : 'Failed to read workspace metadata',
    };
  }
}

export function upsertRecentList(
  list: readonly WorkspaceEntry[],
  entry: WorkspaceEntry,
  max: number,
): WorkspaceEntry[] {
  const without = list.filter((item) => item.id !== entry.id);
  return [entry, ...without].slice(0, max);
}

export function upsertPinnedList(
  list: readonly WorkspaceEntry[],
  entry: WorkspaceEntry,
  max: number,
): WorkspaceEntry[] {
  const without = list.filter((item) => item.id !== entry.id);
  const pinned = { ...entry, pinnedAt: entry.pinnedAt ?? Date.now() };
  return [pinned, ...without].slice(0, max);
}
