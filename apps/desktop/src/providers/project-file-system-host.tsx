import { useMemo, type ReactNode } from 'react';

import { FileSystemProviderHost } from '@/features/explorer/fs/fs-context';
import { mockFileSystem } from '@/features/explorer/fs/mock-fs';
import { createNativeFileSystemProvider } from '@/features/explorer/fs/native-fs-provider';
import { fileSystemService } from '@/services/filesystem';
import { useProjectStore } from '@/stores/project-store';

interface ProjectFileSystemHostProps {
  children: ReactNode;
}

/**
 * Shared FS provider for Explorer + Workspace editors.
 * Uses the native adapter when a workspace folder is open.
 */
export function ProjectFileSystemHost({ children }: ProjectFileSystemHostProps) {
  const workspacePath = useProjectStore((state) => state.workspacePath);

  const provider = useMemo(() => {
    if (!workspacePath) {
      return mockFileSystem;
    }
    return createNativeFileSystemProvider({
      rootPath: workspacePath,
      service: fileSystemService,
    });
  }, [workspacePath]);

  return (
    <div className="h-full min-h-0 w-full min-w-0">
      <FileSystemProviderHost provider={provider}>{children}</FileSystemProviderHost>
    </div>
  );
}
