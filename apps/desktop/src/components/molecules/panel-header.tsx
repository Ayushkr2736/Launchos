import { cn } from '@launchos/ui';

import type { ReactNode } from 'react';

interface PanelHeaderProps {
  title: string;
  className?: string;
  actions?: ReactNode;
}

export function PanelHeader({ title, className, actions }: PanelHeaderProps) {
  return (
    <header
      className={cn(
        'border-border flex h-9 shrink-0 items-center justify-between gap-2 border-b px-3',
        className,
      )}
    >
      <h2 className="text-foreground truncate text-xs font-semibold tracking-wide">{title}</h2>
      {actions ? <div className="flex items-center gap-1">{actions}</div> : null}
    </header>
  );
}
