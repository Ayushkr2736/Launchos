import { useContext } from 'react';

import type { FileSystemProvider } from '@/features/explorer/fs/types';

import { FileSystemContext } from '@/features/explorer/fs/file-system-context';

export function useFileSystem(): FileSystemProvider {
  return useContext(FileSystemContext);
}
