import { cn } from '../lib/utils.js';

import type { HTMLAttributes } from 'react';

export function Kbd({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      className={cn(
        'bg-muted text-muted-foreground pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium',
        className,
      )}
      {...props}
    />
  );
}
