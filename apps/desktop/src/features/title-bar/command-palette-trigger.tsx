import { Kbd, cn } from '@launchos/ui';
import { Command } from 'lucide-react';

import { useLayoutStore } from '@/stores/layout-store';

export function CommandPaletteTrigger() {
  const setCommandPaletteOpen = useLayoutStore((state) => state.setCommandPaletteOpen);

  return (
    <button
      type="button"
      aria-label="Open command palette"
      aria-keyshortcuts="Meta+K Control+K"
      onClick={() => {
        setCommandPaletteOpen(true);
      }}
      className={cn(
        'border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground inline-flex h-8 items-center gap-2 rounded-md border px-2.5 text-xs transition-colors',
      )}
    >
      <Command className="h-3.5 w-3.5" aria-hidden />
      <span>Command</span>
      <Kbd>⌘K</Kbd>
    </button>
  );
}
