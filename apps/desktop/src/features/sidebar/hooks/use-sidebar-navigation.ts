import { useCallback, useMemo, type KeyboardEvent, type RefObject } from 'react';

import type { SidebarFocusTarget, SidebarNavItem, SidebarSectionId } from '@/types/shell';

import { SIDEBAR_NAV_ITEMS } from '@/features/sidebar/constants';
import { useWorkspaceCatalog } from '@/modules/workspace-manager';
import { useSidebarStore } from '@/stores/sidebar-store';

function matchesQuery(label: string, query: string): boolean {
  if (!query.trim()) {
    return true;
  }
  return label.toLowerCase().includes(query.trim().toLowerCase());
}

export function filterNavItems(items: readonly SidebarNavItem[], query: string): SidebarNavItem[] {
  if (!query.trim()) {
    return [...items];
  }

  return items
    .map((item) => {
      const childMatches = (item.children ?? []).filter((child) =>
        matchesQuery(child.label, query),
      );
      const selfMatch = matchesQuery(item.label, query);
      if (!selfMatch && childMatches.length === 0) {
        return null;
      }
      if (childMatches.length > 0) {
        return { ...item, children: childMatches };
      }
      return item;
    })
    .filter((item): item is SidebarNavItem => item !== null);
}

function focusKey(target: SidebarFocusTarget): string {
  if (target.kind === 'section') {
    return `section:${target.id}`;
  }
  if (target.kind === 'child') {
    return `child:${target.id}`;
  }
  return `recent:${target.id}`;
}

