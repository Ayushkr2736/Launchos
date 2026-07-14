import type { WorkspaceTab } from '@/types/shell';

export function isTabPinned(tab: WorkspaceTab): boolean {
  return tab.pinned === true;
}

/** Keep pinned tabs on the left while preserving relative order within each group. */
export function partitionPinnedTabs(tabs: readonly WorkspaceTab[]): WorkspaceTab[] {
  const pinned: WorkspaceTab[] = [];
  const unpinned: WorkspaceTab[] = [];
  for (const tab of tabs) {
    if (isTabPinned(tab)) {
      pinned.push(tab);
    } else {
      unpinned.push(tab);
    }
  }
  return [...pinned, ...unpinned];
}

/**
 * Clamp a reorder target so pinned tabs stay in the pinned region
 * and unpinned tabs stay after them.
 */
export function clampReorderIndex(
  tabsWithoutMoved: readonly WorkspaceTab[],
  moved: WorkspaceTab,
  requestedIndex: number,
): number {
  const pinnedCount = tabsWithoutMoved.filter(isTabPinned).length;
  if (isTabPinned(moved)) {
    return Math.max(0, Math.min(requestedIndex, pinnedCount));
  }
  return Math.max(pinnedCount, Math.min(requestedIndex, tabsWithoutMoved.length));
}

export function withPinned(tab: WorkspaceTab, pinned: boolean): WorkspaceTab {
  if (pinned) {
    return { ...tab, pinned: true };
  }
  const { pinned: _removed, ...rest } = tab;
  return rest;
}
