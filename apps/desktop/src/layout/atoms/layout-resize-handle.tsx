import { cn } from '@launchos/ui';
import { Separator } from 'react-resizable-panels';

interface LayoutResizeHandleProps {
  className?: string | undefined;
  /** Vertical = between side panels; horizontal = above bottom panel. */
  orientation?: 'vertical' | 'horizontal';
}

/**
 * Draggable splitter between workbench panels.
 * Visual line stays thin; hit target is expanded via Group.resizeTargetMinimumSize.
 */
export function LayoutResizeHandle({
  className,
  orientation = 'vertical',
}: LayoutResizeHandleProps) {
  const isVertical = orientation === 'vertical';

  return (
    <Separator
      className={cn(
        'layout-resize-handle relative z-30 shrink-0 outline-none',
        'bg-border/80',
        // Library sets data-separator to inactive | hover | active | focus | disabled
        'data-[separator=hover]:bg-ring data-[separator=active]:bg-ring data-[separator=focus]:bg-ring/70',
        isVertical ? 'h-full w-px cursor-col-resize' : 'h-px w-full cursor-row-resize',
        className,
      )}
    />
  );
}
