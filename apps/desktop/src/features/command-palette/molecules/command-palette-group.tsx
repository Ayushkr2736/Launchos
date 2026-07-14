import { Command } from 'cmdk';

import type { CommandPaletteItem } from '@/features/command-palette/types';

import { CommandPaletteItemRow } from '@/features/command-palette/atoms/command-palette-item';

interface CommandPaletteGroupProps {
  heading: string;
  items: readonly CommandPaletteItem[];
}

export function CommandPaletteGroup({ heading, items }: CommandPaletteGroupProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <Command.Group
      heading={heading}
      className="[&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide"
    >
      {items.map((item) => (
        <CommandPaletteItemRow key={item.id} item={item} />
      ))}
    </Command.Group>
  );
}
