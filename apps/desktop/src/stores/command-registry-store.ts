import { create } from 'zustand';

import type {
  CommandPaletteItem,
  CommandPaletteRegistration,
} from '@/features/command-palette/types';

interface CommandRegistryState {
  registrations: Record<string, CommandPaletteRegistration>;
  register: (registration: CommandPaletteRegistration) => void;
  unregister: (id: string) => void;
  getRegisteredItems: () => CommandPaletteItem[];
}

/**
 * Feature modules can register extra palette commands without editing the core hook.
 * Example: `useCommandRegistry.getState().register({ id: 'my-feature', items: [...] })`
 */
export const useCommandRegistry = create<CommandRegistryState>((set, get) => ({
  registrations: {},
  register: (registration) => {
    set({
      registrations: {
        ...get().registrations,
        [registration.id]: registration,
      },
    });
  },
  unregister: (id) => {
    const next = { ...get().registrations };
    delete next[id];
    set({ registrations: next });
  },
  getRegisteredItems: () => {
    return Object.values(get().registrations).flatMap((entry) => [...entry.items]);
  },
}));
