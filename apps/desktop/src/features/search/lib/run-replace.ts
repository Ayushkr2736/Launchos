import type { FileSystemProvider, FsNode, FsPath } from '@/features/explorer/fs/types';
import type { ReplaceResult, SearchFileResult, SearchOptions } from '@/features/search/types';

import { contentLooksBinary, isBinaryFilePath } from '@/features/editor/utils/binary';
import { FS_ROOT_PATH } from '@/features/explorer/fs/path';
import {
  buildSearchPattern,
  replaceAllInContent,
  SearchPatternError,
} from '@/features/search/lib/match-engine';
import { invalidateSearchIndexCache } from '@/features/search/lib/run-search';
import { SEARCH_MAX_FILES } from '@/features/search/types';

function collectFiles(fs: FileSystemProvider, path: FsPath, out: FsNode[]): void {
  if (out.length >= SEARCH_MAX_FILES) {
    return;
  }
  for (const child of fs.listChildren(path)) {
    if (out.length >= SEARCH_MAX_FILES) {
      return;
    }
    if (child.kind === 'file') {
      out.push(child);
      continue;
    }
    collectFiles(fs, child.path, out);
  }
}

export interface RunReplaceParams {
  fs: FileSystemProvider;
  query: string;
  replacement: string;
  options: SearchOptions;
  /** When set, only replace inside these file paths (from current results). */
  paths?: readonly string[];
  signal?: AbortSignal;
  onProgress?: (scanned: number, total: number) => void;
}

/**
 * Replace all matches across the workspace (or a subset of result paths).
 * Filenames are never renamed here — content only.
 */
export async function runWorkspaceReplaceAll({
  fs,
  query,
  replacement,
  options,
  paths,
  signal,
  onProgress,
}: RunReplaceParams): Promise<ReplaceResult> {
  const trimmed = query.trim();
  if (!trimmed || !options.searchContent) {
    return { filesChanged: 0, replacements: 0 };
  }

  // Validate pattern.
  try {
    buildSearchPattern(trimmed, options);
  } catch (error) {
    if (error instanceof SearchPatternError) {
      throw error;
    }
    throw error;
  }

  let targets: FsNode[] = [];
  if (paths && paths.length > 0) {
    targets = paths
      .map((path) => fs.getNode(path))
      .filter((node): node is FsNode => Boolean(node && node.kind === 'file'));
  } else {
    await fs.indexTree(FS_ROOT_PATH);
    collectFiles(fs, FS_ROOT_PATH, targets);
  }

  let filesChanged = 0;
  let replacements = 0;
  const total = targets.length;

  for (let i = 0; i < targets.length; i += 1) {
    if (signal?.aborted) {
      break;
    }
    const file = targets[i];
    if (!file || file.kind !== 'file') {
      continue;
    }
    onProgress?.(i + 1, total);

    if (isBinaryFilePath(file.path) || isBinaryFilePath(file.name)) {
      continue;
    }

    try {
      const content = await fs.readFileContent(file.path);
      if (contentLooksBinary(content)) {
        continue;
      }
      const { next, count } = replaceAllInContent(content, trimmed, replacement, options);
      if (count > 0 && next !== content) {
        await fs.writeFileContent(file.path, next);
        filesChanged += 1;
        replacements += count;
      }
    } catch {
      // Skip unreadable / unwritable files.
    }
  }

  invalidateSearchIndexCache();
  return { filesChanged, replacements };
}

/** Count how many replacements the current result set would apply. */
export function countReplacementsInResults(results: readonly SearchFileResult[]): number {
  return results.reduce((sum, file) => sum + file.matches.length, 0);
}
