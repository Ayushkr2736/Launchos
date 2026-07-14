import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  ScrollArea,
  cn,
} from '@launchos/ui';
import { FolderOpen, Pin, PinOff, Trash2 } from 'lucide-react';

import type { WorkspaceEntry } from '@/modules/workspace-manager';

import { SectionLabel } from '@/components/atoms/section-label';
import { EmptyState } from '@/components/molecules/empty-state';
import { useWorkspaceCatalog, useWorkspaceManagerStore } from '@/modules/workspace-manager';

interface SidebarRecentProps {
  collapsed: boolean;
  isFocused: (id: string) => boolean;
  onFocus: (id: string) => void;
  onOpen: (workspace: WorkspaceEntry) => void;
}

function WorkspaceRow({
  entry,
  focused,
  active,
  pinned,
  onFocus,
  onOpen,
  onTogglePin,
  onRemove,
}: {
  entry: WorkspaceEntry;
  focused: boolean;
  active: boolean;
  pinned: boolean;
  onFocus: () => void;
  onOpen: () => void;
  onTogglePin: () => void;
  onRemove?: () => void;
}) {
  return (
    <li>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <button
            type="button"
            id={`sidebar-recent-${entry.id}`}
            tabIndex={focused ? 0 : -1}
            onFocus={onFocus}
            onClick={onOpen}
            className={cn(
              'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors',
              'text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground',
              focused && 'ring-ring ring-2',
              active && 'bg-sidebar-accent text-sidebar-foreground',
            )}
          >
            <FolderOpen className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
            <span className="min-w-0 flex-1 truncate">{entry.name}</span>
            {pinned ? <Pin className="h-3 w-3 shrink-0 opacity-50" aria-hidden /> : null}
          </button>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onSelect={onOpen}>Open workspace</ContextMenuItem>
          <ContextMenuItem onSelect={onTogglePin}>
            {pinned ? (
              <>
                <PinOff className="mr-2 h-3.5 w-3.5" />
                Unpin
              </>
            ) : (
              <>
                <Pin className="mr-2 h-3.5 w-3.5" />
                Pin
              </>
            )}
          </ContextMenuItem>
          {onRemove ? (
            <>
              <ContextMenuSeparator />
              <ContextMenuItem onSelect={onRemove}>
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Remove from recent
              </ContextMenuItem>
            </>
          ) : null}
        </ContextMenuContent>
      </ContextMenu>
    </li>
  );
}

export function SidebarRecent({ collapsed, isFocused, onFocus, onOpen }: SidebarRecentProps) {
  const { recents, pinned, activeWorkspaceId } = useWorkspaceCatalog();
  const removeRecent = useWorkspaceManagerStore((state) => state.removeRecent);
  const clearRecents = useWorkspaceManagerStore((state) => state.clearRecents);
  const togglePinned = useWorkspaceManagerStore((state) => state.togglePinned);

  const pinnedIds = new Set(pinned.map((item) => item.id));
  const unpinnedRecents = recents.filter((item) => !pinnedIds.has(item.id));

  if (collapsed) {
    return null;
  }

  const hasAny = pinned.length > 0 || unpinnedRecents.length > 0;

  return (
    <div className="border-sidebar-border flex min-h-0 flex-col border-t">
      {pinned.length > 0 ? (
        <div className="flex min-h-0 flex-col">
          <div className="flex items-center justify-between px-3 pt-2">
            <SectionLabel className="px-0 py-0">Pinned workspaces</SectionLabel>
          </div>
          <ul className="flex flex-col gap-0.5 p-1 px-2" aria-label="Pinned workspaces">
            {pinned.map((entry) => (
              <WorkspaceRow
                key={`pinned-${entry.id}`}
                entry={entry}
                focused={isFocused(entry.id)}
                active={activeWorkspaceId === entry.id}
                pinned
                onFocus={() => {
                  onFocus(entry.id);
                }}
                onOpen={() => {
                  onOpen(entry);
                }}
                onTogglePin={() => {
                  togglePinned(entry.id);
                }}
              />
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex items-center justify-between px-3 pt-2">
        <SectionLabel className="px-0 py-0">Recent workspaces</SectionLabel>
        {unpinnedRecents.length > 0 ? (
          <button
            type="button"
            className="text-sidebar-foreground/45 hover:text-sidebar-foreground text-[10px] uppercase tracking-wide transition-colors"
            onClick={() => {
              clearRecents();
            }}
          >
            Clear
          </button>
        ) : null}
      </div>
      <ScrollArea className="max-h-40 min-h-0 flex-1 px-1 pb-2">
        {!hasAny ? (
          <EmptyState
            icon={FolderOpen}
            title="No recent workspaces"
            description="Folders you open will appear here for fast switching."
            className="min-h-[7rem] px-2"
          />
        ) : unpinnedRecents.length === 0 ? (
          <p className="text-sidebar-foreground/45 px-3 py-2 text-xs">
            All recent workspaces are pinned.
          </p>
        ) : (
          <ul className="flex flex-col gap-0.5 p-1" aria-label="Recent workspaces">
            {unpinnedRecents.map((entry) => (
              <WorkspaceRow
                key={entry.id}
                entry={entry}
                focused={isFocused(entry.id)}
                active={activeWorkspaceId === entry.id}
                pinned={false}
                onFocus={() => {
                  onFocus(entry.id);
                }}
                onOpen={() => {
                  onOpen(entry);
                }}
                onTogglePin={() => {
                  togglePinned(entry.id);
                }}
                onRemove={() => {
                  removeRecent(entry.id);
                }}
              />
            ))}
          </ul>
        )}
      </ScrollArea>
    </div>
  );
}
