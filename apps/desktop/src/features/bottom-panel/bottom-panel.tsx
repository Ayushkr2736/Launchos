import { PanelChrome } from '@/components/atoms/panel-chrome';
import { useBottomPanelShortcuts } from '@/features/bottom-panel/hooks/use-bottom-panel-shortcuts';
import { BottomPanelBody } from '@/features/bottom-panel/molecules/bottom-panel-body';
import { BottomPanelTabBar } from '@/features/bottom-panel/molecules/bottom-panel-tab-bar';
import { useLayoutStore } from '@/stores/layout-store';

export function BottomPanel() {
  useBottomPanelShortcuts();

  const collapsed = useLayoutStore((state) => state.bottomPanelCollapsed);
  const bottomPanelTab = useLayoutStore((state) => state.bottomPanelTab);

  return (
    <PanelChrome
      className="bottom-panel border-border bg-panel text-panel-foreground h-full border-t"
      data-collapsed={collapsed ? 'true' : 'false'}
    >
      <BottomPanelTabBar />
      {/* Keep body mounted when collapsed so PTY sessions and scrollback survive. */}
      <div
        className={collapsed ? 'hidden' : 'min-h-0 flex-1 overflow-hidden'}
        aria-hidden={collapsed}
      >
        <BottomPanelBody tab={bottomPanelTab} />
      </div>
    </PanelChrome>
  );
}
