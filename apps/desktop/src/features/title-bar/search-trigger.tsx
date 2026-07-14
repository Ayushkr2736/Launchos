import { cn } from '@launchos/ui';
import { Search } from 'lucide-react';

import { useLayoutStore } from '@/stores/layout-store';

/** Title-bar search — narrows when the primary sidebar is expanded so chrome still fits. */
export function SearchTrigger() {
  const setCommandPaletteOpen = useLayoutStore((state) => state.setCommandPaletteOpen);
  const sidebarCollapsed = useLayoutStore((state) => state.sidebarCollapsed);

  return (
    <button
      type="button"
      aria-label="Search workspace and commands"
      aria-keyshortcuts="Meta+K Control+K"
      onClick={() => {
        setCommandPaletteOpen(true);
      }}
      className={cn(
        'border-border bg-muted/40 text-muted-foreground hover:bg-accent hover:text-accent-foreground inline-flex h-8 items-center gap-2 rounded-md border px-2.5 text-xs transition-[width,max-width] duration-200',
        sidebarCollapsed ? 'w-56 max-w-[14rem]' : 'w-40 max-w-[10rem]',
      )}
    >
      <Search className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span className="truncate">{sidebarCollapsed ? 'Search workspace' : 'Search'}</span>
    </button>
  );
}
