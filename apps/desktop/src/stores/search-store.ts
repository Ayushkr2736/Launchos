import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type {
  ReplaceResult,
  SearchFileResult,
  SearchOptions,
  SearchProgress,
} from '@/features/search/types';

import { DEFAULT_SEARCH_OPTIONS, SEARCH_RECENT_MAX } from '@/features/search/types';

export const SEARCH_STORAGE_KEY = 'launchos.search';

export type SearchStatus = 'idle' | 'searching' | 'ready' | 'error';
export type ReplaceStatus = 'idle' | 'replacing' | 'done' | 'error';

export interface SearchStoreState {
  query: string;
  replaceQuery: string;
  replaceOpen: boolean;
  options: SearchOptions;
  results: SearchFileResult[];
  status: SearchStatus;
  replaceStatus: ReplaceStatus;
  errorMessage: string | null;
  replaceMessage: string | null;
  progress: SearchProgress | null;
  recentSearches: string[];
  expandedPaths: string[];
  lastReplace: ReplaceResult | null;
  setQuery: (query: string) => void;
  setReplaceQuery: (value: string) => void;
  setReplaceOpen: (open: boolean) => void;
  toggleReplaceOpen: () => void;
  setOptions: (patch: Partial<SearchOptions>) => void;
  setResults: (results: SearchFileResult[], status?: SearchStatus) => void;
  setStatus: (status: SearchStatus, errorMessage?: string | null) => void;
  setReplaceStatus: (status: ReplaceStatus, message?: string | null) => void;
  setProgress: (progress: SearchProgress | null) => void;
  setLastReplace: (result: ReplaceResult | null) => void;
  pushRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  toggleExpanded: (path: string) => void;
  expandPath: (path: string) => void;
  clearResults: () => void;
}

export const useSearchStore = create<SearchStoreState>()(
  persist(
    (set, get) => ({
      query: '',
      replaceQuery: '',
      replaceOpen: false,
      options: DEFAULT_SEARCH_OPTIONS,
      results: [],
      status: 'idle',
      replaceStatus: 'idle',
      errorMessage: null,
      replaceMessage: null,
      progress: null,
      recentSearches: [],
      expandedPaths: [],
      lastReplace: null,
      setQuery: (query) => {
        set({ query });
      },
      setReplaceQuery: (value) => {
        set({ replaceQuery: value });
      },
      setReplaceOpen: (open) => {
        set({ replaceOpen: open });
      },
      toggleReplaceOpen: () => {
        set({ replaceOpen: !get().replaceOpen });
      },
      setOptions: (patch) => {
        set({ options: { ...get().options, ...patch } });
      },
      setResults: (results, status = 'ready') => {
        set({
          results,
          status,
          errorMessage: null,
          progress: null,
          expandedPaths: results.slice(0, 40).map((item) => item.path),
        });
      },
      setStatus: (status, errorMessage = null) => {
        set({ status, errorMessage });
      },
      setReplaceStatus: (status, message = null) => {
        set({ replaceStatus: status, replaceMessage: message });
      },
      setProgress: (progress) => {
        set({ progress });
      },
      setLastReplace: (result) => {
        set({ lastReplace: result });
      },
      pushRecentSearch: (query) => {
        const trimmed = query.trim();
        if (!trimmed) {
          return;
        }
        const next = [
          trimmed,
          ...get().recentSearches.filter((item) => item.toLowerCase() !== trimmed.toLowerCase()),
        ].slice(0, SEARCH_RECENT_MAX);
        set({ recentSearches: next });
      },
      clearRecentSearches: () => {
        set({ recentSearches: [] });
      },
      toggleExpanded: (path) => {
        const expanded = get().expandedPaths;
        set({
          expandedPaths: expanded.includes(path)
            ? expanded.filter((item) => item !== path)
            : [...expanded, path],
        });
      },
      expandPath: (path) => {
        if (get().expandedPaths.includes(path)) {
          return;
        }
        set({ expandedPaths: [...get().expandedPaths, path] });
      },
      clearResults: () => {
        set({
          results: [],
          status: 'idle',
          errorMessage: null,
          progress: null,
          expandedPaths: [],
          replaceStatus: 'idle',
          replaceMessage: null,
          lastReplace: null,
        });
      },
    }),
    {
      name: SEARCH_STORAGE_KEY,
      partialize: (state) => ({
        recentSearches: state.recentSearches,
        options: state.options,
        replaceOpen: state.replaceOpen,
      }),
      merge: (persisted, current) => {
        const raw = (persisted ?? {}) as Partial<SearchStoreState>;
        return {
          ...current,
          ...raw,
          options: {
            ...DEFAULT_SEARCH_OPTIONS,
            ...raw.options,
          },
        };
      },
    },
  ),
);
