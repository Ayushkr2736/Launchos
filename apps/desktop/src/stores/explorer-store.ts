import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { FsPath } from '@/features/explorer/fs/types';

export const EXPLORER_UI_STORAGE_KEY = 'launchos.explorer.ui';

export interface ExplorerStoreState {
  /** Native project root this UI state belongs to (null = no folder). */
  projectRoot: string | null;
  expandedPaths: FsPath[];
  /** Persisted expand sets keyed by native project root. */
  expandedByRoot: Record<string, FsPath[]>;
  selectedPath: FsPath | null;
  searchQuery: string;
  renamingPath: FsPath | null;
  creating: { parentPath: FsPath; kind: 'file' | 'folder' } | null;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  selectPath: (path: FsPath | null) => void;
  toggleExpanded: (path: FsPath) => void;
  expandPath: (path: FsPath) => void;
  collapsePath: (path: FsPath) => void;
  expandAncestors: (path: FsPath) => void;
  /** Collapse every folder except the project root. */
  collapseAll: () => void;
  setRenamingPath: (path: FsPath | null) => void;
  beginCreate: (parentPath: FsPath, kind: 'file' | 'folder') => void;
  cancelCreate: () => void;
  remapPath: (from: FsPath, to: FsPath) => void;
  prunePath: (path: FsPath) => void;
  /** Bind UI expand state to a project root (restores persisted expands). */
  bindProjectRoot: (rootPath: string | null) => void;
  lastError: string | null;
  setLastError: (message: string | null) => void;
  clearError: () => void;
  /** Tree connection phase for the active workspace. */
  connectionStatus: 'idle' | 'loading' | 'indexing' | 'ready' | 'error';
  /** Paths currently loading from disk. */
  loadingPaths: FsPath[];
  /** Folder-walk progress while indexing for filter/search. */
  indexProgress: { scannedFolders: number; pendingFolders: number } | null;
  setConnectionStatus: (status: ExplorerStoreState['connectionStatus']) => void;
  setLoadingPaths: (paths: FsPath[]) => void;
  setIndexProgress: (progress: { scannedFolders: number; pendingFolders: number } | null) => void;
}

function remapList(paths: FsPath[], from: FsPath, to: FsPath): FsPath[] {
  return paths.map((path) => {
    if (path === from) {
      return to;
    }
    if (path.startsWith(`${from}/`)) {
      return `${to}${path.slice(from.length)}`;
    }
    return path;
  });
}

function pruneList(paths: FsPath[], removed: FsPath): FsPath[] {
  return paths.filter((path) => path !== removed && !path.startsWith(`${removed}/`));
}

function withRootExpand(
  state: ExplorerStoreState,
  expandedPaths: FsPath[],
): Partial<ExplorerStoreState> {
  if (!state.projectRoot) {
    return { expandedPaths };
  }
  return {
    expandedPaths,
    expandedByRoot: {
      ...state.expandedByRoot,
      [state.projectRoot]: expandedPaths,
    },
  };
}

