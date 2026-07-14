import { createContext } from 'react';

import type { FileSystemProvider } from '@/features/explorer/fs/types';

import { mockFileSystem } from '@/features/explorer/fs/mock-fs';

export const FileSystemContext = createContext<FileSystemProvider>(mockFileSystem);
