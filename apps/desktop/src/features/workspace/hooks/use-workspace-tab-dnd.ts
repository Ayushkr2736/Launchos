import { useCallback, useRef } from 'react';

import type { WorkspacePaneId } from '@/types/shell';
import type { DragEvent } from 'react';

import { WORKSPACE_TAB_DND_MIME } from '@/features/workspace/constants';
import { useWorkspaceStore } from '@/stores/workspace-store';

export type TabDropEdge = 'before' | 'after';

export function useWorkspaceTabDnD() {
  const reorderTabs = useWorkspaceStore((state) => state.reorderTabs);
  const setActiveTab = useWorkspaceStore((state) => state.setActiveTab);
  const focusPane = useWorkspaceStore((state) => state.focusPane);
  const tabs = useWorkspaceStore((state) => state.tabs);
  const dragIndexRef = useRef<number | null>(null);

  const onTabDragStart = useCallback(
    (event: DragEvent<HTMLElement>, tabId: string) => {
      const index = tabs.findIndex((tab) => tab.id === tabId);
      dragIndexRef.current = index;
      event.dataTransfer.setData(WORKSPACE_TAB_DND_MIME, tabId);
      event.dataTransfer.effectAllowed = 'move';
    },
    [tabs],
  );

  const onTabDragOver = useCallback(
    (event: DragEvent<HTMLElement>, _tabId: string): TabDropEdge => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      const bounds = event.currentTarget.getBoundingClientRect();
      const mid = bounds.left + bounds.width / 2;
      return event.clientX < mid ? 'before' : 'after';
    },
    [],
  );

  const onTabDragLeave = useCallback(() => {
    // Visual state is owned by the tab item.
  }, []);

  const onTabDrop = useCallback(
    (event: DragEvent<HTMLElement>, targetTabId: string) => {
      event.preventDefault();
      const fromId = event.dataTransfer.getData(WORKSPACE_TAB_DND_MIME);
      if (!fromId || fromId === targetTabId) {
        return;
      }
      const fromIndex = tabs.findIndex((tab) => tab.id === fromId);
      let toIndex = tabs.findIndex((tab) => tab.id === targetTabId);
      if (fromIndex < 0 || toIndex < 0) {
        return;
      }
      const bounds = event.currentTarget.getBoundingClientRect();
      const mid = bounds.left + bounds.width / 2;
      if (event.clientX >= mid && fromIndex < toIndex) {
        // already moving right onto this slot
      } else if (event.clientX >= mid && fromIndex > toIndex) {
        toIndex += 1;
      } else if (event.clientX < mid && fromIndex < toIndex) {
        toIndex -= 1;
      }
      toIndex = Math.max(0, Math.min(toIndex, tabs.length - 1));
      reorderTabs(fromIndex, toIndex);
      dragIndexRef.current = null;
    },
    [reorderTabs, tabs],
  );

  const onPaneDragOver = useCallback((event: DragEvent<HTMLElement>) => {
    if ([...event.dataTransfer.types].includes(WORKSPACE_TAB_DND_MIME)) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    }
  }, []);

  const onPaneDrop = useCallback(
    (event: DragEvent<HTMLElement>, paneId: WorkspacePaneId) => {
      event.preventDefault();
      const tabId = event.dataTransfer.getData(WORKSPACE_TAB_DND_MIME);
      if (!tabId) {
        return;
      }
      focusPane(paneId);
      setActiveTab(tabId, paneId);
    },
    [focusPane, setActiveTab],
  );

  return {
    onTabDragStart,
    onTabDragOver,
    onTabDragLeave,
    onTabDrop,
    onPaneDragOver,
    onPaneDrop,
  };
}
