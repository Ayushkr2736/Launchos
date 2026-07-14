import { ScrollArea, Separator, cn } from '@launchos/ui';
import { useEffect, useRef } from 'react';

import type { SidebarNavItem, SidebarSectionId } from '@/types/shell';

import { SectionLabel } from '@/components/atoms/section-label';
import { SidebarResizeHandle } from '@/features/sidebar/atoms/sidebar-resize-handle';
import { useSidebarNavigation } from '@/features/sidebar/hooks/use-sidebar-navigation';
import { SidebarHeader } from '@/features/sidebar/molecules/sidebar-header';
import { SidebarItem } from '@/features/sidebar/molecules/sidebar-item';
import { SidebarProfile } from '@/features/sidebar/molecules/sidebar-profile';
import { SidebarRecent } from '@/features/sidebar/molecules/sidebar-recent';
import { SidebarSearch } from '@/features/sidebar/molecules/sidebar-search';
import { useWorkspaceManagerStore } from '@/modules/workspace-manager';
import { useLayoutStore } from '@/stores/layout-store';

function NavGroup({
  label,
  items,
  pinned,
  collapsed,
  activeSection,
  activeChildId,
  expandedSections,
  forceExpand,
  isSectionFocused,
  isChildFocused,
  setActiveSection,
  setFocusTarget,
  toggleSectionExpanded,
}: {
  label: string;
  items: SidebarNavItem[];
  pinned: boolean;
  collapsed: boolean;
  activeSection: SidebarSectionId;
  activeChildId: string | null;
  expandedSections: SidebarSectionId[];
  forceExpand: boolean;
  isSectionFocused: (id: SidebarSectionId) => boolean;
  isChildFocused: (id: string) => boolean;
  setActiveSection: (section: SidebarSectionId, childId?: string | null) => void;
  setFocusTarget: ReturnType<typeof useSidebarNavigation>['setFocusTarget'];
  toggleSectionExpanded: (section: SidebarSectionId) => void;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <>
      {!collapsed ? <SectionLabel className="px-1 py-1">{label}</SectionLabel> : null}
      {items.map((item) => (
        <SidebarItem
          key={item.id}
          item={item}
          active={activeSection === item.id}
          focused={isSectionFocused(item.id)}
          pinned={pinned}
          collapsed={collapsed}
          expanded={forceExpand || expandedSections.includes(item.id)}
          activeChildId={activeSection === item.id ? activeChildId : null}
          isChildFocused={isChildFocused}
          onSelect={() => {
            setActiveSection(item.id);
          }}
          onFocus={() => {
            setFocusTarget({ kind: 'section', id: item.id });
          }}
          onToggleExpand={() => {
            toggleSectionExpanded(item.id);
          }}
          onSelectChild={(childId) => {
            setActiveSection(item.id, childId);
          }}
          onFocusChild={(childId) => {
            setFocusTarget({ kind: 'child', id: childId, parentId: item.id });
          }}
        />
      ))}
    </>
  );
}

