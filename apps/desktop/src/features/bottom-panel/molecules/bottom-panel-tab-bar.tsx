import { LayoutGroup } from 'framer-motion';
import { ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';

import { IconButton } from '@/components/atoms/icon-button';
import { BottomPanelTabButton } from '@/features/bottom-panel/atoms/bottom-panel-tab-button';
import { BOTTOM_PANEL_TAB_CONFIG } from '@/features/bottom-panel/constants';
import { BOTTOM_PANEL_SIZE } from '@/layout/constants';
import { useLayoutStore } from '@/stores/layout-store';

export function BottomPanelTabBar() {
  const collapsed = useLayoutStore((state) => state.bottomPanelCollapsed);
  const activeTab = useLayoutStore((state) => state.bottomPanelTab);
  const bottomPanelHeight = useLayoutStore((state) => state.bottomPanelHeight);
  const setBottomPanelTab = useLayoutStore((state) => state.setBottomPanelTab);
  const toggleBottomPanelCollapsed = useLayoutStore((state) => state.toggleBottomPanelCollapsed);
  const setBottomPanelHeight = useLayoutStore((state) => state.setBottomPanelHeight);

  const maximized = !collapsed && bottomPanelHeight >= BOTTOM_PANEL_SIZE.max - 8;

  return (
    <div className="bottom-panel-tabbar border-border bg-panel flex h-9 shrink-0 items-center gap-1 border-b px-2">
      <LayoutGroup id="bottom-panel-tabs">
        <div
          className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto"
          role="tablist"
          aria-label="Bottom panel"
        >
          {BOTTOM_PANEL_TAB_CONFIG.map((tab) => (
            <BottomPanelTabButton
              key={tab.id}
              tab={tab}
              active={activeTab === tab.id}
              onSelect={() => {
                setBottomPanelTab(tab.id);
              }}
            />
          ))}
        </div>
      </LayoutGroup>

      <div className="flex shrink-0 items-center gap-0.5">
        <IconButton
          size="sm"
          aria-label={maximized ? 'Restore bottom panel height' : 'Maximize bottom panel'}
          disabled={collapsed}
          onClick={() => {
            setBottomPanelHeight(maximized ? BOTTOM_PANEL_SIZE.default : BOTTOM_PANEL_SIZE.max);
          }}
        >
          {maximized ? (
            <Minimize2 className="h-3.5 w-3.5" />
          ) : (
            <Maximize2 className="h-3.5 w-3.5" />
          )}
        </IconButton>
        <IconButton
          size="sm"
          aria-label={collapsed ? 'Expand bottom panel' : 'Collapse bottom panel'}
          aria-expanded={!collapsed}
          onClick={toggleBottomPanelCollapsed}
        >
          {collapsed ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </IconButton>
      </div>
    </div>
  );
}
