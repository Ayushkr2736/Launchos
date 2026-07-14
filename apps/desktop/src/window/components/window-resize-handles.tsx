import { cn } from '@launchos/ui';

import type { WindowResizeEdge } from '@/window/types';

import { useWindowManager } from '@/hooks/use-window-manager';

const EDGE_CLASS: Record<WindowResizeEdge, string> = {
  North: 'window-resize-edge window-resize-edge-n',
  South: 'window-resize-edge window-resize-edge-s',
  East: 'window-resize-edge window-resize-edge-e',
  West: 'window-resize-edge window-resize-edge-w',
  NorthEast: 'window-resize-edge window-resize-edge-ne',
  NorthWest: 'window-resize-edge window-resize-edge-nw',
  SouthEast: 'window-resize-edge window-resize-edge-se',
  SouthWest: 'window-resize-edge window-resize-edge-sw',
};

const EDGES: readonly WindowResizeEdge[] = [
  'North',
  'South',
  'East',
  'West',
  'NorthEast',
  'NorthWest',
  'SouthEast',
  'SouthWest',
];

export function WindowResizeHandles() {
  const { isTauri, isMaximized, startResizing } = useWindowManager();

  if (!isTauri || isMaximized) {
    return null;
  }

  return (
    <div className="window-resize-layer" aria-hidden>
      {EDGES.map((edge) => (
        <div
          key={edge}
          data-window-no-drag
          className={cn(EDGE_CLASS[edge])}
          onMouseDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void startResizing(edge);
          }}
        />
      ))}
    </div>
  );
}
