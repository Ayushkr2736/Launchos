import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { SidebarFocusTarget, SidebarRecentProject, SidebarSectionId } from '@/types/shell';

import { SIDEBAR_STORAGE_KEY } from '@/constants/shell';
import { useWorkspaceManagerStore } from '@/modules/workspace-manager/stores/workspace-manager-store';

export interface SidebarStoreState {
  activeSection: SidebarSectionId;
  activeChildId: string | null;
  pinnedItems: SidebarSectionId[];
  expandedSections: SidebarSectionId[];
  searchQuery: string;
  /**
   * @deprecated Kept for one-time migration into Workspace Manager.
   * Prefer `useWorkspaceManagerStore().recents`.
   */
  recentProjects: SidebarRecentProject[];
  focusTarget: SidebarFocusTarget | null;
  setActiveSection: (section: SidebarSectionId, childId?: string | null) => void;
  setActiveChild: (childId: string | null) => void;
  pinItem: (section: SidebarSectionId) => void;
  unpinItem: (section: SidebarSectionId) => void;
  togglePinned: (section: SidebarSectionId) => void;
  expandSection: (section: SidebarSectionId) => void;
  collapseSection: (section: SidebarSectionId) => void;
  toggleSectionExpanded: (section: SidebarSectionId) => void;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  /** @deprecated Prefer `useWorkspaceManagerStore().rememberWorkspace`. */
  addRecentProject: (
    project: Omit<SidebarRecentProject, 'openedAt'> & { openedAt?: number },
  ) => void;
  /** @deprecated Prefer `useWorkspaceManagerStore().removeRecent`. */
  removeRecentProject: (projectId: string) => void;
  /** @deprecated Prefer `useWorkspaceManagerStore().clearRecents`. */
  clearRecentProjects: () => void;
  setFocusTarget: (target: SidebarFocusTarget | null) => void;
}

export const useSidebarStore = create<SidebarStoreState>()(
  persist(
    (set, get) => ({
      activeSection: 'home',
      activeChildId: null,
      pinnedItems: [],
      expandedSections: [],
      searchQuery: '',
      recentProjects: [],
      focusTarget: { kind: 'section', id: 'home' },
      setActiveSection: (section, childId = null) => {
        set({
          activeSection: section,
          activeChildId: childId,
          focusTarget: childId
            ? { kind: 'child', id: childId, parentId: section }
            : { kind: 'section', id: section },
        });
      },
      setActiveChild: (childId) => {
        set({ activeChildId: childId });
      },
      pinItem: (section) => {
        const pinned = get().pinnedItems;
        if (pinned.includes(section)) {
          return;
        }
        set({ pinnedItems: [...pinned, section] });
      },
      unpinItem: (section) => {
        set({ pinnedItems: get().pinnedItems.filter((item) => item !== section) });
      },
      togglePinned: (section) => {
        if (get().pinnedItems.includes(section)) {
          get().unpinItem(section);
          return;
        }
        get().pinItem(section);
      },
      expandSection: (section) => {
        if (get().expandedSections.includes(section)) {
          return;
        }
        set({ expandedSections: [...get().expandedSections, section] });
      },
      collapseSection: (section) => {
        set({ expandedSections: get().expandedSections.filter((id) => id !== section) });
      },
      toggleSectionExpanded: (section) => {
        if (get().expandedSections.includes(section)) {
          get().collapseSection(section);
          return;
        }
        get().expandSection(section);
      },
      setSearchQuery: (query) => {
        set({ searchQuery: query });
      },
      clearSearch: () => {
        set({ searchQuery: '' });
      },
      addRecentProject: (project) => {
        useWorkspaceManagerStore
          .getState()
          .rememberWorkspace(project.path ?? project.id, project.name);
      },
      removeRecentProject: (projectId) => {
        useWorkspaceManagerStore.getState().removeRecent(projectId);
      },
      clearRecentProjects: () => {
        useWorkspaceManagerStore.getState().clearRecents();
      },
      setFocusTarget: (target) => {
        set({ focusTarget: target });
      },
    }),
    {
      name: SIDEBAR_STORAGE_KEY,
      partialize: (state) => ({
        activeSection: state.activeSection,
        activeChildId: state.activeChildId,
        pinnedItems: state.pinnedItems,
        expandedSections: state.expandedSections,
        // Keep legacy list until Workspace Manager imports it once.
        recentProjects: state.recentProjects,
      }),
    },
  ),
);
