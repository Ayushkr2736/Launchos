import type { FsPath } from '@/features/explorer/fs/types';

export const FS_ROOT_PATH = '/';

export function normalizeFsPath(path: string): FsPath {
  if (!path || path === '/') {
    return FS_ROOT_PATH;
  }
  const cleaned = path
    .replace(/\\/g, '/')
    .split('/')
    .filter((segment) => segment.length > 0 && segment !== '.')
    .join('/');
  return cleaned ? `/${cleaned}` : FS_ROOT_PATH;
}

export function joinFsPath(parent: FsPath, name: string): FsPath {
  const base = normalizeFsPath(parent);
  const segment = name.trim();
  if (!segment) {
    return base;
  }
  return base === FS_ROOT_PATH ? `/${segment}` : `${base}/${segment}`;
}

export function getFsParentPath(path: FsPath): FsPath | null {
  const normalized = normalizeFsPath(path);
  if (normalized === FS_ROOT_PATH) {
    return null;
  }
  const index = normalized.lastIndexOf('/');
  if (index <= 0) {
    return FS_ROOT_PATH;
  }
  return normalized.slice(0, index);
}

export function getFsName(path: FsPath): string {
  const normalized = normalizeFsPath(path);
  if (normalized === FS_ROOT_PATH) {
    return 'launchos';
  }
  const parts = normalized.split('/');
  return parts[parts.length - 1] ?? normalized;
}

export function isFsAncestor(ancestor: FsPath, descendant: FsPath): boolean {
  const a = normalizeFsPath(ancestor);
  const d = normalizeFsPath(descendant);
  if (a === d) {
    return true;
  }
  if (a === FS_ROOT_PATH) {
    return d.startsWith('/');
  }
  return d.startsWith(`${a}/`);
}

export function isValidFsName(name: string): boolean {
  const trimmed = name.trim();
  if (!trimmed || trimmed === '.' || trimmed === '..') {
    return false;
  }
  return !/[\\/]/.test(trimmed);
}

/** Parent of a native OS path (handles `/` and `\\`). */
export function getNativeParentFromNative(nativePath: string): string | null {
  const normalized = nativePath.replace(/[/\\]+$/, '');
  const indexForward = normalized.lastIndexOf('/');
  const indexBack = normalized.lastIndexOf('\\');
  const index = Math.max(indexForward, indexBack);
  if (index <= 0) {
    return null;
  }
  // Keep Windows drive root like `C:\`
  if (indexBack === 2 && /^[A-Za-z]:\\/.test(normalized)) {
    return normalized.slice(0, 3);
  }
  return normalized.slice(0, index);
}

export function sortFsNames(a: string, b: string, aFolder: boolean, bFolder: boolean): number {
  if (aFolder !== bFolder) {
    return aFolder ? -1 : 1;
  }
  return a.localeCompare(b, undefined, { sensitivity: 'base' });
}
