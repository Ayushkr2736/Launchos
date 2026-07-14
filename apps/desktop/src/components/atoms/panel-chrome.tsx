import { cn } from '@launchos/ui';

import type { HTMLAttributes, ReactNode } from 'react';

interface PanelChromeProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export function PanelChrome({ children, className, ...props }: PanelChromeProps) {
  return (
    <div
      className={cn(
        'border-border bg-background flex h-full min-h-0 min-w-0 flex-col overflow-hidden',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
