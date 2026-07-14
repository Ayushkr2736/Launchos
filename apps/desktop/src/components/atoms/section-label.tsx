import { cn } from '@launchos/ui';

import type { ReactNode } from 'react';

interface SectionLabelProps {
  children: ReactNode;
  className?: string;
}

export function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <div
      className={cn(
        'text-muted-foreground px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em]',
        className,
      )}
    >
      {children}
    </div>
  );
}
