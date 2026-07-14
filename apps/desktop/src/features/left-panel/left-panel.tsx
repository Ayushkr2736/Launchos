import { cn } from '@launchos/ui';
import { Files, PanelLeftClose, Search } from 'lucide-react';

import type { LeftPanelTabId } from '@/types/shell';

import { IconButton } from '@/components/atoms/icon-button';
import { PanelChrome } from '@/components/atoms/panel-chrome';
import { Explorer } from '@/features/explorer';
import { SearchPanel } from '@/features/search';
import { useLayoutStore } from '@/stores/layout-store';

const LEFT_TABS: Array<{ id: LeftPanelTabId; label: string; icon: typeof Files }> = [
  { id: 'explorer', label: 'Explorer', icon: Files },
  { id: 'search', label: 'Search', icon: Search },
];

/**
 * Left workbench panel — Explorer and global Search share the explorer slot.
 * Clicking the active tab collapses the panel (open ↔ closed).
 */
export function LeftPanel() {
  const leftPanelTab = useLayoutStore((state) => state.leftPanelTab);
  const setLeftPanelTab = useLayoutStore((state) => state.setLeftPanelTab);
  const collapseExplorer = useLayoutStore((state) => state.collapseExplorer);

  return (
    <PanelChrome className="border-r">
      <div
        role="tablist"
        aria-label="Left panel views"
        className="border-border flex h-9 shrink-0 items-center gap-0.5 border-b px-1.5"
      >
        <div className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto">
          {LEFT_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = leftPanelTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                title={active ? `Collapse ${tab.label}` : `Open ${tab.label}`}
                className={cn(
                  'inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs transition-colors',
                  active
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent/60 hover:text-accent-foreground',
                )}
                onClick={() => {
                  if (active) {
                    collapseExplorer();
                    return;
                  }
                  setLeftPanelTab(tab.id);
                }}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden />
                {tab.label}
              </button>
            );
          })}
        </div>
        <IconButton
          size="sm"
          aria-label="Collapse left panel"
          title="Collapse left panel"
          onClick={() => {
            collapseExplorer();
          }}
        >
          <PanelLeftClose className="h-3.5 w-3.5" aria-hidden />
        </IconButton>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        {leftPanelTab === 'explorer' ? <Explorer /> : <SearchPanel />}
      </div>
    </PanelChrome>
  );
}
