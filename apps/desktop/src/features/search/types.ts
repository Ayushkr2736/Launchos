export interface SearchLineMatch {
  readonly lineNumber: number;
  readonly column: number;
  readonly preview: string;
  readonly matchIndex: number;
  readonly matchLength: number;
}

export interface SearchFileResult {
  readonly path: string;
  readonly name: string;
  readonly filenameMatch: boolean;
  readonly matches: readonly SearchLineMatch[];
}

export interface SearchOptions {
  readonly searchFilenames: boolean;
  readonly searchContent: boolean;
  readonly caseSensitive: boolean;
  readonly useRegex: boolean;
  readonly matchWholeWord: boolean;
}

export interface SearchProgress {
  readonly scannedFiles: number;
  readonly totalFiles: number;
}

export interface ReplaceResult {
  readonly filesChanged: number;
  readonly replacements: number;
}

export const SEARCH_RECENT_MAX = 12;
export const SEARCH_MAX_FILES = 2000;
export const SEARCH_MAX_MATCHES_PER_FILE = 50;
export const SEARCH_DEBOUNCE_MS = 220;
export const SEARCH_PREVIEW_PAD = 40;
export const SEARCH_INDEX_TTL_MS = 30_000;

export const DEFAULT_SEARCH_OPTIONS: SearchOptions = {
  searchFilenames: true,
  searchContent: true,
  caseSensitive: false,
  useRegex: false,
  matchWholeWord: false,
};
