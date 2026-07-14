import type { ShellSlotId } from '@/types/shell';
import type { ReactNode } from 'react';

import { useShellRegistry } from '@/stores/shell-registry';

interface ShellSlotProps {
  slot: ShellSlotId;
  fallback: ReactNode;
}

export function ShellSlot({ slot, fallback }: ShellSlotProps) {
  const registration = useShellRegistry((state) => state.slots[slot]);
  if (registration) {
    return <>{registration.render()}</>;
  }
  return <>{fallback}</>;
}
