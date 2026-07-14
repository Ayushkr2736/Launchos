import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
  cn,
} from '@launchos/ui';
import { motion } from 'framer-motion';

import type { SidebarNavChild } from '@/types/shell';

interface SidebarNestedItemProps {
  child: SidebarNavChild;
  active: boolean;
  focused: boolean;
  onSelect: () => void;
  onFocus: () => void;
}

export function SidebarNestedItem({
  child,
  active,
  focused,
  onSelect,
  onFocus,
}: SidebarNestedItemProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <motion.button
          type="button"
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.98 }}
          id={`sidebar-child-${child.id}`}
          role="treeitem"
          aria-selected={active}
          tabIndex={focused ? 0 : -1}
          onFocus={onFocus}
          onClick={onSelect}
          className={cn(
            'group flex w-full items-center rounded-md py-1.5 pl-9 pr-2 text-left text-sm transition-colors',
            active
              ? 'bg-sidebar-accent text-sidebar-foreground'
              : 'text-sidebar-foreground/65 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
            focused && 'ring-ring ring-2 ring-offset-0',
          )}
        >
          <span className="truncate">{child.label}</span>
        </motion.button>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onSelect={onSelect}>Open {child.label}</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem disabled>
          Open in new tab
          <ContextMenuShortcut>⌘⏎</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
