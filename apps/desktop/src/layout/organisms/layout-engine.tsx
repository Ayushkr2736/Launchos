import type { LayoutEngineSlots } from '@/layout/types';
import type { CSSProperties } from 'react';

import { LayoutRegion } from '@/layout/atoms/layout-region';
import { useLayoutEngine } from '@/layout/hooks/use-layout-engine';
import { LayoutWorkbench } from '@/layout/organisms/layout-workbench';
import { useLayoutStore } from '@/stores/layout-store';
import { WindowResizeHandles } from '@/window';

interface LayoutEngineProps {
  slots: LayoutEngineSlots;
  className?: string;
}

/**
 * Reusable IDE chrome layout. Slots are presentational only —
 * no domain/business logic lives here.
 */
export function LayoutEngine({ slots, className }: LayoutEngineProps) {
  const state = useLayoutEngine();
  const sidebarWidth = useLayoutStore((s) => s.sidebarWidth);
  const sidebarCollapsed = useLayoutStore((s) => s.sidebarCollapsed);

  const rootStyle = {
    ['--shell-sidebar-width']: `${sidebarWidth}px`,
    ['--layout-sidebar-width']: `${sidebarWidth}px`,
  } as CSSProperties;

  return (
    <div
      className={
        className ??
        'layout-root shell-root bg-background text-foreground flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden'
      }
      data-layout-engine
      data-layout-breakpoint={state.breakpoint}
      data-sidebar-collapsed={sidebarCollapsed ? 'true' : 'false'}
      style={rootStyle}
    >
      <WindowResizeHandles />

      <LayoutRegion id="layout-title-bar" label="Title Bar" className="shrink-0">
        {slots.titleBar}
      </LayoutRegion>

      <div className="flex min-h-0 w-full min-w-0 flex-1 overflow-hidden">
        <LayoutRegion
          id="layout-sidebar"
          label="Sidebar"
          className="h-full shrink-0 grow-0 overflow-hidden"
          style={{
            width: sidebarWidth,
            minWidth: sidebarWidth,
            maxWidth: sidebarWidth,
            flexBasis: sidebarWidth,
            transition:
              'width 200ms cubic-bezier(0.22, 1, 0.36, 1), min-width 200ms cubic-bezier(0.22, 1, 0.36, 1), max-width 200ms cubic-bezier(0.22, 1, 0.36, 1), flex-basis 200ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {slots.sidebar}
        </LayoutRegion>
        <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
          <LayoutWorkbench
            slots={{
              explorer: slots.explorer,
              workspace: slots.workspace,
              aiPanel: slots.aiPanel,
              bottomPanel: slots.bottomPanel,
            }}
            state={state}
          />
        </div>
      </div>

      {slots.statusBar ? (
        <LayoutRegion id="layout-status-bar" label="Status Bar" className="shrink-0">
          {slots.statusBar}
        </LayoutRegion>
      ) : null}

      {slots.overlay}
    </div>
  );
}
