# Open Folder / Workspace

Open a local directory into LaunchOS via the Tauri dialog, populate the File Explorer, and restore it on next launch.

## Flow

```text
⌘O / Command Palette / Explorer empty state
  → FileSystemService.openFolder()          (plugin-dialog)
  → assertWorkspaceAccessible()             (exists + stat + readDir)
  → project-store.workspacePath             (active)
  → project-store.lastWorkspacePath         (persisted)
  → NativeFileSystemProvider                (lazy tree)
  → Explorer tree
```

## Persistence

| Key                | Field               | Purpose                    |
| ------------------ | ------------------- | -------------------------- |
| `launchos.project` | `lastWorkspacePath` | Last opened workspace path |
| `launchos.project` | `workspaceName`     | Basename for chrome labels |

On boot, `useRestoreWorkspace` rehydrates storage, then validates the path before activating `workspacePath`. Failed restore clears the active workspace and shows a Retry / Open Folder empty state.

## Permission errors

`assertWorkspaceAccessible` probes `readDir` so scoped FS denials surface before the tree mounts. User-facing copy comes from `describeWorkspaceError` (`PERMISSION_DENIED`, `NOT_FOUND`, `UNSUPPORTED`, …).

## Entry points

- Explorer empty state — **Open Folder** / **Retry**
- Explorer toolbar — folder open / close
- Command Palette — `Open Folder…` / `Close Folder`
- Keyboard — `⌘O` / `Ctrl+O`
