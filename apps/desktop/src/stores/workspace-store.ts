import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type {
  WorkspaceContentState,
  WorkspacePaneId,
  WorkspacePaneState,
  WorkspaceTab,
} from '@/types/shell';

import { WORKSPACE_SPLIT_RATIO, createPaneState } from '@/features/workspace/constants';
import {
  clampReorderIndex,
  isTabPinned,
  partitionPinnedTabs,
  withPinned,
} from '@/features/workspace/utils/tab-order';
import { WORKSPACE_STORAGE_KEY } from '@/layout/constants';
import { useEditorViewStateStore } from '@/stores/editor-view-state-store';

const CLOSED_STACK_MAX = 20;

function clampRatio(value: number): number {
  return Math.min(WORKSPACE_SPLIT_RATIO.max, Math.max(WORKSPACE_SPLIT_RATIO.min, value));
}

function withPaneView(
  pane: WorkspacePaneState,
  activeTabId: string | null,
  viewState?: WorkspaceContentState,
  errorMessage: string | null = null,
): WorkspacePaneState {
  const nextState = viewState ?? (activeTabId ? ('ready' as const) : ('empty' as const));
  return {
    ...pane,
    activeTabId,
    viewState: nextState,
    errorMessage: nextState === 'error' ? errorMessage : null,
  };
}

function clearViewStates(tabIds: readonly string[]): void {
  const store = useEditorViewStateStore.getState();
  for (const id of tabIds) {
    store.clearViewState(id);
  }
}

function stripDirty(tabs: readonly WorkspaceTab[]): WorkspaceTab[] {
  return tabs.map((tab) => {
    if (!tab.dirty) {
      return tab;
    }
    const { dirty: _dirty, ...rest } = tab;
    return rest;
  });
}

function snapshotTab(tab: WorkspaceTab): WorkspaceTab {
  const { dirty: _dirty, pinned: _pinned, ...rest } = tab;
  return { ...rest, closable: true };
}

export interface WorkspaceSessionSnapshot {
  readonly tabs: WorkspaceTab[];
  readonly panes: Record<WorkspacePaneId, WorkspacePaneState>;
  readonly focusedPaneId: WorkspacePaneId;
  readonly splitEnabled: boolean;
  readonly splitRatio: number;
}

export interface WorkspaceStoreState {
  workspaceName: string;
  /** Native project root this tab session belongs to. */
  sessionRoot: string | null;
  /** Persisted tab sessions keyed by native workspace path. */
  sessionsByRoot: Record<string, WorkspaceSessionSnapshot>;
  tabs: WorkspaceTab[];
  panes: Record<WorkspacePaneId, WorkspacePaneState>;
  focusedPaneId: WorkspacePaneId;
  splitEnabled: boolean;
  splitRatio: number;
  /** Recently closed tabs for reopen (newest last). */
  closedTabs: WorkspaceTab[];
  setWorkspaceName: (name: string) => void;
  /** Snapshot current tabs and load session for the given project root. */
  bindSessionRoot: (rootPath: string | null) => void;
  openTab: (tab: WorkspaceTab, paneId?: WorkspacePaneId) => void;
  remapTabPath: (from: string, to: string, title?: string) => void;
  closeTab: (tabId: string, options?: { force?: boolean }) => void;
  closeOtherTabs: (tabId: string) => void;
  closeTabsToTheLeft: (tabId: string) => void;
  closeTabsToTheRight: (tabId: string) => void;
  closeAllTabs: (options?: { includePinned?: boolean }) => void;
  reorderTabs: (fromIndex: number, toIndex: number) => void;
  pinTab: (tabId: string) => void;
  unpinTab: (tabId: string) => void;
  togglePinTab: (tabId: string) => void;
  duplicateTab: (tabId: string) => void;
  pushClosedTab: (tab: WorkspaceTab) => void;
  reopenClosedTab: () => void;
  cycleTab: (direction: 1 | -1) => void;
  setActiveTab: (tabId: string, paneId?: WorkspacePaneId) => void;
  setTabDirty: (tabId: string, dirty: boolean) => void;
  focusPane: (paneId: WorkspacePaneId) => void;
  setPaneViewState: (
    paneId: WorkspacePaneId,
    viewState: WorkspaceContentState,
    errorMessage?: string | null,
  ) => void;
  setSplitEnabled: (enabled: boolean) => void;
  toggleSplit: () => void;
  openSplitWithActiveTab: () => void;
  setSplitRatio: (ratio: number) => void;
  contentState: WorkspaceContentState;
  errorMessage: string | null;
  activeTabId: string | null;
  setContentState: (state: WorkspaceContentState, errorMessage?: string | null) => void;
  resetWorkspace: () => void;
}

