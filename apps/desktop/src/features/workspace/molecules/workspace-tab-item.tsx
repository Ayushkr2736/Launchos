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
import { Copy, Columns2, Pin, PinOff, RotateCcw, X } from 'lucide-react';
import { useEffect, useRef, useState, type DragEvent, type KeyboardEvent } from 'react';

import type { WorkspaceTab } from '@/types/shell';

import { useWorkspaceTabDnD } from '@/features/workspace/hooks/use-workspace-tab-dnd';
import { tabCommands } from '@/features/workspace/services/tab-commands';
import { isTabPinned } from '@/features/workspace/utils/tab-order';
import { useWorkspaceStore } from '@/stores/workspace-store';

interface WorkspaceTabItemProps {
  tab: WorkspaceTab;
  active: boolean;
  index: number;
}

export function WorkspaceTabItem({ tab, active, index }: WorkspaceTabItemProps) {
  const tabsLength = useWorkspaceStore((state) => state.tabs.length);
  const closedCount = useWorkspaceStore((state) => state.closedTabs.length);
  const { onTabDragStart, onTabDragOver, onTabDrop, onTabDragLeave } = useWorkspaceTabDnD();
  const [dropEdge, setDropEdge] = useState<'before' | 'after' | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const pinned = isTabPinned(tab);
  const canClose = tab.closable && !pinned;
  const dirty = Boolean(tab.dirty);

  useEffect(() => {
    if (!active || !ref.current) {
      return;
    }
    ref.current.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  }, [active]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      tabCommands.activate(tab.id);
      return;
    }
    if (event.key === 'Delete' || event.key === 'Backspace') {
      if (!canClose) {
        return;
      }
      event.preventDefault();
      void tabCommands.close(tab.id);
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <motion.div
          ref={ref}
          layout
          initial={{ opacity: 0, y: 6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={{ duration: 0.14, ease: 'easeOut' }}
          draggable
          onDragStart={(event) => {
            onTabDragStart(event as unknown as DragEvent<HTMLElement>, tab.id);
          }}
          onDragOver={(event) => {
            const edge = onTabDragOver(event as unknown as DragEvent<HTMLElement>, tab.id);
            setDropEdge(edge);
          }}
          onDragLeave={() => {
            onTabDragLeave();
            setDropEdge(null);
          }}
          onDrop={(event) => {
            onTabDrop(event as unknown as DragEvent<HTMLElement>, tab.id);
            setDropEdge(null);
          }}
          onClick={() => {
            tabCommands.activate(tab.id);
          }}
          onAuxClick={(event) => {
            if (event.button === 1 && canClose) {
              event.preventDefault();
              void tabCommands.close(tab.id);
            }
          }}
          onKeyDown={onKeyDown}
          role="tab"
          aria-selected={active}
          aria-label={`${tab.title}${dirty ? ', unsaved' : ''}${pinned ? ', pinned' : ''}`}
          tabIndex={active ? 0 : -1}
          className={cn(
            'border-border group relative flex h-8 min-w-[7rem] max-w-[14rem] cursor-grab items-center gap-1 border-r px-2 text-xs outline-none transition-colors active:cursor-grabbing',
            active
              ? 'bg-background text-foreground shadow-[inset_0_-1px_0_0_hsl(var(--primary))]'
              : 'bg-muted/40 text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            pinned && 'min-w-[5.5rem]',
          )}
        >
          {dropEdge === 'before' ? (
            <span className="bg-primary absolute inset-y-1 left-0 w-0.5 rounded-full" aria-hidden />
          ) : null}
          {dropEdge === 'after' ? (
            <span
              className="bg-primary absolute inset-y-1 right-0 w-0.5 rounded-full"
              aria-hidden
            />
          ) : null}
          {pinned ? <Pin className="text-muted-foreground h-3 w-3 shrink-0" aria-hidden /> : null}
          <span className="min-w-0 flex-1 truncate text-left">
            {dirty ? (
              <span
                className="bg-foreground/80 mr-1.5 inline-block h-2 w-2 rounded-full align-middle"
                title="Unsaved changes"
                aria-hidden
              />
            ) : null}
            {tab.title}
          </span>
          {canClose ? (
            <button
              type="button"
              aria-label={dirty ? `Close ${tab.title} (unsaved)` : `Close ${tab.title}`}
              className={cn(
                'hover:bg-accent rounded p-0.5 transition-opacity',
                active || dirty ? 'opacity-80' : 'opacity-0 group-hover:opacity-100',
              )}
              onClick={(event) => {
                event.stopPropagation();
                void tabCommands.close(tab.id);
              }}
            >
              {dirty ? (
                <span className="flex h-3 w-3 items-center justify-center group-hover:hidden">
                  <span className="bg-foreground h-1.5 w-1.5 rounded-full" />
                </span>
              ) : null}
              <X className={cn('h-3 w-3', dirty && 'hidden group-hover:block')} />
            </button>
          ) : null}
        </motion.div>
      </ContextMenuTrigger>
      <ContextMenuContent className="min-w-52">
        <ContextMenuItem
          onSelect={() => {
            tabCommands.activate(tab.id);
          }}
        >
          Activate
        </ContextMenuItem>
        <ContextMenuItem
          onSelect={() => {
            tabCommands.pin(tab.id);
          }}
        >
          {pinned ? (
            <>
              <PinOff className="mr-2 h-3.5 w-3.5" aria-hidden />
              Unpin
            </>
          ) : (
            <>
              <Pin className="mr-2 h-3.5 w-3.5" aria-hidden />
              Pin
            </>
          )}
          <ContextMenuShortcut>⌘⌥P</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem
          onSelect={() => {
            tabCommands.duplicate(tab.id);
          }}
        >
          <Copy className="mr-2 h-3.5 w-3.5" aria-hidden />
          Duplicate
          <ContextMenuShortcut>⌘⇧D</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          disabled={!tab.closable}
          onSelect={() => {
            void tabCommands.close(tab.id, { force: true });
          }}
        >
          Close
          <ContextMenuShortcut>⌘W</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem
          disabled={tabsLength <= 1}
          onSelect={() => {
            void tabCommands.closeOthers(tab.id);
          }}
        >
          Close Others
          <ContextMenuShortcut>⌘⌥T</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem
          disabled={index <= 0}
          onSelect={() => {
            void tabCommands.closeLeft(tab.id);
          }}
        >
          Close to the Left
        </ContextMenuItem>
        <ContextMenuItem
          disabled={index >= tabsLength - 1}
          onSelect={() => {
            void tabCommands.closeRight(tab.id);
          }}
        >
          Close to the Right
        </ContextMenuItem>
        <ContextMenuItem
          onSelect={() => {
            void tabCommands.closeAll();
          }}
        >
          Close All
          <ContextMenuShortcut>⌘⌥W</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          onSelect={() => {
            tabCommands.splitRight(tab.id);
          }}
        >
          <Columns2 className="mr-2 h-3.5 w-3.5" aria-hidden />
          Split Right
        </ContextMenuItem>
        <ContextMenuItem
          disabled={closedCount === 0}
          onSelect={() => {
            tabCommands.reopenClosed();
          }}
        >
          <RotateCcw className="mr-2 h-3.5 w-3.5" aria-hidden />
          Reopen Closed Editor
          <ContextMenuShortcut>⌘⇧T</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
