export { SearchPanel } from '@/features/search/search';
export {
  useSearchShortcut,
  requestSearchInputFocus,
  requestReplaceInputFocus,
} from '@/features/search/hooks/use-search-shortcut';
export { useSearchActions } from '@/features/search/hooks/use-search-actions';
export { useSearchReplace } from '@/features/search/hooks/use-search-replace';
export { runWorkspaceSearch, invalidateSearchIndexCache } from '@/features/search/lib/run-search';
export { runWorkspaceReplaceAll } from '@/features/search/lib/run-replace';
export type {
  SearchFileResult,
  SearchLineMatch,
  SearchOptions,
  ReplaceResult,
} from '@/features/search/types';
export { DEFAULT_SEARCH_OPTIONS } from '@/features/search/types';