const initialPanes: Record<WorkspacePaneId, WorkspacePaneState> = {
  primary: createPaneState('primary'),
  secondary: createPaneState('secondary'),
};

const initialWorkspaceState = {
  workspaceName: 'LaunchOS',
  sessionRoot: null as string | null,
  sessionsByRoot: {} as Record<string, WorkspaceSessionSnapshot>,
  tabs: [] as WorkspaceTab[],
  panes: initialPanes,
  focusedPaneId: 'primary' as WorkspacePaneId,
  splitEnabled: false,
  splitRatio: WORKSPACE_SPLIT_RATIO.default,
  closedTabs: [] as WorkspaceTab[],
};

function syncLegacyFields(state: {
  panes: Record<WorkspacePaneId, WorkspacePaneState>;
  focusedPaneId: WorkspacePaneId;
  tabs: WorkspaceTab[];
}) {
  const focused = state.panes[state.focusedPaneId];
  return {
    activeTabId: focused.activeTabId,
    contentState: focused.viewState,
    errorMessage: focused.errorMessage,
  };
}

function captureSession(state: {
  tabs: WorkspaceTab[];
  panes: Record<WorkspacePaneId, WorkspacePaneState>;
  focusedPaneId: WorkspacePaneId;
  splitEnabled: boolean;
  splitRatio: number;
}): WorkspaceSessionSnapshot {
  return {
    tabs: stripDirty(state.tabs),
    panes: state.panes,
    focusedPaneId: state.focusedPaneId,
    splitEnabled: state.splitEnabled,
    splitRatio: state.splitRatio,
  };
}

