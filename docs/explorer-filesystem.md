# Explorer ↔ File System

How LaunchOS connects the Explorer UI to the native filesystem engine.

## Flow

```text
Open / Choose Folder (dialog)
  → Workspace Manager openWorkspace()
  → Filesystem Store openFolder() / openPath()
  → assertWorkspaceAccessible (exists + folder + readDir probe)
  → ProjectFileSystemHost creates NativeFileSystemProvider
  → Explorer bindProjectRoot + useExplorerFolderLoader
  → loadFolder('/') → generate tree (lazy children on expand)
```

## Requirements

| Requirement       | Implementation                                                     |
| ----------------- | ------------------------------------------------------------------ |
| Open Folder       | Toolbar, empty state, ⌘O, command palette                          |
| Choose Folder     | Same Tauri directory picker (empty state + palette alias)          |
| Read Files        | Tree uses `readDir`; editors use `readFileContent` (virtual paths) |
| Generate Tree     | Lazy `loadFolder` + expand persistence                             |
| Restore Session   | Boot `restoreLastWorkspace` + empty-state Retry                    |
| Permission Errors | Probe before mount + empty-state / tree error banner + access hint |
| Loading           | Connection status strip + per-folder spinner                       |
| Progress          | Indexing progress while filtering (`scanned/pending` folders)      |

## Key files

- `providers/project-file-system-host.tsx` — provider switch
- `features/explorer/fs/native-fs-provider.ts` — virtual tree over Tauri FS
- `features/explorer/hooks/use-explorer-folder-loader.ts` — connection orchestrator
- `modules/filesystem/stores/filesystem-store.ts` — open / restore / watch
- `modules/workspace-manager` — catalog + restore preferred workspace

## Path convention

Explorer tabs and file reads use **virtual** paths (`/src/app.ts`).
Native OS paths are resolved via `resolveNativePath` only when needed (Reveal in Finder, etc.).
