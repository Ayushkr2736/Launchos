import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { LayoutBreakpoint } from '@/layout/types';
import type { AiPanelTabId, BottomPanelTabId, LeftPanelTabId } from '@/types/shell';

import { SIDEBAR_EXPANDED_MIN } from '@/features/sidebar/constants';
import {
  AI_PANEL_SIZE,
  BOTTOM_PANEL_SIZE,
  EXPLORER_SIZE,
  LAYOUT_STORAGE_KEY,
  SIDEBAR_EXPANDED_WIDTH,
  SIDEBAR_SIZE,
} from '@/layout/constants';

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * When the primary sidebar gains width, shrink Explorer/Search (and AI a bit)
 * so the workbench still fits. Reverse when the sidebar gives width back.
 */
function redistributeForSidebarDelta(
  explorerVisible: boolean,
  explorerWidth: number,
  aiPanelVisible: boolean,
  aiPanelWidth: number,
  sidebarDelta: number,
): { explorerWidth: number; aiPanelWidth: number } {
  if (sidebarDelta === 0) {
    return { explorerWidth, aiPanelWidth };
  }

  let nextExplorer = explorerWidth;
  let nextAi = aiPanelWidth;

  if (sidebarDelta > 0) {
    // Sidebar grew — take most of the space from explorer/search, rest from AI.
    let remaining = sidebarDelta;
    if (explorerVisible) {
      const take = Math.min(
        remaining,
        Math.round(sidebarDelta * 0.7),
        Math.max(0, nextExplorer - EXPLORER_SIZE.min),
      );
      nextExplorer -= take;
      remaining -= take;
    }
    if (aiPanelVisible && remaining > 0) {
      const take = Math.min(remaining, Math.max(0, nextAi - AI_PANEL_SIZE.min));
      nextAi -= take;
    }
  } else {
    // Sidebar shrank — give space back, prefer restoring explorer toward default.
    let remaining = -sidebarDelta;
    if (explorerVisible) {
      const room = Math.max(0, EXPLORER_SIZE.default - nextExplorer);
      const give = Math.min(remaining, Math.round(-sidebarDelta * 0.7), room);
      nextExplorer += give;
      remaining -= give;
    }
    if (aiPanelVisible && remaining > 0) {
      const room = Math.max(0, AI_PANEL_SIZE.default - nextAi);
      nextAi += Math.min(remaining, room);
    }
  }

  return {
    explorerWidth: clamp(nextExplorer, EXPLORER_SIZE.min, EXPLORER_SIZE.max),
    aiPanelWidth: clamp(nextAi, AI_PANEL_SIZE.min, AI_PANEL_SIZE.max),
  };
}

export interface LayoutStoreState {
  breakpoint: LayoutBreakpoint;
  sidebarCollapsed: boolean;
  sidebarWidth: number;
  explorerVisible: boolean;
  explorerWidth: number;
  /** Explorer visibility before the last sidebar expand (for restore on collapse). */
  explorerVisibleBeforeSidebarExpand: boolean;
  aiPanelVisible: boolean;
  aiPanelWidth: number;
  bottomPanelCollapsed: boolean;
  bottomPanelHeight: number;
  bottomPanelTab: BottomPanelTabId;
  aiPanelTab: AiPanelTabId;
  leftPanelTab: LeftPanelTabId;
  commandPaletteOpen: boolean;
  setBreakpoint: (breakpoint: LayoutBreakpoint) => void;
  setSidebarCollapsed: (value: boolean) => void;
  toggleSidebarCollapsed: () => void;
  expandSidebar: () => void;
  collapseSidebar: () => void;
  setSidebarWidth: (width: number) => void;
  setExplorerVisible: (value: boolean) => void;
  toggleExplorerVisible: () => void;
  expandExplorer: () => void;
  collapseExplorer: () => void;
  setExplorerWidth: (width: number) => void;
  setAiPanelVisible: (value: boolean) => void;
  toggleAiPanelVisible: () => void;
  expandAiPanel: () => void;
  collapseAiPanel: () => void;
  setAiPanelWidth: (width: number) => void;
  setBottomPanelCollapsed: (value: boolean) => void;
  toggleBottomPanelCollapsed: () => void;
  expandBottomPanel: () => void;
  collapseBottomPanel: () => void;
  setBottomPanelHeight: (height: number) => void;
  setBottomPanelTab: (tab: BottomPanelTabId) => void;
  setAiPanelTab: (tab: AiPanelTabId) => void;
  setLeftPanelTab: (tab: LeftPanelTabId) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
  resetLayout: () => void;
}

