import { cn } from '@launchos/ui';

import type { MouseEvent, ReactNode } from 'react';

import { useWindowManager } from '@/hooks/use-window-manager';

interface WindowDragRegionProps {
  children?: ReactNode;
  className?: string;
  enableDoubleClickMaximize?: boolean;
}

function isInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return Boolean(
    target.closest(
      'button, a, input, textarea, select, [role="button"], [data-window-no-drag], [data-radix-collection-item]',
    ),
  );
}

export function WindowDragRegion({
  children,
  className,
  enableDoubleClickMaximize = true,
}: WindowDragRegionProps) {
  const { isTauri, toggleMaximize } = useWindowManager();

  const onDoubleClick = (event: MouseEvent<HTMLElement>) => {
    if (!enableDoubleClickMaximize || !isTauri || isInteractiveTarget(event.target)) {
      return;
    }
    event.preventDefault();
    void toggleMaximize();
  };

  return (
    <div
      data-tauri-drag-region
      className={cn('window-drag-region', className)}
      onDoubleClick={onDoubleClick}
    >
      {children}
    </div>
  );
}
