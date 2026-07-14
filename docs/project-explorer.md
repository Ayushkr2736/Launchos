# Project Explorer

VS Code–style file tree over the native [File System Service](./filesystem-service.md).

## Features

| Feature                  | Notes                                              |
| ------------------------ | -------------------------------------------------- |
| Open folder              | Native dialog via `FileSystemService.openFolder`   |
| Tree view                | Virtual `/` paths mapped to the project root       |
| Expand / collapse        | Persisted per project root                         |
| Search                   | Indexes the tree (skips `node_modules`, `.git`, …) |
| Context menu             | Open, New File/Folder, Rename, Delete              |
| Drag & drop              | Move nodes onto folders                            |
| Rename / delete / create | Async mutations through `FileSystemService`        |
| Icons                    | Extension-aware Lucide icons; open/closed folders  |
| Selection                | Keyboard ↑↓←→ Enter Delete / F2                    |

## Architecture

```text
stores/project-store.ts          Opened native root path
features/explorer/
  fs/
    types.ts                     FileSystemProvider contract (cache + async mutations)
    native-fs-provider.ts        Adapter → FileSystemService
    mock-fs.ts                   In-memory provider (tests / fallback)
    path.ts                      Virtual path helpers
  hooks/
    use-explorer-actions.ts
    use-explorer-folder-loader.ts
    use-explorer-visible-nodes.ts
  molecules/ organisms/ atoms/
```

### Data flow

1. User opens a folder → `useProjectStore.openFolder()` → `fileSystemService.openFolder()`
2. `Explorer` builds `NativeFileSystemProvider({ rootPath, service })`
3. Expanding a folder calls `loadFolder` → `service.readDir`
4. Create / rename / delete / move call the corresponding service methods, then refresh the parent cache

Virtual paths (`/src/app.ts`) stay stable in the UI; the adapter maps them to absolute OS paths under the project root.

## Persistence

| Key                    | Contents                                      |
| ---------------------- | --------------------------------------------- |
| `launchos.project`     | `rootPath`, `rootName`                        |
| `launchos.explorer.ui` | `expandedByRoot`, selected path, search query |

## Empty state

With no folder open, the explorer shows **Open Folder**. On launch, the last workspace is restored after a permission/existence check. Failures show Retry plus a clear permission or missing-folder message.

See also [Open Folder](./open-folder.md).
