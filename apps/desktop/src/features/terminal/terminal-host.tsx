import { useEffect } from 'react';

import { TerminalPanel } from '@/features/terminal/terminal-panel';
import { useShellRegistry } from '@/stores/shell-registry';

/** Registers the interactive terminal on `bottom.terminal`. */
export function TerminalHost() {
  const register = useShellRegistry((state) => state.register);
  const unregister = useShellRegistry((state) => state.unregister);

  useEffect(() => {
    register({
      id: 'terminal-host',
      slot: 'bottom.terminal',
      render: () => <TerminalPanel />,
    });
    return () => {
      unregister('terminal-host');
    };
  }, [register, unregister]);

  return null;
}
