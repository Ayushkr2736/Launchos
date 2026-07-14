import type { Ref } from 'react';

import { SearchField } from '@/components/molecules/search-field';
import { useSidebarStore } from '@/stores/sidebar-store';

interface SidebarSearchProps {
  inputRef?: Ref<HTMLInputElement>;
}

export function SidebarSearch({ inputRef }: SidebarSearchProps) {
  const searchQuery = useSidebarStore((state) => state.searchQuery);
  const setSearchQuery = useSidebarStore((state) => state.setSearchQuery);
  const clearSearch = useSidebarStore((state) => state.clearSearch);

  return (
    <div className="border-sidebar-border border-b px-2 py-2">
      <SearchField
        ref={inputRef}
        value={searchQuery}
        onChange={(event) => {
          setSearchQuery(event.target.value);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault();
            clearSearch();
            (event.target as HTMLInputElement).blur();
          }
        }}
        placeholder="Search sidebar…"
        aria-label="Search sidebar"
        className="border-sidebar-border bg-sidebar-accent/40 text-sidebar-foreground placeholder:text-sidebar-foreground/45"
      />
    </div>
  );
}
