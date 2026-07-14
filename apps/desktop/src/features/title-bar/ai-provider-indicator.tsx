import { Sparkles } from 'lucide-react';

import { ShellSlot } from '@/components/organisms/shell-slot';

export function AiProviderIndicator() {
  return (
    <ShellSlot
      slot="titlebar.ai-provider"
      fallback={
        <div className="text-muted-foreground inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs">
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          <span>No provider</span>
        </div>
      }
    />
  );
}
