import { create } from 'zustand';

import type { ShellSlotId } from '@/types/shell';
import type { ReactNode } from 'react';

export interface ShellSlotRegistration {
  readonly id: string;
  readonly slot: ShellSlotId;
  readonly render: () => ReactNode;
}

interface ShellRegistryState {
  slots: Partial<Record<ShellSlotId, ShellSlotRegistration>>;
  register: (registration: ShellSlotRegistration) => void;
  unregister: (id: string) => void;
  getSlot: (slot: ShellSlotId) => ShellSlotRegistration | undefined;
}

export const useShellRegistry = create<ShellRegistryState>((set, get) => ({
  slots: {},
  register: (registration) => {
    set({
      slots: {
        ...get().slots,
        [registration.slot]: registration,
      },
    });
  },
  unregister: (id) => {
    const next = { ...get().slots };
    for (const [slot, registration] of Object.entries(next)) {
      if (registration?.id === id) {
        delete next[slot as ShellSlotId];
      }
    }
    set({ slots: next });
  },
  getSlot: (slot) => get().slots[slot],
}));