export function useSidebarNavigation(searchInputRef?: RefObject<HTMLInputElement | null>) {
  const activeSection = useSidebarStore((state) => state.activeSection);
  const activeChildId = useSidebarStore((state) => state.activeChildId);
  const pinnedItems = useSidebarStore((state) => state.pinnedItems);
  const expandedSections = useSidebarStore((state) => state.expandedSections);
  const searchQuery = useSidebarStore((state) => state.searchQuery);
  const { recents: recentWorkspaces, pinned: pinnedWorkspaces } = useWorkspaceCatalog();
  const focusTarget = useSidebarStore((state) => state.focusTarget);
  const setActiveSection = useSidebarStore((state) => state.setActiveSection);
  const setFocusTarget = useSidebarStore((state) => state.setFocusTarget);
  const expandSection = useSidebarStore((state) => state.expandSection);
  const collapseSection = useSidebarStore((state) => state.collapseSection);
  const toggleSectionExpanded = useSidebarStore((state) => state.toggleSectionExpanded);
  const clearSearch = useSidebarStore((state) => state.clearSearch);

  const filteredItems = useMemo(
    () => filterNavItems(SIDEBAR_NAV_ITEMS, searchQuery),
    [searchQuery],
  );

  const pinned = useMemo(
    () => filteredItems.filter((item) => pinnedItems.includes(item.id)),
    [filteredItems, pinnedItems],
  );

  const unpinned = useMemo(
    () => filteredItems.filter((item) => !pinnedItems.includes(item.id)),
    [filteredItems, pinnedItems],
  );

  const orderedItems = useMemo(() => [...pinned, ...unpinned], [pinned, unpinned]);

  const forceExpand = searchQuery.trim().length > 0;

  const visibleTargets = useMemo(() => {
    const targets: SidebarFocusTarget[] = [];
    for (const item of orderedItems) {
      targets.push({ kind: 'section', id: item.id });
      const isExpanded = forceExpand || expandedSections.includes(item.id);
      if (isExpanded && item.children) {
        for (const child of item.children) {
          targets.push({ kind: 'child', id: child.id, parentId: item.id });
        }
      }
    }
    const seen = new Set<string>();
    for (const entry of [...pinnedWorkspaces, ...recentWorkspaces]) {
      if (seen.has(entry.id)) {
        continue;
      }
      seen.add(entry.id);
      targets.push({ kind: 'recent', id: entry.id });
    }
    return targets;
  }, [expandedSections, forceExpand, orderedItems, pinnedWorkspaces, recentWorkspaces]);

  const focusedIndex = useMemo(() => {
    if (!focusTarget) {
      return 0;
    }
    const index = visibleTargets.findIndex((target) => focusKey(target) === focusKey(focusTarget));
    return index >= 0 ? index : 0;
  }, [focusTarget, visibleTargets]);

  const moveFocus = useCallback(
    (delta: number) => {
      if (visibleTargets.length === 0) {
        return;
      }
      const next = (focusedIndex + delta + visibleTargets.length) % visibleTargets.length;
      const target = visibleTargets[next];
      if (target) {
        setFocusTarget(target);
      }
    },
    [focusedIndex, setFocusTarget, visibleTargets],
  );

  const activateFocused = useCallback(() => {
    const target = visibleTargets[focusedIndex];
    if (!target) {
      return;
    }
    if (target.kind === 'section') {
      setActiveSection(target.id);
      return;
    }
    if (target.kind === 'child') {
      setActiveSection(target.parentId, target.id);
      return;
    }
    setActiveSection('projects');
    setFocusTarget(target);
  }, [focusedIndex, setActiveSection, setFocusTarget, visibleTargets]);

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      const target = visibleTargets[focusedIndex];

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        moveFocus(1);
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        moveFocus(-1);
        return;
      }
      if (event.key === 'Home') {
        event.preventDefault();
        const first = visibleTargets[0];
        if (first) {
          setFocusTarget(first);
        }
        return;
      }
      if (event.key === 'End') {
        event.preventDefault();
        const last = visibleTargets[visibleTargets.length - 1];
        if (last) {
          setFocusTarget(last);
        }
        return;
      }
      if (event.key === 'ArrowRight' && target?.kind === 'section') {
        event.preventDefault();
        expandSection(target.id);
        return;
      }
      if (event.key === 'ArrowLeft') {
        if (target?.kind === 'child') {
          event.preventDefault();
          setFocusTarget({ kind: 'section', id: target.parentId });
          return;
        }
        if (target?.kind === 'section' && expandedSections.includes(target.id)) {
          event.preventDefault();
          collapseSection(target.id);
          return;
        }
      }
      if (event.key === 'Enter' || event.key === ' ') {
        if (target?.kind === 'section') {
          const item = orderedItems.find((entry) => entry.id === target.id);
          if (item?.children?.length && event.key === ' ') {
            event.preventDefault();
            toggleSectionExpanded(target.id);
            return;
          }
        }
        event.preventDefault();
        activateFocused();
        return;
      }
      if (event.key === 'Escape') {
        if (searchQuery) {
          event.preventDefault();
          clearSearch();
          return;
        }
      }
      if (event.key === '/' && !(event.target instanceof HTMLInputElement)) {
        event.preventDefault();
        searchInputRef?.current?.focus();
      }
    },
    [
      activateFocused,
      clearSearch,
      collapseSection,
      expandSection,
      expandedSections,
      focusedIndex,
      moveFocus,
      orderedItems,
      searchInputRef,
      searchQuery,
      setFocusTarget,
      toggleSectionExpanded,
      visibleTargets,
    ],
  );

  const isSectionFocused = useCallback(
    (id: SidebarSectionId) => focusTarget?.kind === 'section' && focusTarget.id === id,
    [focusTarget],
  );

  const isChildFocused = useCallback(
    (id: string) => focusTarget?.kind === 'child' && focusTarget.id === id,
    [focusTarget],
  );

  const isRecentFocused = useCallback(
    (id: string) => focusTarget?.kind === 'recent' && focusTarget.id === id,
    [focusTarget],
  );

  return {
    items: SIDEBAR_NAV_ITEMS,
    orderedItems,
    pinned,
    unpinned,
    filteredItems,
    activeSection,
    activeChildId,
    expandedSections,
    forceExpand,
    searchQuery,
    recentProjects: recentWorkspaces,
    focusTarget,
    setActiveSection,
    setFocusTarget,
    toggleSectionExpanded,
    expandSection,
    onKeyDown,
    isSectionFocused,
    isChildFocused,
    isRecentFocused,
  };
}
