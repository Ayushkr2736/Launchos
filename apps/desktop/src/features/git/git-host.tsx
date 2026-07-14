import { useEffect } from 'react';

import { GitPanel } from '@/features/git/git-panel';
import { useGitShortcut } from '@/features/git/hooks/use-git-shortcut';
import { useGitStatusSync } from '@/features/git/hooks/use-git-status-sync';
import { GitBranchBadge } from '@/features/git/molecules/git-branch-badge';
import { useShellRegistry } from '@/stores/shell-registry';

/** Registers Source Control on `bottom.git` and branch badge on `titlebar.branch`. */
export function GitHost() {
  useGitStatusSync();
  useGitShortcut();

  const register = useShellRegistry((state) => state.register);
  const unregister = useShellRegistry((state) => state.unregister);

  useEffect(() => {
    register({
      id: 'git-panel-host',
      slot: 'bottom.git',
      render: () => <GitPanel />,
    });
    register({
      id: 'git-branch-host',
      slot: 'titlebar.branch',
      render: () => <GitBranchBadge />,
    });
    return () => {
      unregister('git-panel-host');
      unregister('git-branch-host');
    };
  }, [register, unregister]);

  return null;
}
