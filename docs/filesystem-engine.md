# File System Engine

Production Tauri filesystem module for LaunchOS (`apps/desktop/src/modules/filesystem`).

## Public API

```ts
import {
  fileSystemService,
  useFileSystemEngine,
  useFilesystemStore,
  FilesystemStore,
} from '@/modules/filesystem';

// Imperative (stores / commands)
await fileSystemService.openFolder();
await fileSystemService.openFile();
await fileSystemService.saveAs(content);
await fileSystemService.copy(src, dest);
await fileSystemService.watch(path, (event) => {
  /* … */
});

// React
const fs = useFileSystemEngine();
await fs.openFolder();
```

## Operations

| Operation            | API                                       |
| -------------------- | ----------------------------------------- |
| Open Folder          | `openFolder` / store `openFolder`         |
| Open File            | `openFile`                                |
| Save File            | `saveFile` / `writeFile`                  |
| Save As              | `saveAs`                                  |
| Rename               | `rename`                                  |
| Delete               | `delete`                                  |
| Move                 | `move`                                    |
| Copy                 | `copy` (files + recursive folders)        |
| Create Folder        | `createFolder`                            |
| Create File          | `createFile`                              |
| Watch                | `watch` / store `watchWorkspace`          |
| Persistent Workspace | `useFilesystemStore` (`launchos.project`) |

## Layout

```text
modules/filesystem/
  types/       Contracts
  services/    Tauri impl, path helpers, errors, factory
  stores/      Workspace persistence + watchers
  hooks/       useFileSystemEngine, useWorkspaceFolder, useFileWatcher
  index.ts
```

## Errors

All failures are typed as `FileSystemServiceError` with codes:
`NOT_FOUND`, `ALREADY_EXISTS`, `PERMISSION_DENIED`, `UNSUPPORTED`, `WATCH_ERROR`, …

## Compatibility

- `@/services/filesystem` re-exports this module
- `useProjectStore` → `useFilesystemStore` shim (same storage key)
