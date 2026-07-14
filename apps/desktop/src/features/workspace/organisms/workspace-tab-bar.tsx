import { ScrollArea } from '@launchos/ui';
import { AnimatePresence } from 'framer-motion';
import { useCallback, type KeyboardEvent } from 'react';

import { WorkspaceTabItem } from '@/features/workspace/molecules/workspace-tab-item';
import { WorkspaceToolbar } from '@/features/workspace/molecules/workspace-toolbar';
import { useWorkspaceStore } from '@/stores/workspace-store';

export function WorkspaceTabBar() {
  const tabs = useWorkspaceStore((state) => state.tabs);
  const activeTabId = useWorkspaceStore((state) => state.activeTabId);
  const setActiveTab = useWorkspaceStore((state) => state.setActiveTab);
  const cycleTab = useWorkspaceStore((state) => state.cycleTab);

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        cycleTab(1);
        return;
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        cycleTab(-1);
        return;
      }
      if (event.key === 'Home') {
        event.preventDefault();
        const first = tabs[0];
        if (first) {
          setActiveTab(first.id);
        }
        return;
      }
      if (event.key === 'End') {
        event.preventDefault();
        const last = tabs[tabs.length - 1];
        if (last) {
          setActiveTab(last.id);
        }
      }
    },
    [cycleTab, setActiveTab, tabs],
  );

  return (
    <div className="border-border bg-muted/20 flex shrink-0 items-stretch border-b">
      <div className="min-w-0 flex-1">
        {tabs.length === 0 ? (
          <div className="h-8" aria-hidden />
        ) : (
          <ScrollArea className="w-full">
            <div
              className="flex min-w-full items-stretch outline-none"
              role="tablist"
              aria-label="Open editors"
              aria-orientation="horizontal"
              tabIndex={0}
              onKeyDown={onKeyDown}
            >
              <AnimatePresence initial={false} mode="popLayout">
                {tabs.map((tab, index) => (
                  <WorkspaceTabItem
                    key={tab.id}
                    tab={tab}
                    index={index}
                    active={tab.id === activeTabId}
                  />
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>
        )}
      </div>
      <WorkspaceToolbar />
    </div>
  );
}
