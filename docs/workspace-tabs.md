# Workspace Tabs

Professional editor tab chrome for LaunchOS.

## Features

| Feature            | Behavior                                                      |
| ------------------ | ------------------------------------------------------------- |
| Drag / reorder     | Drag tabs in the bar; drop indicator; pinned stay left        |
| Pin                | Pin icon; pinned tabs resist close / middle-click             |
| Close              | Button, middle-click, ⌘W (skipped while pinned unless forced) |
| Close Others       | Keeps active + all pinned tabs                                |
| Close to the Right | Skips pinned tabs on the right                                |
| Close All          | Closes every tab including pinned                             |
| Unsaved            | Dot indicator on dirty tabs                                   |
| Context menu       | Activate, Pin/Unpin, Close variants, Split Right              |
| Keyboard           | ⌘W, ⌘⌥T, ⌘⌥W, Ctrl+Tab / Ctrl+Shift+Tab, ⌘⌥P                  |
| Session            | Tabs (incl. pinned/dirty), panes, focus, split — persisted    |

## Shortcuts

| Shortcut                 | Action           |
| ------------------------ | ---------------- |
| `⌘W` / `Ctrl+W`          | Close active tab |
| `⌘⌥T` / `Ctrl+Alt+T`     | Close others     |
| `⌘⌥W` / `Ctrl+Alt+W`     | Close all        |
| `Ctrl+Tab` / `⌘⌥]`       | Next tab         |
| `Ctrl+Shift+Tab` / `⌘⌥[` | Previous tab     |
| `⌘⌥P` / `Ctrl+Alt+P`     | Toggle pin       |

## Store

`useWorkspaceStore`: `pinTab` / `unpinTab` / `togglePinTab` / `cycleTab`, plus existing open/close/reorder APIs. Session key from `WORKSPACE_STORAGE_KEY`.
