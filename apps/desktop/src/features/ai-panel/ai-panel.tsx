import { cn } from '@launchos/ui';
import { PanelRightClose } from 'lucide-react';

import type { AiPanelTabId } from '@/types/shell';

import { IconButton } from '@/components/atoms/icon-button';
import { PanelChrome } from '@/components/atoms/panel-chrome';
import { PanelHeader } from '@/components/molecules/panel-header';
import { AI_PANEL_TABS } from '@/constants/shell';
import { AiRegion } from '@/features/ai-panel/regions/ai-region';
import { useLayoutStore } from '@/stores/layout-store';

export function AiPanel() {
  const aiPanelTab = useLayoutStore((state) => state.aiPanelTab);
  const setAiPanelTab = useLayoutStore((state) => state.setAiPanelTab);
  const setAiPanelVisible = useLayoutStore((state) => state.setAiPanelVisible);

  return (
    <PanelChrome className="border-l">
      <PanelHeader
        title="AI"
        actions={
          <IconButton
            size="sm"
            aria-label="Hide AI panel"
            onClick={() => {
              setAiPanelVisible(false);
            }}
          >
            <PanelRightClose className="h-3.5 w-3.5" />
          </IconButton>
        }
      />
      <div className="border-border flex h-9 shrink-0 items-center gap-1 overflow-x-auto border-b px-2">
        {AI_PANEL_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setAiPanelTab(tab.id);
            }}
            className={cn(
              'rounded-md px-2.5 py-1 text-xs transition-colors',
              aiPanelTab === tab.id
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-accent/70 hover:text-accent-foreground',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1">
        <AiRegion tab={aiPanelTab as AiPanelTabId} />
      </div>
    </PanelChrome>
  );
}
