import type { NativeFsPath } from '@/modules/filesystem/types';

import { FileSystemServiceError } from '@/modules/filesystem/services/errors';

/** Reject empty names and path separators / traversal segments. */
export function assertValidEntryName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed || trimmed === '.' || trimmed === '..') {
    throw new FileSystemServiceError('INVALID_NAME', `Invalid entry name: "${name}"`);
  }
  if (/[/\\]/.test(trimmed)) {
    throw new FileSystemServiceError(
      'INVALID_NAME',
      `Entry name must not contain path separators: "${name}"`,
    );
  }
  return trimmed;
}

export function assertNonEmptyPath(path: NativeFsPath, label = 'path'): NativeFsPath {
  const trimmed = path.trim();
  if (!trimmed) {
    throw new FileSystemServiceError('INVALID_PATH', `Invalid ${label}: path is empty`);
  }
  if (trimmed.includes('\0')) {
    throw new FileSystemServiceError('INVALID_PATH', `Invalid ${label}: contains null byte`, {
      path: trimmed,
    });
  }
  return trimmed;
}

/** Detect path separator from an existing absolute path. */
export function detectPathSeparator(path: NativeFsPath): '/' | '\\' {
  if (path.includes('\\') && !path.includes('/')) {
    return '\\';
  }
  return '/';
}

export function joinNativePath(parent: NativeFsPath, name: string): NativeFsPath {
  const base = assertNonEmptyPath(parent, 'parent path').replace(/[/\\]+$/, '');
  const entry = assertValidEntryName(name);
  const sep = detectPathSeparator(base);
  return `${base}${sep}${entry}`;
}

export function getNativeBaseName(path: NativeFsPath): string {
  const normalized = assertNonEmptyPath(path).replace(/[/\\]+$/, '');
  const parts = normalized.split(/[/\\]/);
  return parts[parts.length - 1] ?? normalized;
}

export function getNativeParentPath(path: NativeFsPath): NativeFsPath | null {
  const normalized = assertNonEmptyPath(path).replace(/[/\\]+$/, '');
  const sep = detectPathSeparator(normalized);
  const index = normalized.lastIndexOf(sep);
  if (index <= 0) {
    return null;
  }
  // Keep Windows drive root (`C:\`) intact.
  if (sep === '\\' && index === 2 && /^[A-Za-z]:$/.test(normalized.slice(0, 2))) {
    return `${normalized.slice(0, 2)}${sep}`;
  }
  return normalized.slice(0, index);
}

export function pathsEqual(a: NativeFsPath, b: NativeFsPath): boolean {
  const left = a.replace(/[/\\]+$/, '');
  const right = b.replace(/[/\\]+$/, '');
  const windowsLike = left.includes('\\') || right.includes('\\') || /^[A-Za-z]:/.test(left);
  if (windowsLike) {
    return left.toLowerCase() === right.toLowerCase();
  }
  return left === right;
}
