import type { BottomPanelTabId } from '@/types/shell';

import { EmptyState } from '@/components/molecules/empty-state';
import { ShellSlot } from '@/components/organisms/shell-slot';
import {
  BOTTOM_PANEL_TAB_CONFIG,
  getBottomPanelTabConfig,
} from '@/features/bottom-panel/constants';

interface BottomPanelBodyProps {
  tab: BottomPanelTabId;
}

/**
 * Keeps every bottom-panel tab mounted (hidden when inactive) so hosts like
 * the terminal can preserve PTY sessions and scrollback across tab switches.
 */
export function BottomPanelBody({ tab }: BottomPanelBodyProps) {
  return (
    <div className="relative h-full min-h-0">
      {BOTTOM_PANEL_TAB_CONFIG.map((config) => {
        const active = tab === config.id;
        const Icon = config.icon;
        return (
          <div
            key={config.id}
            role="tabpanel"
            id={`bottom-panel-panel-${config.id}`}
            aria-labelledby={`bottom-panel-tab-${config.id}`}
            aria-hidden={!active}
            className={active ? 'absolute inset-0 z-10' : 'invisible absolute inset-0 z-0'}
          >
            <ShellSlot
              slot={config.slot}
              fallback={
                <EmptyState
                  icon={Icon}
                  title={getBottomPanelTabConfig(config.id).emptyTitle}
                  description={getBottomPanelTabConfig(config.id).emptyDescription}
                  className="bg-panel min-h-[10rem]"
                />
              }
            />
          </div>
        );
      })}
    </div>
  );
}
