import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  cn,
} from '@launchos/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, Pin, PinOff } from 'lucide-react';

import type { SidebarNavItem } from '@/types/shell';

import { SIDEBAR_ICONS } from '@/features/sidebar/constants';
import { SidebarNestedItem } from '@/features/sidebar/molecules/sidebar-nested-item';
import { useLayoutStore } from '@/stores/layout-store';
import { useSidebarStore } from '@/stores/sidebar-store';

interface SidebarItemProps {
  item: SidebarNavItem;
  active: boolean;
  focused: boolean;
  pinned: boolean;
  collapsed: boolean;
  expanded: boolean;
  activeChildId: string | null;
  isChildFocused: (id: string) => boolean;
  onSelect: () => void;
  onFocus: () => void;
  onToggleExpand: () => void;
  onSelectChild: (childId: string) => void;
  onFocusChild: (childId: string) => void;
}

export function SidebarItem({
  item,
  active,
  focused,
  pinned,
  collapsed,
  expanded,
  activeChildId,
  isChildFocused,
  onSelect,
  onFocus,
  onToggleExpand,
  onSelectChild,
  onFocusChild,
}: SidebarItemProps) {
  const Icon = SIDEBAR_ICONS[item.id];
  const togglePinned = useSidebarStore((state) => state.togglePinned);
  const setSidebarCollapsed = useLayoutStore((state) => state.setSidebarCollapsed);
  const hasChildren = Boolean(item.children?.length);

  const button = (
    <button
      type="button"
      id={`sidebar-item-${item.id}`}
      role="treeitem"
      aria-current={active && !activeChildId ? 'page' : undefined}
      aria-expanded={hasChildren ? expanded : undefined}
      aria-selected={active}
      tabIndex={focused ? 0 : -1}
      onFocus={onFocus}
      onClick={() => {
        onSelect();
        // Click again collapses nested items (open ↔ closed).
        if (hasChildren && !collapsed) {
          onToggleExpand();
        }
      }}
      className={cn(
        'group relative flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors',
        active
          ? 'bg-sidebar-accent text-sidebar-foreground'
          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground',
        focused && 'ring-ring ring-2 ring-offset-0',
        collapsed && 'justify-center px-0',
      )}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      {!collapsed ? (
        <>
          <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
          {pinned ? <Pin className="h-3 w-3 shrink-0 opacity-55" aria-hidden /> : null}
          {hasChildren ? (
            <ChevronRight
              className={cn(
                'h-3.5 w-3.5 shrink-0 opacity-50 transition-transform duration-200',
                expanded && 'rotate-90',
              )}
              aria-hidden
              onClick={(event) => {
                event.stopPropagation();
                onToggleExpand();
              }}
            />
          ) : null}
        </>
      ) : null}
    </button>
  );

  return (
    <div role="group" aria-labelledby={`sidebar-item-${item.id}`}>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          {collapsed ? (
            <Tooltip delayDuration={180}>
              <TooltipTrigger asChild>{button}</TooltipTrigger>
              <TooltipContent side="right" className="flex items-center gap-2">
                <span>{item.label}</span>
                {item.shortcut ? (
                  <span className="text-primary-foreground/70">{item.shortcut}</span>
                ) : null}
              </TooltipContent>
            </Tooltip>
          ) : (
            button
          )}
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onSelect={onSelect}>Open {item.label}</ContextMenuItem>
          {hasChildren ? (
            <ContextMenuItem onSelect={onToggleExpand}>
              {expanded ? 'Collapse' : 'Expand'} section
            </ContextMenuItem>
          ) : null}
          <ContextMenuItem
            onSelect={() => {
              togglePinned(item.id);
            }}
          >
            {pinned ? (
              <>
                <PinOff className="mr-2 h-3.5 w-3.5" />
                Unpin
              </>
            ) : (
              <>
                <Pin className="mr-2 h-3.5 w-3.5" />
                Pin to sidebar
              </>
            )}
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            onSelect={() => {
              setSidebarCollapsed(false);
            }}
          >
            Expand sidebar
            <ContextMenuShortcut>⌘B</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <AnimatePresence initial={false}>
        {!collapsed && expanded && item.children ? (
          <motion.div
            key={`${item.id}-children`}
            role="group"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-0.5 flex flex-col gap-0.5">
              {item.children.map((child) => (
                <SidebarNestedItem
                  key={child.id}
                  child={child}
                  active={activeChildId === child.id}
                  focused={isChildFocused(child.id)}
                  onSelect={() => {
                    onSelectChild(child.id);
                  }}
                  onFocus={() => {
                    onFocusChild(child.id);
                  }}
                />
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
