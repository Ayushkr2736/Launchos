import type { FileSystemServiceErrorCode } from '@/modules/filesystem/services/errors';
import type { FileSystemService, NativeFsPath } from '@/modules/filesystem/types';

import {
  FileSystemServiceError,
  isFileSystemServiceError,
} from '@/modules/filesystem/services/errors';

export { describeWorkspaceError, workspaceErrorCode } from '@/modules/filesystem/services/errors';

/**
 * Confirm a path exists, is a directory, and can be listed (permission probe).
 */
export async function assertWorkspaceAccessible(
  service: FileSystemService,
  path: NativeFsPath,
): Promise<void> {
  const exists = await service.exists(path);
  if (!exists) {
    throw new FileSystemServiceError('NOT_FOUND', `Folder not found: ${path}`, { path });
  }

  const meta = await service.stat(path);
  if (meta.kind !== 'folder') {
    throw new FileSystemServiceError('NOT_A_FOLDER', `Path is not a folder: ${path}`, { path });
  }

  // Forces a scoped read — surfaces PERMISSION_DENIED before the tree mounts.
  await service.readDir(path);
}

export function toUserFacingFsError(
  error: unknown,
  fallback = 'Filesystem operation failed.',
): string {
  if (isFileSystemServiceError(error)) {
    return error.message || fallback;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

export type { FileSystemServiceErrorCode };
