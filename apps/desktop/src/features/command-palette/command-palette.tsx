import { useEffect, useMemo, useState } from 'react';

import { useCommandPaletteCommands } from '@/features/command-palette/hooks/use-command-palette-commands';
import { useOpenFileCommands } from '@/features/command-palette/hooks/use-open-file-commands';
import { filterCommandItems } from '@/features/command-palette/lib/filter-commands';
import { CommandPaletteDialog } from '@/features/command-palette/molecules/command-palette-dialog';
import { CommandPaletteSurface } from '@/features/command-palette/molecules/command-palette-surface';
import { useLayoutStore } from '@/stores/layout-store';

/**
 * Production command palette (⌘K / Ctrl+K).
 * cmdk + Framer Motion — commands, files, projects, git, theme, settings, agents.
 */
export function CommandPalette() {
  const open = useLayoutStore((state) => state.commandPaletteOpen);
  const setCommandPaletteOpen = useLayoutStore((state) => state.setCommandPaletteOpen);
  const commands = useCommandPaletteCommands();
  const [query, setQuery] = useState('');
  const openFileCommands = useOpenFileCommands(query);

  useEffect(() => {
    if (!open) {
      setQuery('');
    }
  }, [open]);

  const items = useMemo(() => {
    const merged = [...openFileCommands, ...commands];
    return filterCommandItems(merged, query);
  }, [commands, openFileCommands, query]);

  const trimmed = query.trim();
  const placeholder = trimmed
    ? 'Search files, commands, projects…'
    : 'Search files, commands, git, settings…';

  return (
    <CommandPaletteDialog open={open} onOpenChange={setCommandPaletteOpen}>
      <CommandPaletteSurface
        items={items}
        query={query}
        onQueryChange={setQuery}
        placeholder={placeholder}
        statusText={`${items.length} result${items.length === 1 ? '' : 's'}`}
      />
    </CommandPaletteDialog>
  );
}
