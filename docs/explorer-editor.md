# Explorer ↔ Editor

Connecting the File Explorer to Monaco via workspace tabs.

## Behavior

| Concern         | Implementation                                                               |
| --------------- | ---------------------------------------------------------------------------- |
| Open file       | Explorer click → `openTab({ id: path, path })` → `WorkspaceEditorSurface`    |
| Duplicate tabs  | `openTab` matches existing by `id` **or** `path` and focuses it              |
| Load content    | `FileSystemProvider.readFileContent` (native → `FileSystemService.readFile`) |
| Autosave        | Debounced `writeFileContent` + dirty cleared; chrome shows Saving / Saved    |
| Cursor + scroll | Monaco `saveViewState` / `restoreViewState` in `launchos.editor.view-state`  |
| Binary files    | Extension denylist + NUL-byte heuristic → non-editor empty state             |
| Loading         | Async read with overlay until content + Monaco ready                         |

## Shared FS host

`ProjectFileSystemHost` wraps the desktop shell so Explorer and Workspace share one
`NativeFileSystemProvider` (or mock when no folder is open).

## Key files

```text
providers/project-file-system-host.tsx
stores/editor-view-state-store.ts
features/workspace/molecules/workspace-editor-surface.tsx
features/editor/utils/binary.ts
features/explorer/fs/native-fs-provider.ts   # readFileContent / writeFileContent
```
