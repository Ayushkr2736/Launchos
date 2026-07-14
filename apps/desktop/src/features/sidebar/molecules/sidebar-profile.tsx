import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  cn,
} from '@launchos/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, UserRound } from 'lucide-react';

import type { SidebarNavChild } from '@/types/shell';

import { SidebarNestedItem } from '@/features/sidebar/molecules/sidebar-nested-item';

interface SidebarProfileProps {
  collapsed: boolean;
  active: boolean;
  focused: boolean;
  expanded: boolean;
  childrenItems: readonly SidebarNavChild[];
  activeChildId: string | null;
  isChildFocused: (id: string) => boolean;
  onSelect: () => void;
  onFocus: () => void;
  onToggleExpand: () => void;
  onSelectChild: (childId: string) => void;
  onFocusChild: (childId: string) => void;
}

export function SidebarProfile({
  collapsed,
  active,
  focused,
  expanded,
  childrenItems,
  activeChildId,
  isChildFocused,
  onSelect,
  onFocus,
  onToggleExpand,
  onSelectChild,
  onFocusChild,
}: SidebarProfileProps) {
  const button = (
    <motion.button
      type="button"
      whileHover={{ scale: collapsed ? 1.05 : 1.01 }}
      whileTap={{ scale: 0.98 }}
      id="sidebar-item-profile"
      role="treeitem"
      aria-expanded={!collapsed ? expanded : undefined}
      aria-selected={active}
      aria-current={active && !activeChildId ? 'page' : undefined}
      tabIndex={focused ? 0 : -1}
      onFocus={onFocus}
      onClick={() => {
        onSelect();
        if (!collapsed) {
          onToggleExpand();
        }
      }}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors',
        active
          ? 'bg-sidebar-accent text-sidebar-foreground'
          : 'text-sidebar-foreground/75 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground',
        focused && 'ring-ring ring-2',
        collapsed && 'justify-center px-0',
      )}
    >
      <span className="bg-sidebar-accent text-sidebar-foreground flex h-7 w-7 shrink-0 items-center justify-center rounded-full">
        <UserRound className="h-3.5 w-3.5" aria-hidden />
      </span>
      {!collapsed ? (
        <>
          <span className="min-w-0 flex-1 text-left">
            <span className="block truncate font-medium">Profile</span>
            <span className="text-sidebar-foreground/50 block truncate text-[11px]">Account</span>
          </span>
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
        </>
      ) : null}
    </motion.button>
  );

  return (
    <div className="border-sidebar-border border-t p-2">
      <ContextMenu>
        <ContextMenuTrigger asChild>
          {collapsed ? (
            <Tooltip delayDuration={180}>
              <TooltipTrigger asChild>{button}</TooltipTrigger>
              <TooltipContent side="right">Profile</TooltipContent>
            </Tooltip>
          ) : (
            button
          )}
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onSelect={onSelect}>Open profile</ContextMenuItem>
          <ContextMenuItem onSelect={onToggleExpand}>
            {expanded ? 'Collapse' : 'Expand'} section
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem disabled>Sign out</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <AnimatePresence initial={false}>
        {!collapsed && expanded ? (
          <motion.div
            key="profile-children"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-0.5 flex flex-col gap-0.5">
              {childrenItems.map((child) => (
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
