import { GitBranch } from 'lucide-react';

import { ShellSlot } from '@/components/organisms/shell-slot';

export function BranchIndicator() {
  return (
    <ShellSlot
      slot="titlebar.branch"
      fallback={
        <div className="text-muted-foreground inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs">
          <GitBranch className="h-3.5 w-3.5" aria-hidden />
          <span>No branch</span>
        </div>
      }
    />
  );
}