export const useExplorerStore = create<ExplorerStoreState>()(
  persist(
    (set, get) => ({
      projectRoot: null,
      expandedPaths: ['/'],
      expandedByRoot: {},
      selectedPath: null,
      searchQuery: '',
      renamingPath: null,
      creating: null,
      lastError: null,
      connectionStatus: 'idle',
      loadingPaths: [],
      indexProgress: null,
      setSearchQuery: (query) => {
        set({ searchQuery: query });
      },
      clearSearch: () => {
        set({ searchQuery: '' });
      },
      selectPath: (path) => {
        set({ selectedPath: path });
      },
      toggleExpanded: (path) => {
        const state = get();
        const expanded = state.expandedPaths;
        const next = expanded.includes(path)
          ? expanded.filter((item) => item !== path)
          : [...expanded, path];
        set(withRootExpand(state, next));
      },
      expandPath: (path) => {
        const state = get();
        if (state.expandedPaths.includes(path)) {
          return;
        }
        set(withRootExpand(state, [...state.expandedPaths, path]));
      },
      collapsePath: (path) => {
        const state = get();
        set(
          withRootExpand(
            state,
            state.expandedPaths.filter((item) => item !== path),
          ),
        );
      },
      expandAncestors: (path) => {
        const state = get();
        const parts = path.split('/').filter(Boolean);
        const ancestors: FsPath[] = ['/'];
        let current = '';
        for (const part of parts.slice(0, -1)) {
          current = `${current}/${part}`;
          ancestors.push(current);
        }
        const merged = new Set([...state.expandedPaths, ...ancestors]);
        set(withRootExpand(state, [...merged]));
      },
      collapseAll: () => {
        const state = get();
        set(withRootExpand(state, ['/']));
      },
      setRenamingPath: (path) => {
        set({ renamingPath: path, creating: null });
      },
      beginCreate: (parentPath, kind) => {
        const state = get();
        const expanded = state.expandedPaths.includes(parentPath)
          ? state.expandedPaths
          : [...state.expandedPaths, parentPath];
        set({
          creating: { parentPath, kind },
          renamingPath: null,
          lastError: null,
          ...withRootExpand(state, expanded),
        });
      },
      cancelCreate: () => {
        set({ creating: null });
      },
      remapPath: (from, to) => {
        const state = get();
        const expandedPaths = remapList(state.expandedPaths, from, to);
        set({
          ...withRootExpand(state, expandedPaths),
          selectedPath:
            state.selectedPath === from
              ? to
              : state.selectedPath?.startsWith(`${from}/`)
                ? `${to}${state.selectedPath.slice(from.length)}`
                : state.selectedPath,
          renamingPath:
            state.renamingPath === from
              ? to
              : state.renamingPath?.startsWith(`${from}/`)
                ? `${to}${state.renamingPath.slice(from.length)}`
                : state.renamingPath,
        });
      },
      prunePath: (path) => {
        const state = get();
        set({
          ...withRootExpand(state, pruneList(state.expandedPaths, path)),
          selectedPath:
            state.selectedPath === path || state.selectedPath?.startsWith(`${path}/`)
              ? null
              : state.selectedPath,
          renamingPath:
            state.renamingPath === path || state.renamingPath?.startsWith(`${path}/`)
              ? null
              : state.renamingPath,
          creating:
            state.creating?.parentPath === path || state.creating?.parentPath.startsWith(`${path}/`)
              ? null
              : state.creating,
        });
      },
      bindProjectRoot: (rootPath) => {
        const state = get();
        if (state.projectRoot === rootPath) {
          return;
        }
        if (!rootPath) {
          set({
            projectRoot: null,
            expandedPaths: ['/'],
            selectedPath: null,
            renamingPath: null,
            creating: null,
            searchQuery: '',
            lastError: null,
            connectionStatus: 'idle',
            loadingPaths: [],
            indexProgress: null,
          });
          return;
        }
        const restored = state.expandedByRoot[rootPath] ?? ['/'];
        set({
          projectRoot: rootPath,
          expandedPaths: restored.includes('/') ? restored : ['/', ...restored],
          selectedPath: '/',
          renamingPath: null,
          creating: null,
          searchQuery: '',
          lastError: null,
          connectionStatus: 'loading',
          loadingPaths: [],
          indexProgress: null,
        });
      },
      setLastError: (message) => {
        set({ lastError: message });
      },
      clearError: () => {
        set({ lastError: null });
      },
      setConnectionStatus: (status) => {
        set({ connectionStatus: status });
      },
      setLoadingPaths: (paths) => {
        set({ loadingPaths: paths });
      },
      setIndexProgress: (progress) => {
        set({ indexProgress: progress });
      },
    }),
    {
      name: EXPLORER_UI_STORAGE_KEY,
      partialize: (state) => ({
        projectRoot: state.projectRoot,
        expandedPaths: state.expandedPaths,
        expandedByRoot: state.expandedByRoot,
        selectedPath: state.selectedPath,
        searchQuery: state.searchQuery,
      }),
    },
  ),
);
