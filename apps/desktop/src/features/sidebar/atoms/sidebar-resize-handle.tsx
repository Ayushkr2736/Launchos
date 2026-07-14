import { cn } from '@launchos/ui';

import { useSidebarResize } from '@/features/sidebar/hooks/use-sidebar-resize';

interface SidebarResizeHandleProps {
  enabled: boolean;
}

export function SidebarResizeHandle({ enabled }: SidebarResizeHandleProps) {
  const handlers = useSidebarResize(enabled);

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize sidebar"
      aria-disabled={!enabled}
      tabIndex={enabled ? 0 : -1}
      className={cn(
        'absolute inset-y-0 -right-1 z-30 w-2 cursor-col-resize touch-none',
        'bg-transparent transition-colors',
        'hover:bg-ring/40 focus-visible:bg-ring/50 focus-visible:outline-none',
        'data-[dragging=true]:bg-ring',
        !enabled && 'pointer-events-none opacity-0',
      )}
      onPointerDown={(event) => {
        event.currentTarget.dataset['dragging'] = 'true';
        handlers.onPointerDown(event);
      }}
      onPointerMove={handlers.onPointerMove}
      onPointerUp={(event) => {
        delete event.currentTarget.dataset['dragging'];
        handlers.onPointerUp(event);
      }}
      onPointerCancel={(event) => {
        delete event.currentTarget.dataset['dragging'];
        handlers.onPointerCancel(event);
      }}
      onKeyDown={(event) => {
        if (!enabled) {
          return;
        }
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          handlers.nudge(-8);
        }
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          handlers.nudge(8);
        }
      }}
    />
  );
}