export const useWorkspaceStore = create<WorkspaceStoreState>()(
  persist(
    (set, get) => ({
      ...initialWorkspaceState,
      ...syncLegacyFields({
        panes: initialPanes,
        focusedPaneId: 'primary',
        tabs: [],
      }),
      setWorkspaceName: (name) => {
        set({ workspaceName: name });
      },
      bindSessionRoot: (rootPath) => {
        const state = get();
        if (state.sessionRoot === rootPath) {
          return;
        }

        let sessionsByRoot = { ...state.sessionsByRoot };
        if (state.sessionRoot) {
          sessionsByRoot = {
            ...sessionsByRoot,
            [state.sessionRoot]: captureSession(state),
          };
        }

        if (!rootPath) {
          set({
            sessionRoot: null,
            sessionsByRoot,
            tabs: [],
            panes: {
              primary: createPaneState('primary'),
              secondary: createPaneState('secondary'),
            },
            focusedPaneId: 'primary',
            splitEnabled: false,
            closedTabs: [],
            ...syncLegacyFields({
              panes: {
                primary: createPaneState('primary'),
                secondary: createPaneState('secondary'),
              },
              focusedPaneId: 'primary',
              tabs: [],
            }),
          });
          return;
        }

        const restored = sessionsByRoot[rootPath];
        const tabs = partitionPinnedTabs(stripDirty(restored?.tabs ?? []));
        const panes = restored?.panes ?? {
          primary: createPaneState('primary'),
          secondary: createPaneState('secondary'),
        };
        const focusedPaneId = restored?.focusedPaneId ?? 'primary';
        const splitEnabled = restored?.splitEnabled ?? false;
        const splitRatio = restored?.splitRatio ?? WORKSPACE_SPLIT_RATIO.default;

        set({
          sessionRoot: rootPath,
          sessionsByRoot,
          tabs,
          panes,
          focusedPaneId,
          splitEnabled,
          splitRatio,
          closedTabs: [],
          ...syncLegacyFields({ panes, focusedPaneId, tabs }),
        });
      },
      openTab: (tab, paneId) => {
        const targetPane = paneId ?? get().focusedPaneId;
        const existing = get().tabs.find((item) => {
          if (item.id === tab.id) {
            return true;
          }
          // Duplicates use unique ids for the same path — do not merge those.
          if (item.id.includes('::')) {
            return false;
          }
          if (tab.id.includes('::')) {
            return item.id === tab.id;
          }
          if (tab.path && (item.path === tab.path || item.id === tab.path)) {
            return true;
          }
          if (item.path && item.path === tab.id) {
            return true;
          }
          return false;
        });

        const merged: WorkspaceTab = existing
          ? {
              ...existing,
              ...tab,
              id: existing.id,
              title: tab.title || existing.title,
              ...(tab.path !== undefined
                ? { path: tab.path }
                : existing.path !== undefined
                  ? { path: existing.path }
                  : {}),
              ...(existing.pinned || tab.pinned ? { pinned: true as const } : {}),
            }
          : tab;

        const tabs: WorkspaceTab[] = partitionPinnedTabs(
          existing
            ? get().tabs.map((item) => (item.id === existing.id ? merged : item))
            : [...get().tabs, merged],
        );

        const panes = { ...get().panes };
        panes[targetPane] = withPaneView(panes[targetPane], merged.id, 'ready');

        set({
          tabs,
          panes,
          focusedPaneId: targetPane,
          ...syncLegacyFields({ panes, focusedPaneId: targetPane, tabs }),
        });
      },
      remapTabPath: (from, to, title) => {
        const tabs: WorkspaceTab[] = get().tabs.map((tab) => {
          if (tab.id !== from && tab.path !== from) {
            return tab;
          }
          const nextPath = tab.path === from || tab.id === from ? to : tab.path;
          return {
            ...tab,
            id: tab.id === from ? to : tab.id,
            title: title ?? tab.title,
            ...(nextPath !== undefined ? { path: nextPath } : {}),
          };
        });

        const panes = { ...get().panes };
        for (const id of Object.keys(panes) as WorkspacePaneId[]) {
          const pane = panes[id];
          if (pane.activeTabId === from) {
            panes[id] = { ...pane, activeTabId: to };
          }
        }

        set({
          tabs,
          panes,
          ...syncLegacyFields({ panes, focusedPaneId: get().focusedPaneId, tabs }),
        });
      },
      closeTab: (tabId, options) => {
        const original = get().tabs;
        const index = original.findIndex((tab) => tab.id === tabId);
        if (index < 0) {
          return;
        }
        const target = original[index];
        if (!target) {
          return;
        }
        if (isTabPinned(target) && !options?.force) {
          return;
        }
        const neighbor = original[index + 1]?.id ?? original[index - 1]?.id ?? null;
        const tabs = original.filter((tab) => tab.id !== tabId);
        const panes = { ...get().panes };

        for (const id of Object.keys(panes) as WorkspacePaneId[]) {
          const pane = panes[id];
          if (pane.activeTabId !== tabId) {
            continue;
          }
          const nextActive =
            (neighbor && tabs.some((tab) => tab.id === neighbor) ? neighbor : null) ??
            tabs[tabs.length - 1]?.id ??
            null;
          panes[id] = withPaneView(pane, nextActive);
        }

        const closedTabs = [...get().closedTabs, snapshotTab(target)].slice(-CLOSED_STACK_MAX);

        set({
          tabs,
          panes,
          closedTabs,
          splitEnabled: tabs.length === 0 ? false : get().splitEnabled,
          ...syncLegacyFields({
            panes,
            focusedPaneId: get().focusedPaneId,
            tabs,
          }),
        });
        clearViewStates([tabId]);
      },
      closeOtherTabs: (tabId) => {
        const current = get().tabs;
        const keep = current.filter((tab) => tab.id === tabId || isTabPinned(tab));
        if (!keep.some((tab) => tab.id === tabId)) {
          return;
        }
        const removed = current.filter((tab) => !keep.some((item) => item.id === tab.id));
        const tabs = partitionPinnedTabs(keep);
        const panes = { ...get().panes };
        panes.primary = withPaneView(panes.primary, tabId);
        panes.secondary = withPaneView(panes.secondary, get().splitEnabled ? tabId : null);
        const closedTabs = [...get().closedTabs, ...removed.map(snapshotTab)].slice(
          -CLOSED_STACK_MAX,
        );
        set({
          tabs,
          panes,
          closedTabs,
          focusedPaneId: 'primary',
          ...syncLegacyFields({ panes, focusedPaneId: 'primary', tabs }),
        });
        clearViewStates(removed.map((tab) => tab.id));
      },
      closeTabsToTheLeft: (tabId) => {
        const index = get().tabs.findIndex((tab) => tab.id === tabId);
        if (index < 0) {
          return;
        }
        const current = get().tabs;
        const left = current.slice(0, index);
        const right = current.slice(index);
        const keptLeft = left.filter(isTabPinned);
        const removed = left.filter((tab) => !isTabPinned(tab));
        const tabs = partitionPinnedTabs([...keptLeft, ...right]);
        const allowed = new Set(tabs.map((tab) => tab.id));
        const panes = { ...get().panes };
        for (const id of Object.keys(panes) as WorkspacePaneId[]) {
          const active = panes[id].activeTabId;
          if (active && !allowed.has(active)) {
            panes[id] = withPaneView(panes[id], tabId);
          }
        }
        const closedTabs = [...get().closedTabs, ...removed.map(snapshotTab)].slice(
          -CLOSED_STACK_MAX,
        );
        set({
          tabs,
          panes,
          closedTabs,
          ...syncLegacyFields({
            panes,
            focusedPaneId: get().focusedPaneId,
            tabs,
          }),
        });
        clearViewStates(removed.map((tab) => tab.id));
      },
      closeTabsToTheRight: (tabId) => {
        const index = get().tabs.findIndex((tab) => tab.id === tabId);
        if (index < 0) {
          return;
        }
        const current = get().tabs;
        const left = current.slice(0, index + 1);
        const right = current.slice(index + 1);
        const keptRight = right.filter(isTabPinned);
        const removed = right.filter((tab) => !isTabPinned(tab));
        const tabs = partitionPinnedTabs([...left, ...keptRight]);
        const allowed = new Set(tabs.map((tab) => tab.id));
        const panes = { ...get().panes };
        for (const id of Object.keys(panes) as WorkspacePaneId[]) {
          const active = panes[id].activeTabId;
          if (active && !allowed.has(active)) {
            panes[id] = withPaneView(panes[id], tabs[tabs.length - 1]?.id ?? null);
          }
        }
        const closedTabs = [...get().closedTabs, ...removed.map(snapshotTab)].slice(
          -CLOSED_STACK_MAX,
        );
        set({
          tabs,
          panes,
          closedTabs,
          ...syncLegacyFields({
            panes,
            focusedPaneId: get().focusedPaneId,
            tabs,
          }),
        });
        clearViewStates(removed.map((tab) => tab.id));
      },
      closeAllTabs: (options) => {
        const includePinned = options?.includePinned ?? true;
        if (includePinned) {
          const removed = get().tabs;
          const panes = {
            primary: createPaneState('primary'),
            secondary: createPaneState('secondary'),
          };
          const closedTabs = [...get().closedTabs, ...removed.map(snapshotTab)].slice(
            -CLOSED_STACK_MAX,
          );
          set({
            tabs: [],
            panes,
            closedTabs,
            splitEnabled: false,
            focusedPaneId: 'primary',
            ...syncLegacyFields({ panes, focusedPaneId: 'primary', tabs: [] }),
          });
          clearViewStates(removed.map((tab) => tab.id));
          return;
        }

        const current = get().tabs;
        const tabs = current.filter(isTabPinned);
        const removed = current.filter((tab) => !isTabPinned(tab));
        const nextActive = tabs[0]?.id ?? null;
        const panes = { ...get().panes };
        panes.primary = withPaneView(panes.primary, nextActive);
        panes.secondary = withPaneView(panes.secondary, get().splitEnabled ? nextActive : null);
        const closedTabs = [...get().closedTabs, ...removed.map(snapshotTab)].slice(
          -CLOSED_STACK_MAX,
        );
        set({
          tabs,
          panes,
          closedTabs,
          splitEnabled: tabs.length === 0 ? false : get().splitEnabled,
          focusedPaneId: 'primary',
          ...syncLegacyFields({ panes, focusedPaneId: 'primary', tabs }),
        });
        clearViewStates(removed.map((tab) => tab.id));
      },
      reorderTabs: (fromIndex, toIndex) => {
        const current = [...get().tabs];
        if (
          fromIndex < 0 ||
          toIndex < 0 ||
          fromIndex >= current.length ||
          toIndex >= current.length ||
          fromIndex === toIndex
        ) {
          return;
        }
        const [moved] = current.splice(fromIndex, 1);
        if (!moved) {
          return;
        }
        const insertAt = clampReorderIndex(current, moved, toIndex);
        current.splice(insertAt, 0, moved);
        set({ tabs: partitionPinnedTabs(current) });
      },
      pinTab: (tabId) => {
        const current = get().tabs;
        const target = current.find((tab) => tab.id === tabId);
        if (!target || isTabPinned(target)) {
          return;
        }
        set({
          tabs: partitionPinnedTabs(
            current.map((tab) => (tab.id === tabId ? withPinned(tab, true) : tab)),
          ),
        });
      },
      unpinTab: (tabId) => {
        const current = get().tabs;
        const target = current.find((tab) => tab.id === tabId);
        if (!target || !isTabPinned(target)) {
          return;
        }
        set({
          tabs: partitionPinnedTabs(
            current.map((tab) => (tab.id === tabId ? withPinned(tab, false) : tab)),
          ),
        });
      },
      togglePinTab: (tabId) => {
        const target = get().tabs.find((tab) => tab.id === tabId);
        if (!target) {
          return;
        }
        if (isTabPinned(target)) {
          get().unpinTab(tabId);
        } else {
          get().pinTab(tabId);
        }
      },
      duplicateTab: (tabId) => {
        const source = get().tabs.find((tab) => tab.id === tabId);
        if (!source) {
          return;
        }
        const baseId = source.path ?? source.id.split('::')[0] ?? source.id;
        const suffix = Math.random().toString(36).slice(2, 8);
        const dup: WorkspaceTab = {
          id: `${baseId}::${suffix}`,
          title: source.title,
          closable: true,
          ...(source.kind !== undefined ? { kind: source.kind } : { kind: 'file' as const }),
          ...(source.path !== undefined ? { path: source.path } : {}),
        };
        const index = get().tabs.findIndex((tab) => tab.id === tabId);
        const next = [...get().tabs];
        next.splice(index + 1, 0, dup);
        const tabs = partitionPinnedTabs(next);
        const targetPane = get().focusedPaneId;
        const panes = { ...get().panes };
        panes[targetPane] = withPaneView(panes[targetPane], dup.id, 'ready');
        set({
          tabs,
          panes,
          focusedPaneId: targetPane,
          ...syncLegacyFields({ panes, focusedPaneId: targetPane, tabs }),
        });
      },
      pushClosedTab: (tab) => {
        set({
          closedTabs: [...get().closedTabs, snapshotTab(tab)].slice(-CLOSED_STACK_MAX),
        });
      },
      reopenClosedTab: () => {
        const stack = get().closedTabs;
        if (stack.length === 0) {
          return;
        }
        const tab = stack[stack.length - 1];
        if (!tab) {
          return;
        }
        set({ closedTabs: stack.slice(0, -1) });
        const existing = get().tabs.find((item) => {
          if (item.id === tab.id) {
            return true;
          }
          if (tab.path && item.path === tab.path && !item.id.includes('::')) {
            return true;
          }
          return false;
        });
        if (existing) {
          get().setActiveTab(existing.id);
          return;
        }
        get().openTab(tab);
      },
      cycleTab: (direction) => {
        const tabs = get().tabs;
        if (tabs.length === 0) {
          return;
        }
        const activeId = get().activeTabId;
        const index = Math.max(
          0,
          tabs.findIndex((tab) => tab.id === activeId),
        );
        const nextIndex = (index + direction + tabs.length) % tabs.length;
        const next = tabs[nextIndex];
        if (next) {
          get().setActiveTab(next.id);
        }
      },
      setActiveTab: (tabId, paneId) => {
        const targetPane = paneId ?? get().focusedPaneId;
        if (!get().tabs.some((tab) => tab.id === tabId)) {
          return;
        }
        const panes = { ...get().panes };
        panes[targetPane] = withPaneView(panes[targetPane], tabId, 'ready');
        set({
          panes,
          focusedPaneId: targetPane,
          ...syncLegacyFields({
            panes,
            focusedPaneId: targetPane,
            tabs: get().tabs,
          }),
        });
      },
      setTabDirty: (tabId, dirty) => {
        set({
          tabs: get().tabs.map((tab) => (tab.id === tabId ? { ...tab, dirty } : tab)),
        });
      },
      focusPane: (paneId) => {
        if (!get().splitEnabled && paneId === 'secondary') {
          return;
        }
        set({
          focusedPaneId: paneId,
          ...syncLegacyFields({
            panes: get().panes,
            focusedPaneId: paneId,
            tabs: get().tabs,
          }),
        });
      },
      setPaneViewState: (paneId, viewState, errorMessage = null) => {
        const panes = { ...get().panes };
        panes[paneId] = {
          ...panes[paneId],
          viewState,
          errorMessage: viewState === 'error' ? errorMessage : null,
        };
        set({
          panes,
          ...syncLegacyFields({
            panes,
            focusedPaneId: get().focusedPaneId,
            tabs: get().tabs,
          }),
        });
      },
      setSplitEnabled: (enabled) => {
        const panes = { ...get().panes };
        if (enabled) {
          const seed = panes.primary.activeTabId ?? get().tabs[0]?.id ?? null;
          panes.secondary = withPaneView(panes.secondary, panes.secondary.activeTabId ?? seed);
        } else {
          panes.secondary = createPaneState('secondary');
        }
        const focusedPaneId = enabled ? get().focusedPaneId : 'primary';
        set({
          splitEnabled: enabled,
          panes,
          focusedPaneId,
          ...syncLegacyFields({ panes, focusedPaneId, tabs: get().tabs }),
        });
      },
      toggleSplit: () => {
        get().setSplitEnabled(!get().splitEnabled);
      },
      openSplitWithActiveTab: () => {
        const active = get().panes[get().focusedPaneId].activeTabId;
        get().setSplitEnabled(true);
        if (active) {
          get().setActiveTab(active, 'secondary');
        }
      },
      setSplitRatio: (ratio) => {
        set({ splitRatio: clampRatio(ratio) });
      },
      setContentState: (contentState, errorMessage = null) => {
        get().setPaneViewState(get().focusedPaneId, contentState, errorMessage);
      },
      resetWorkspace: () => {
        set({
          ...initialWorkspaceState,
          panes: {
            primary: createPaneState('primary'),
            secondary: createPaneState('secondary'),
          },
          ...syncLegacyFields({
            panes: {
              primary: createPaneState('primary'),
              secondary: createPaneState('secondary'),
            },
            focusedPaneId: 'primary',
            tabs: [],
          }),
        });
      },
    }),
    {
      name: WORKSPACE_STORAGE_KEY,
      partialize: (state) => {
        const sessionsByRoot = { ...state.sessionsByRoot };
        if (state.sessionRoot) {
          sessionsByRoot[state.sessionRoot] = captureSession(state);
        }
        return {
          workspaceName: state.workspaceName,
          sessionRoot: state.sessionRoot,
          sessionsByRoot,
          tabs: stripDirty(state.tabs),
          panes: state.panes,
          focusedPaneId: state.focusedPaneId,
          splitEnabled: state.splitEnabled,
          splitRatio: state.splitRatio,
        };
      },
      merge: (persisted, current) => {
        const raw = (persisted ?? {}) as Partial<WorkspaceStoreState>;
        const panes = raw.panes ?? current.panes;
        const focusedPaneId = raw.focusedPaneId ?? current.focusedPaneId;
        const tabs = partitionPinnedTabs(stripDirty(raw.tabs ?? current.tabs));
        return {
          ...current,
          ...raw,
          panes,
          focusedPaneId,
          tabs,
          closedTabs: [],
          sessionsByRoot: raw.sessionsByRoot ?? {},
          sessionRoot: raw.sessionRoot ?? null,
          ...syncLegacyFields({ panes, focusedPaneId, tabs }),
        };
      },
    },
  ),
);