export function Sidebar() {
  const collapsed = useLayoutStore((state) => state.sidebarCollapsed);
  const expandSidebar = useLayoutStore((state) => state.expandSidebar);
  const collapseSidebar = useLayoutStore((state) => state.collapseSidebar);
  const explorerVisible = useLayoutStore((state) => state.explorerVisible);
  const expandExplorer = useLayoutStore((state) => state.expandExplorer);
  const collapseExplorer = useLayoutStore((state) => state.collapseExplorer);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const nav = useSidebarNavigation(searchInputRef);
  const switchWorkspace = useWorkspaceManagerStore((state) => state.switchWorkspace);

  const primaryPinned = nav.pinned.filter((item) => item.id !== 'profile');
  const primaryUnpinned = nav.unpinned.filter((item) => item.id !== 'profile');
  const profileItem = nav.items.find((item) => item.id === 'profile');

  const selectSection = (section: SidebarSectionId, childId?: string | null) => {
    // Code owns the left Explorer/Search panel — re-click toggles it closed.
    if (section === 'code' && childId == null) {
      if (nav.activeSection === 'code' && explorerVisible) {
        collapseExplorer();
        return;
      }
      expandExplorer();
    }
    nav.setActiveSection(section, childId);
  };

  useEffect(() => {
    const target = nav.focusTarget;
    if (!target) {
      return;
    }
    const id =
      target.kind === 'section'
        ? `sidebar-item-${target.id}`
        : target.kind === 'child'
          ? `sidebar-child-${target.id}`
          : `sidebar-recent-${target.id}`;
    document.getElementById(id)?.focus({ preventScroll: false });
  }, [nav.focusTarget]);

  return (
    <aside
      aria-label="Primary navigation"
      data-sidebar
      data-collapsed={collapsed ? 'true' : 'false'}
      className={cn(
        'shell-sidebar border-sidebar-border bg-sidebar text-sidebar-foreground relative flex h-full flex-col overflow-hidden border-r',
      )}
      onKeyDown={nav.onKeyDown}
    >
      <SidebarHeader collapsed={collapsed} onExpand={expandSidebar} onCollapse={collapseSidebar} />

      {!collapsed ? <SidebarSearch inputRef={searchInputRef} /> : null}

      <ScrollArea className="min-h-0 flex-1">
        <nav
          aria-label="Sidebar sections"
          role="tree"
          aria-orientation="vertical"
          className="flex flex-col gap-1 p-2"
        >
          <NavGroup
            label="Pinned"
            items={primaryPinned}
            pinned
            collapsed={collapsed}
            activeSection={nav.activeSection}
            activeChildId={nav.activeChildId}
            expandedSections={nav.expandedSections}
            forceExpand={nav.forceExpand}
            isSectionFocused={nav.isSectionFocused}
            isChildFocused={nav.isChildFocused}
            setActiveSection={selectSection}
            setFocusTarget={nav.setFocusTarget}
            toggleSectionExpanded={nav.toggleSectionExpanded}
          />

          {primaryPinned.length > 0 && primaryUnpinned.length > 0 ? (
            <Separator className="bg-sidebar-border my-1" />
          ) : null}

          <NavGroup
            label="Navigate"
            items={primaryUnpinned}
            pinned={false}
            collapsed={collapsed}
            activeSection={nav.activeSection}
            activeChildId={nav.activeChildId}
            expandedSections={nav.expandedSections}
            forceExpand={nav.forceExpand}
            isSectionFocused={nav.isSectionFocused}
            isChildFocused={nav.isChildFocused}
            setActiveSection={selectSection}
            setFocusTarget={nav.setFocusTarget}
            toggleSectionExpanded={nav.toggleSectionExpanded}
          />

          {nav.filteredItems.length === 0 && !collapsed ? (
            <p className="text-sidebar-foreground/50 px-2 py-6 text-center text-xs">
              No matching sections
            </p>
          ) : null}
        </nav>
      </ScrollArea>

      <SidebarRecent
        collapsed={collapsed}
        isFocused={nav.isRecentFocused}
        onFocus={(id) => {
          nav.setFocusTarget({ kind: 'recent', id });
        }}
        onOpen={(workspace) => {
          void switchWorkspace(workspace.path);
          nav.setActiveSection('code');
          nav.setFocusTarget({ kind: 'recent', id: workspace.id });
        }}
      />

      {profileItem ? (
        <SidebarProfile
          collapsed={collapsed}
          active={nav.activeSection === 'profile'}
          focused={nav.isSectionFocused('profile')}
          expanded={nav.forceExpand || nav.expandedSections.includes('profile')}
          childrenItems={profileItem.children ?? []}
          activeChildId={nav.activeSection === 'profile' ? nav.activeChildId : null}
          isChildFocused={nav.isChildFocused}
          onSelect={() => {
            nav.setActiveSection('profile');
          }}
          onFocus={() => {
            nav.setFocusTarget({ kind: 'section', id: 'profile' });
          }}
          onToggleExpand={() => {
            nav.toggleSectionExpanded('profile');
          }}
          onSelectChild={(childId) => {
            nav.setActiveSection('profile', childId);
          }}
          onFocusChild={(childId) => {
            nav.setFocusTarget({ kind: 'child', id: childId, parentId: 'profile' });
          }}
        />
      ) : null}

      <SidebarResizeHandle enabled={!collapsed} />
    </aside>
  );
}
