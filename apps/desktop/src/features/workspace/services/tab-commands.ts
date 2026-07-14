import { confirm } from '@tauri-apps/plugin-dialog';

import type { WorkspaceTab } from '@/types/shell';

import { isTabPinned } from '@/features/workspace/utils/tab-order';
import { useWorkspaceStore } from '@/stores/workspace-store';

const CLOSED_STACK_MAX = 20;

export async function confirmDiscardUnsaved(tabs: readonly WorkspaceTab[]): Promise<boolean> {
  const dirty = tabs.filter((tab) => tab.dirty);
  if (dirty.length === 0) {
    return true;
  }
  const label =
    dirty.length === 1 ? `'${dirty[0]?.title ?? 'Untitled'}'` : `${dirty.length} editors`;
  const message = `You have unsaved changes in ${label}. Close anyway?`;
  try {
    return await confirm(message, {
      title: 'Unsaved Changes',
      kind: 'warning',
    });
  } catch {
    return window.confirm(message);
  }
}

function collectCloseable(
  predicate: (tab: WorkspaceTab, index: number) => boolean,
): WorkspaceTab[] {
  return useWorkspaceStore.getState().tabs.filter((tab, index) => {
    if (isTabPinned(tab) || !tab.closable) {
      return false;
    }
    return predicate(tab, index);
  });
}

/** Production tab command API — context menu, shortcuts, and palette share this. */
export const tabCommands = {
  activate(tabId: string): void {
    useWorkspaceStore.getState().setActiveTab(tabId);
  },

  async close(tabId: string, options?: { force?: boolean }): Promise<boolean> {
    const store = useWorkspaceStore.getState();
    const tab = store.tabs.find((item) => item.id === tabId);
    if (!tab) {
      return false;
    }
    if (isTabPinned(tab) && !options?.force) {
      return false;
    }
    if (tab.dirty) {
      const ok = await confirmDiscardUnsaved([tab]);
      if (!ok) {
        return false;
      }
    }
    store.closeTab(tabId, { force: true });
    return true;
  },

  async closeOthers(tabId: string): Promise<boolean> {
    const targets = collectCloseable((tab) => tab.id !== tabId);
    if (!(await confirmDiscardUnsaved(targets))) {
      return false;
    }
    useWorkspaceStore.getState().closeOtherTabs(tabId);
    return true;
  },

  async closeLeft(tabId: string): Promise<boolean> {
    const index = useWorkspaceStore.getState().tabs.findIndex((tab) => tab.id === tabId);
    if (index < 0) {
      return false;
    }
    const targets = collectCloseable((_tab, i) => i < index);
    if (!(await confirmDiscardUnsaved(targets))) {
      return false;
    }
    useWorkspaceStore.getState().closeTabsToTheLeft(tabId);
    return true;
  },

  async closeRight(tabId: string): Promise<boolean> {
    const index = useWorkspaceStore.getState().tabs.findIndex((tab) => tab.id === tabId);
    if (index < 0) {
      return false;
    }
    const targets = collectCloseable((_tab, i) => i > index);
    if (!(await confirmDiscardUnsaved(targets))) {
      return false;
    }
    useWorkspaceStore.getState().closeTabsToTheRight(tabId);
    return true;
  },

  async closeAll(): Promise<boolean> {
    const targets = collectCloseable(() => true);
    if (!(await confirmDiscardUnsaved(targets))) {
      return false;
    }
    useWorkspaceStore.getState().closeAllTabs({ includePinned: true });
    return true;
  },

  pin(tabId: string): void {
    useWorkspaceStore.getState().togglePinTab(tabId);
  },

  duplicate(tabId: string): void {
    useWorkspaceStore.getState().duplicateTab(tabId);
  },

  splitRight(tabId: string): void {
    const store = useWorkspaceStore.getState();
    store.setActiveTab(tabId);
    store.openSplitWithActiveTab();
  },

  reopenClosed(): void {
    useWorkspaceStore.getState().reopenClosedTab();
  },

  openUntitled(): void {
    const id = `untitled-${Date.now()}`;
    useWorkspaceStore.getState().openTab({
      id,
      title: 'Untitled',
      closable: true,
      kind: 'untitled',
    });
  },

  switchToIndex(index: number): void {
    const tab = useWorkspaceStore.getState().tabs[index];
    if (tab) {
      useWorkspaceStore.getState().setActiveTab(tab.id);
    }
  },

  pushClosedSnapshot(tab: WorkspaceTab): void {
    useWorkspaceStore.getState().pushClosedTab(tab);
  },
};

export { CLOSED_STACK_MAX };