const initialLayoutState = {
  breakpoint: 'desktop' as LayoutBreakpoint,
  sidebarCollapsed: true,
  sidebarWidth: SIDEBAR_SIZE.default,
  explorerVisible: true,
  explorerWidth: EXPLORER_SIZE.default,
  /** Remember explorer visibility across sidebar expand/collapse. */
  explorerVisibleBeforeSidebarExpand: true as boolean,
  aiPanelVisible: true,
  aiPanelWidth: AI_PANEL_SIZE.default,
  bottomPanelCollapsed: false,
  bottomPanelHeight: BOTTOM_PANEL_SIZE.default,
  bottomPanelTab: 'terminal' as BottomPanelTabId,
  aiPanelTab: 'chat' as AiPanelTabId,
  leftPanelTab: 'explorer' as LeftPanelTabId,
  commandPaletteOpen: false,
};

export const useLayoutStore = create<LayoutStoreState>()(
  persist(
    (set, get) => ({
      ...initialLayoutState,
      setBreakpoint: (breakpoint) => {
        set({ breakpoint });
      },
      setSidebarCollapsed: (value) => {
        const state = get();

        // Expanding LaunchOS sidebar: always open to full width and hide Explorer
        // so nav labels/content are fully visible (not cramped beside Explorer).
        if (!value) {
          const nextWidth = SIDEBAR_EXPANDED_WIDTH;
          const delta = nextWidth - state.sidebarWidth;
          const redistributed = redistributeForSidebarDelta(
            false,
            state.explorerWidth,
            state.aiPanelVisible,
            state.aiPanelWidth,
            delta,
          );
          set({
            sidebarCollapsed: false,
            sidebarWidth: nextWidth,
            explorerVisibleBeforeSidebarExpand: state.sidebarCollapsed
              ? state.explorerVisible
              : state.explorerVisibleBeforeSidebarExpand,
            explorerVisible: false,
            explorerWidth: redistributed.explorerWidth,
            aiPanelWidth: redistributed.aiPanelWidth,
          });
          return;
        }

        // Collapsing sidebar: restore Explorer if it was open before expand.
        const nextWidth = SIDEBAR_SIZE.collapsed;
        const delta = nextWidth - state.sidebarWidth;
        const restoreExplorer = state.explorerVisibleBeforeSidebarExpand;
        const redistributed = redistributeForSidebarDelta(
          restoreExplorer,
          state.explorerWidth,
          state.aiPanelVisible,
          state.aiPanelWidth,
          delta,
        );
        set({
          sidebarCollapsed: true,
          sidebarWidth: nextWidth,
          explorerVisible: restoreExplorer,
          explorerWidth: redistributed.explorerWidth,
          aiPanelWidth: redistributed.aiPanelWidth,
        });
      },
      toggleSidebarCollapsed: () => {
        get().setSidebarCollapsed(!get().sidebarCollapsed);
      },
      expandSidebar: () => {
        get().setSidebarCollapsed(false);
      },
      collapseSidebar: () => {
        get().setSidebarCollapsed(true);
      },
      setSidebarWidth: (width) => {
        const state = get();
        const next = clamp(width, SIDEBAR_SIZE.min, SIDEBAR_SIZE.max);
        const delta = next - state.sidebarWidth;
        const redistributed = redistributeForSidebarDelta(
          state.explorerVisible,
          state.explorerWidth,
          state.aiPanelVisible,
          state.aiPanelWidth,
          delta,
        );
        set({
          sidebarWidth: next,
          sidebarCollapsed: next <= SIDEBAR_SIZE.collapsed + 8,
          explorerWidth: redistributed.explorerWidth,
          aiPanelWidth: redistributed.aiPanelWidth,
        });
      },
      setExplorerVisible: (value) => {
        set({ explorerVisible: value });
      },
      toggleExplorerVisible: () => {
        set({ explorerVisible: !get().explorerVisible });
      },
      expandExplorer: () => {
        set({ explorerVisible: true });
      },
      collapseExplorer: () => {
        set({ explorerVisible: false });
      },
      setExplorerWidth: (width) => {
        set({ explorerWidth: clamp(width, EXPLORER_SIZE.min, EXPLORER_SIZE.max) });
      },
      setAiPanelVisible: (value) => {
        set({ aiPanelVisible: value });
      },
      toggleAiPanelVisible: () => {
        set({ aiPanelVisible: !get().aiPanelVisible });
      },
      expandAiPanel: () => {
        set({ aiPanelVisible: true });
      },
      collapseAiPanel: () => {
        set({ aiPanelVisible: false });
      },
      setAiPanelWidth: (width) => {
        set({ aiPanelWidth: clamp(width, AI_PANEL_SIZE.min, AI_PANEL_SIZE.max) });
      },
      setBottomPanelCollapsed: (value) => {
        set({ bottomPanelCollapsed: value });
      },
      toggleBottomPanelCollapsed: () => {
        set({ bottomPanelCollapsed: !get().bottomPanelCollapsed });
      },
      expandBottomPanel: () => {
        set({ bottomPanelCollapsed: false });
      },
      collapseBottomPanel: () => {
        set({ bottomPanelCollapsed: true });
      },
      setBottomPanelHeight: (height) => {
        set({ bottomPanelHeight: clamp(height, BOTTOM_PANEL_SIZE.min, BOTTOM_PANEL_SIZE.max) });
      },
      setBottomPanelTab: (tab) => {
        set({ bottomPanelTab: tab, bottomPanelCollapsed: false });
      },
      setAiPanelTab: (tab) => {
        set({ aiPanelTab: tab, aiPanelVisible: true });
      },
      setLeftPanelTab: (tab) => {
        set({ leftPanelTab: tab, explorerVisible: true });
      },
      setCommandPaletteOpen: (open) => {
        set({ commandPaletteOpen: open });
      },
      toggleCommandPalette: () => {
        set({ commandPaletteOpen: !get().commandPaletteOpen });
      },
      resetLayout: () => {
        set({ ...initialLayoutState, breakpoint: get().breakpoint });
      },
    }),
    {
      name: LAYOUT_STORAGE_KEY,
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        sidebarWidth: state.sidebarWidth,
        explorerVisible: state.explorerVisible,
        explorerWidth: state.explorerWidth,
        aiPanelVisible: state.aiPanelVisible,
        aiPanelWidth: state.aiPanelWidth,
        bottomPanelCollapsed: state.bottomPanelCollapsed,
        bottomPanelHeight: state.bottomPanelHeight,
        bottomPanelTab: state.bottomPanelTab,
        aiPanelTab: state.aiPanelTab,
        leftPanelTab: state.leftPanelTab,
        explorerVisibleBeforeSidebarExpand: state.explorerVisibleBeforeSidebarExpand,
      }),
      merge: (persisted, current) => {
        const stored = (persisted ?? {}) as Partial<typeof initialLayoutState>;
        const sidebarCollapsed = stored.sidebarCollapsed ?? current.sidebarCollapsed;
        let sidebarWidth = stored.sidebarWidth ?? current.sidebarWidth;

        // Repair desynced persist: expanded flag with collapsed width (clips labels).
        if (!sidebarCollapsed && sidebarWidth < SIDEBAR_EXPANDED_MIN) {
          sidebarWidth = SIDEBAR_EXPANDED_WIDTH;
        }
        if (sidebarCollapsed) {
          sidebarWidth = SIDEBAR_SIZE.collapsed;
        }

        return {
          ...current,
          ...stored,
          sidebarCollapsed,
          sidebarWidth,
        };
      },
    },
  ),
);
