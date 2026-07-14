import type {
  LayoutPanelId,
  LayoutPanelListener,
  LayoutPanelSnapshot,
  LayoutSnapshot,
} from '@/layout/types';

import { useLayoutStore } from '@/stores/layout-store';

function panelSnapshot(
  id: LayoutPanelId,
  collapsed: boolean,
  size: number,
  visible: boolean,
): LayoutPanelSnapshot {
  return { id, collapsed, size, visible };
}

function readSnapshot(): LayoutSnapshot {
  const state = useLayoutStore.getState();
  return {
    breakpoint: state.breakpoint,
    sidebar: panelSnapshot('sidebar', state.sidebarCollapsed, state.sidebarWidth, true),
    explorer: panelSnapshot(
      'explorer',
      !state.explorerVisible,
      state.explorerWidth,
      state.explorerVisible,
    ),
    workspace: panelSnapshot('workspace', false, 0, true),
    ai: panelSnapshot('ai', !state.aiPanelVisible, state.aiPanelWidth, state.aiPanelVisible),
    bottom: panelSnapshot(
      'bottom',
      state.bottomPanelCollapsed,
      state.bottomPanelHeight,
      !state.bottomPanelCollapsed,
    ),
  };
}

export interface LayoutPanelApi {
  collapse: (id: LayoutPanelId) => void;
  expand: (id: LayoutPanelId) => void;
  toggle: (id: LayoutPanelId) => void;
  setSize: (id: LayoutPanelId, sizePx: number) => void;
  isCollapsed: (id: LayoutPanelId) => boolean;
  isVisible: (id: LayoutPanelId) => boolean;
  getSize: (id: LayoutPanelId) => number;
  getSnapshot: () => LayoutSnapshot;
  reset: () => void;
  subscribe: (listener: LayoutPanelListener) => () => void;
}

function assertPanel(id: LayoutPanelId): void {
  if (id === 'workspace') {
    throw new Error('Workspace panel cannot be collapsed via LayoutPanelApi');
  }
}

export const layoutPanelApi: LayoutPanelApi = {
  collapse(id) {
    assertPanel(id);
    const store = useLayoutStore.getState();
    switch (id) {
      case 'sidebar':
        store.collapseSidebar();
        break;
      case 'explorer':
        store.collapseExplorer();
        break;
      case 'ai':
        store.collapseAiPanel();
        break;
      case 'bottom':
        store.collapseBottomPanel();
        break;
      default:
        break;
    }
  },
  expand(id) {
    assertPanel(id);
    const store = useLayoutStore.getState();
    switch (id) {
      case 'sidebar':
        store.expandSidebar();
        break;
      case 'explorer':
        store.expandExplorer();
        break;
      case 'ai':
        store.expandAiPanel();
        break;
      case 'bottom':
        store.expandBottomPanel();
        break;
      default:
        break;
    }
  },
  toggle(id) {
    assertPanel(id);
    const store = useLayoutStore.getState();
    switch (id) {
      case 'sidebar':
        store.toggleSidebarCollapsed();
        break;
      case 'explorer':
        store.toggleExplorerVisible();
        break;
      case 'ai':
        store.toggleAiPanelVisible();
        break;
      case 'bottom':
        store.toggleBottomPanelCollapsed();
        break;
      default:
        break;
    }
  },
  setSize(id, sizePx) {
    const store = useLayoutStore.getState();
    switch (id) {
      case 'sidebar':
        store.setSidebarWidth(sizePx);
        break;
      case 'explorer':
        store.setExplorerWidth(sizePx);
        break;
      case 'ai':
        store.setAiPanelWidth(sizePx);
        break;
      case 'bottom':
        store.setBottomPanelHeight(sizePx);
        break;
      case 'workspace':
        break;
      default:
        break;
    }
  },
  isCollapsed(id) {
    return readSnapshot()[id].collapsed;
  },
  isVisible(id) {
    return readSnapshot()[id].visible;
  },
  getSize(id) {
    return readSnapshot()[id].size;
  },
  getSnapshot() {
    return readSnapshot();
  },
  reset() {
    useLayoutStore.getState().resetLayout();
  },
  subscribe(listener) {
    return useLayoutStore.subscribe(() => {
      listener(readSnapshot());
    });
  },
};
