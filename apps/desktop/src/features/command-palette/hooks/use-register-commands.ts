import { useEffect, useMemo } from 'react';

import type { CommandPaletteItem } from '@/features/command-palette/types';

import { useCommandRegistry } from '@/stores/command-registry-store';

/**
 * Register command packs from any feature. Unregisters on unmount.
 * Pass a memoized array or a stable factory for best results.
 */
export function useRegisterCommands(
  id: string,
  items: readonly CommandPaletteItem[] | (() => readonly CommandPaletteItem[]),
): void {
  const register = useCommandRegistry((state) => state.register);
  const unregister = useCommandRegistry((state) => state.unregister);

  const resolved = useMemo(() => (typeof items === 'function' ? items() : items), [items]);

  useEffect(() => {
    register({ id, items: resolved });
    return () => {
      unregister(id);
    };
  }, [id, register, resolved, unregister]);
}
