import { useState } from 'react';

import type { FsPath } from '@/features/explorer/fs/types';

import { ExplorerInlineInput } from '@/features/explorer/atoms/explorer-inline-input';
import { isValidFsName } from '@/features/explorer/fs/path';
import { suggestNewFileName, suggestNewFolderName } from '@/features/explorer/fs/seed';
import { useFileSystem } from '@/features/explorer/fs/use-file-system';
import { useExplorerActions } from '@/features/explorer/hooks/use-explorer-actions';
import { useExplorerStore } from '@/stores/explorer-store';

interface ExplorerCreateRowProps {
  parentPath: FsPath;
  createKind: 'file' | 'folder';
  depth: number;
}

export function ExplorerCreateRow({ parentPath, createKind, depth }: ExplorerCreateRowProps) {
  const fs = useFileSystem();
  const cancelCreate = useExplorerStore((state) => state.cancelCreate);
  const actions = useExplorerActions();
  const [error, setError] = useState<string | null>(null);

  const siblings = fs.listChildren(parentPath).map((child) => child.name);
  const initialValue =
    createKind === 'file'
      ? suggestNewFileName(parentPath, siblings)
      : suggestNewFolderName(parentPath, siblings);

  return (
    <ExplorerInlineInput
      initialValue={initialValue}
      depth={depth}
      errorMessage={error}
      ariaLabel={createKind === 'file' ? 'New file name' : 'New folder name'}
      onCancel={cancelCreate}
      onSubmit={(value) => {
        const name = value.trim();
        if (!name) {
          cancelCreate();
          return;
        }
        if (!isValidFsName(name)) {
          setError('Invalid name');
          return false;
        }
        if (siblings.some((sibling) => sibling.toLowerCase() === name.toLowerCase())) {
          setError('A file or folder with this name already exists');
          return false;
        }
        setError(null);
        actions.safeRun(() => {
          if (createKind === 'file') {
            return actions.createFile(parentPath, name);
          }
          return actions.createFolder(parentPath, name);
        });
        return true;
      }}
    />
  );
}
