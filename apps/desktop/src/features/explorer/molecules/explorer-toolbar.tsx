import { ChevronsDownUp, FilePlus, FolderOpen, FolderPlus, FolderX } from 'lucide-react';

import { IconButton } from '@/components/atoms/icon-button';
import { getFsParentPath } from '@/features/explorer/fs/path';
import { useFileSystem } from '@/features/explorer/fs/use-file-system';
import { useExplorerActions } from '@/features/explorer/hooks/use-explorer-actions';
import { useExplorerStore } from '@/stores/explorer-store';

export function ExplorerToolbar() {
  const fs = useFileSystem();
  const selectedPath = useExplorerStore((state) => state.selectedPath);
  const actions = useExplorerActions();

  const createParent =
    selectedPath && fs.getNode(selectedPath)?.kind === 'folder'
      ? selectedPath
      : (selectedPath && getFsParentPath(selectedPath)) || fs.getRootPath();

  return (
    <div className="flex items-center gap-0.5">
      <IconButton
        size="sm"
        aria-label="New file"
        title="New File"
        onClick={() => {
          actions.startCreate(createParent, 'file');
        }}
      >
        <FilePlus className="h-3.5 w-3.5" />
      </IconButton>
      <IconButton
        size="sm"
        aria-label="New folder"
        title="New Folder"
        onClick={() => {
          actions.startCreate(createParent, 'folder');
        }}
      >
        <FolderPlus className="h-3.5 w-3.5" />
      </IconButton>
      <IconButton
        size="sm"
        aria-label="Collapse folders in explorer"
        title="Collapse Folders in Explorer"
        onClick={() => {
          actions.collapseAll();
        }}
      >
        <ChevronsDownUp className="h-3.5 w-3.5" />
      </IconButton>
      <IconButton
        size="sm"
        aria-label="Open folder"
        title="Open Folder"
        onClick={() => {
          void actions.openProjectFolder();
        }}
      >
        <FolderOpen className="h-3.5 w-3.5" />
      </IconButton>
      <IconButton
        size="sm"
        aria-label="Close folder"
        title="Close Folder"
        onClick={() => {
          actions.closeProjectFolder();
        }}
      >
        <FolderX className="h-3.5 w-3.5" />
      </IconButton>
    </div>
  );
}
