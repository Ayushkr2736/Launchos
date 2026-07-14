import { Command } from 'cmdk';
import { useMemo } from 'react';

import type {
  CommandPaletteGroupId,
  CommandPaletteGroupMeta,
  CommandPaletteItem,
} from '@/features/command-palette/types';

import { COMMAND_PALETTE_GROUP_ORDER } from '@/features/command-palette/constants';
import { CommandPaletteGroup } from '@/features/command-palette/molecules/command-palette-group';
import { CommandPaletteInput } from '@/features/command-palette/molecules/command-palette-input';

export interface CommandPaletteSurfaceProps {
  items: readonly CommandPaletteItem[];
  query: string;
  onQueryChange: (query: string) => void;
  groups?: readonly CommandPaletteGroupMeta[];
  placeholder?: string;
  label?: string;
  footerLeft?: string;
  footerRight?: string;
  /** Optional live status (e.g. result count) for screen readers. */
  statusText?: string;
}

function groupItems(
  items: readonly CommandPaletteItem[],
  groupId: CommandPaletteGroupId,
): CommandPaletteItem[] {
  return items.filter((item) => item.group === groupId);
}

/**
 * Reusable cmdk surface — chrome only. Pass items from any command source.
 * Keyboard: ↑↓ navigate (loop), Enter run, Esc closes via dialog.
 */
export function CommandPaletteSurface({
  items,
  query,
  onQueryChange,
  groups = COMMAND_PALETTE_GROUP_ORDER,
  placeholder = 'Type a command or search…',
  label = 'Command palette',
  footerLeft = '↑↓ navigate · ↵ run · esc close',
  footerRight = '⌘K',
  statusText,
}: CommandPaletteSurfaceProps) {
  const grouped = useMemo(
    () =>
      groups
        .map((group) => ({
          ...group,
          items: groupItems(items, group.id),
        }))
        .filter((group) => group.items.length > 0),
    [groups, items],
  );

  const visibleCount = useMemo(
    () => grouped.reduce((sum, group) => sum + group.items.length, 0),
    [grouped],
  );

  return (
    <Command
      label={label}
      shouldFilter={false}
      loop
      vimBindings
      className="flex max-h-[min(32rem,72vh)] flex-col outline-none"
    >
      <CommandPaletteInput value={query} onValueChange={onQueryChange} placeholder={placeholder} />
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {statusText ?? `${visibleCount} result${visibleCount === 1 ? '' : 's'}`}
      </div>
      <Command.List
        className="flex-1 overflow-y-auto overscroll-contain p-2"
        aria-label="Command results"
      >
        <Command.Empty className="text-muted-foreground py-8 text-center text-sm">
          {query.trim() ? `No results for “${query.trim()}”.` : 'No commands available.'}
        </Command.Empty>
        {grouped.map((group) => (
          <CommandPaletteGroup key={group.id} heading={group.heading} items={group.items} />
        ))}
      </Command.List>
      <div className="border-border text-muted-foreground flex items-center justify-between border-t px-3 py-2 text-[11px]">
        <span>{footerLeft}</span>
        <kbd className="border-border/80 bg-muted/40 rounded border px-1.5 py-0.5 font-mono text-[10px]">
          {footerRight}
        </kbd>
      </div>
    </Command>
  );
}
