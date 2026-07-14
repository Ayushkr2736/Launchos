import { cn } from '@launchos/ui';

import type { CSSProperties, ReactNode } from 'react';

interface LayoutRegionProps {
  id: string;
  label: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * Do not default to h-full — that makes the title-bar region consume the entire
 * shell height and collapses the workbench to 0px (black screen under the chrome).
 */
export function LayoutRegion({ id, label, children, className, style }: LayoutRegionProps) {
  return (
    <section
      id={id}
      aria-label={label}
      data-layout-region={id}
      style={style}
      className={cn('layout-region flex min-h-0 flex-col overflow-hidden', className)}
    >
      {children}
    </section>
  );
}
