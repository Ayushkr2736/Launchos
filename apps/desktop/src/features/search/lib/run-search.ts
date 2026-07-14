import type { FileSystemProvider, FsNode, FsPath } from '@/features/explorer/fs/types';
import type { SearchFileResult, SearchLineMatch, SearchOptions } from '@/features/search/types';

import { contentLooksBinary, isBinaryFilePath } from '@/features/editor/utils/binary';
import { FS_ROOT_PATH } from '@/features/explorer/fs/path';
import {
  buildSearchPattern,
  findLineMatches,
  matchesFilename,
  SearchPatternError,
} from '@/features/search/lib/match-engine';
import { SEARCH_INDEX_TTL_MS, SEARCH_MAX_FILES } from '@/features/search/types';

let cachedIndexKey: string | null = null;
let cachedIndexAt = 0;

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

async function ensureIndexed(
  fs: FileSystemProvider,
  workspaceKey: string,
  signal?: AbortSignal,
): Promise<void> {
  const now = Date.now();
  if (cachedIndexKey === workspaceKey && now - cachedIndexAt < SEARCH_INDEX_TTL_MS) {
    return;
  }
  await fs.indexTree(FS_ROOT_PATH);
  if (signal?.aborted) {
    return;
  }
  cachedIndexKey = workspaceKey;
  cachedIndexAt = Date.now();
}

/** Force next search to re-index (e.g. after replace all). */
export function invalidateSearchIndexCache(): void {
  cachedIndexKey = null;
  cachedIndexAt = 0;
}

export interface RunSearchParams {
  fs: FileSystemProvider;
  query: string;
  options: SearchOptions;
  workspaceKey?: string;
  signal?: AbortSignal;
  onProgress?: (scanned: number, total: number) => void;
}

export async function runWorkspaceSearch({
  fs,
  query,
  options,
  workspaceKey = 'default',
  signal,
  onProgress,
}: RunSearchParams): Promise<SearchFileResult[]> {
  const trimmed = query.trim();
  if (!trimmed || (!options.searchFilenames && !options.searchContent)) {
    return [];
  }

  // Validate pattern early (regex errors surface to UI).
  try {
    buildSearchPattern(trimmed, options);
  } catch (error) {
    if (error instanceof SearchPatternError) {
      throw error;
    }
    throw error;
  }

  await ensureIndexed(fs, workspaceKey, signal);
  if (signal?.aborted) {
    return [];
  }

  const files: FsNode[] = [];
  collectFiles(fs, FS_ROOT_PATH, files);
  const results: SearchFileResult[] = [];
  const total = files.length;

  for (let i = 0; i < files.length; i += 1) {
    if (signal?.aborted) {
      break;
    }
    const file = files[i];
    if (!file || file.kind !== 'file') {
      continue;
    }

    onProgress?.(i + 1, total);

    const filenameMatch = options.searchFilenames && matchesFilename(file.name, trimmed, options);

    let matches: SearchLineMatch[] = [];
    if (options.searchContent && !isBinaryFilePath(file.path) && !isBinaryFilePath(file.name)) {
      try {
        const content = await fs.readFileContent(file.path);
        if (!contentLooksBinary(content)) {
          matches = findLineMatches(content, trimmed, options);
        }
      } catch {
        // Skip unreadable files.
      }
    }

    if (filenameMatch || matches.length > 0) {
      results.push({
        path: file.path,
        name: file.name,
        filenameMatch: Boolean(filenameMatch),
        matches,
      });
    }
  }

  return results;
}
