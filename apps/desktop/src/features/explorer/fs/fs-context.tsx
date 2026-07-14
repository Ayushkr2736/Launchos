import { useMemo, type ReactNode } from 'react';

import type { FileSystemProvider } from '@/features/explorer/fs/types';

import { FileSystemContext } from '@/features/explorer/fs/file-system-context';
import { mockFileSystem } from '@/features/explorer/fs/mock-fs';
import { useFileSystemRevision } from '@/features/explorer/fs/use-file-system-revision';

interface FileSystemProviderHostProps {
  children: ReactNode;
  /** Inject a real FS adapter later without changing Explorer UI. */
  provider?: FileSystemProvider;
}

export function FileSystemProviderHost({
  children,
  provider = mockFileSystem,
}: FileSystemProviderHostProps) {
  useFileSystemRevision(provider);
  const value = useMemo(() => provider, [provider]);
  return <FileSystemContext.Provider value={value}>{children}</FileSystemContext.Provider>;
}
