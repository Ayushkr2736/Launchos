import { useEffect } from 'react';

import { useGitStore } from '@/stores/git-store';
import { useProjectStore } from '@/stores/project-store';
import { detectTauriRuntime } from '@/window/native';

const POLL_MS = 8_000;

/** Refresh git status when workspace changes and on a light poll while mounted. */
export function useGitStatusSync(): void {
  const workspacePath = useProjectStore((state) => state.workspacePath);
  const refresh = useGitStore((state) => state.refresh);

  useEffect(() => {
    if (!detectTauriRuntime()) {
      return;
    }
    void refresh(workspacePath);
  }, [refresh, workspacePath]);

  useEffect(() => {
    if (!detectTauriRuntime() || !workspacePath) {
      return;
    }
    const timer = window.setInterval(() => {
      void refresh(workspacePath);
    }, POLL_MS);
    return () => {
      window.clearInterval(timer);
    };
  }, [refresh, workspacePath]);
}
