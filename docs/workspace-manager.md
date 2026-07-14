# Workspace Manager

Production folder-workspace catalog for LaunchOS (`apps/desktop/src/modules/workspace-manager`).

This module manages **project folders** (open / switch / pin / restore). It does **not** manage editor tabs — those live in `stores/workspace-store` (`launchos.shell.workspace`).

## Public API

```ts
import {
  useWorkspaceManager,
  useWorkspaceManagerStore,
  useRestoreLastWorkspace,
  useActiveWorkspace,
  useWorkspaceSettings,
  WorkspaceStore,
} from '@/modules/workspace-manager';

const wm = useWorkspaceManager();
await wm.openWorkspace();
await wm.switchWorkspace('/path/to/folder');
await wm.restoreLastWorkspace();
wm.pinWorkspace(id);
wm.updateSettings(path, { preferOnLaunch: true });
```

## Features

| Feature                | API                                                                                                                   |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Recent Workspaces      | `recents` / `rememberWorkspace` / `removeRecent` / `clearRecents`                                                     |
| Pinned Workspaces      | `pinned` / `pinWorkspace` / `unpinWorkspace` / `togglePinned`                                                         |
| Workspace Switching    | `switchWorkspace(path)` → filesystem `openPath`                                                                       |
| Workspace Metadata     | `refreshMetadata` / `metadataByPath` (exists, directory, errors)                                                      |
| Restore Last Workspace | `restoreLastWorkspace` (prefers pinned + `preferOnLaunch`, else FS last path)                                         |
| Workspace Settings     | `getSettings` / `updateSettings` / `useWorkspaceSettings`                                                             |
| Workspace Store        | `useWorkspaceManagerStore` / `WorkspaceStore` (`launchos.workspace-manager`)                                          |
| Workspace Service      | `resolveWorkspaceMetadata`, `createWorkspaceEntry`, path id helpers                                                   |
| Workspace Hooks        | `useWorkspaceManager`, `useActiveWorkspace`, `useRestoreLastWorkspace`, `useWorkspaceCatalog`, `useWorkspaceSettings` |

## Layout

```text
modules/workspace-manager/
  types/       Entry, metadata, settings
  constants.ts Storage key + list caps
  services/    Metadata probe + list upsert helpers
  stores/      Persist catalog + orchestrate FS open/switch/restore
  hooks/       React bindings
  index.ts
```

## Persistence

| Key                          | Role                                      |
| ---------------------------- | ----------------------------------------- |
| `launchos.workspace-manager` | Recents, pinned, settings, metadata cache |
| `launchos.project`           | Active / last folder (filesystem engine)  |
| `launchos.shell.sidebar`     | Legacy `recentProjects` (one-time import) |

## Integration

- Sidebar Recent / Pinned → `switchWorkspace`
- ⌘O / Explorer Open Folder / Command Palette → `openWorkspace`
- App boot → `useRestoreLastWorkspace` (via `useRestoreWorkspace`)
- Opening expands Explorer when `expandExplorerOnOpen` is true (default)

## Settings defaults

```ts
{
  expandExplorerOnOpen: true,
  preferOnLaunch: false,
  accent: null,
  notes: '',
}
```
