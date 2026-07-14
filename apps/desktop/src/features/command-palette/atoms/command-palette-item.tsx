import { Kbd, cn } from '@launchos/ui';
import { Command } from 'cmdk';

import type { CommandPaletteItem } from '@/features/command-palette/types';

interface CommandPaletteItemRowProps {
  item: CommandPaletteItem;
}

export function CommandPaletteItemRow({ item }: CommandPaletteItemRowProps) {
  const Icon = item.icon;

  return (
    <Command.Item
      value={`${item.id} ${item.label} ${item.keywords?.join(' ') ?? ''} ${item.hint ?? ''}`}
      {...(item.disabled ? { disabled: true } : {})}
      onSelect={() => {
        if (item.disabled) {
          return;
        }
        item.run();
      }}
      className={cn(
        'group relative flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-sm outline-none',
        'text-foreground data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground',
        'aria-selected:bg-accent aria-selected:text-accent-foreground',
        'data-[disabled=true]:cursor-default data-[disabled=true]:opacity-50',
        'transition-colors duration-100',
        'before:bg-primary before:absolute before:inset-y-1 before:left-1 before:w-0.5 before:rounded-full',
        'before:opacity-0 before:transition-opacity before:duration-100',
        'data-[selected=true]:before:opacity-100',
      )}
    >
      <Icon
        className="text-muted-foreground group-data-[selected=true]:text-accent-foreground h-4 w-4 shrink-0"
        aria-hidden
      />
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {item.hint ? (
        <span className="text-muted-foreground max-w-[40%] truncate text-xs">{item.hint}</span>
      ) : null}
      {item.shortcut ? <Kbd className="shrink-0">{item.shortcut}</Kbd> : null}
    </Command.Item>
  );
}
