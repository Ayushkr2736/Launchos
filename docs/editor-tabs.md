# Editor Tabs

Production editor tab system for LaunchOS (`apps/desktop/src/features/workspace`).

## Features

| Feature            | Support                                                   |
| ------------------ | --------------------------------------------------------- |
| Open               | Explorer, search, palette, toolbar untitled               |
| Close              | ⌘W, X, middle-click, context menu (unsaved confirm)       |
| Close Others       | ⌘⌥T                                                       |
| Close Left / Right | Context menu + shortcuts + palette                        |
| Pin                | ⌘⌥P — pinned stay left, resist close                      |
| Drag               | Reorder in tab bar; drop on pane focuses there            |
| Split              | Toggle / Split Right (⌘\\)                                |
| Duplicate          | ⌘⇧D — second view of same file                            |
| Persistent         | Per-workspace sessions (`sessionsByRoot`)                 |
| Unsaved indicator  | Dot on tab + close confirm                                |
| Keyboard           | Close family, cycle, pin, duplicate, reopen, ⌘1–9, arrows |
| Animations         | Framer Motion layout + enter/exit                         |

## Architecture

```text
tab-commands.ts     shared command API (safe close + confirm)
workspace-store.ts  tabs, panes, closed stack, sessionsByRoot
workspace-tab-item  UI + context menu + DnD
use-workspace-tab-shortcuts  keyboard bindings
```

## Shortcuts

| Action             | Keys                      |
| ------------------ | ------------------------- |
| Close              | ⌘W                        |
| Close Others       | ⌘⌥T                       |
| Close All          | ⌘⌥W                       |
| Close Left / Right | ⌘⇧⌥[ / ]                  |
| Next / Previous    | Ctrl+Tab / Ctrl+Shift+Tab |
| Pin                | ⌘⌥P                       |
| Duplicate          | ⌘⇧D                       |
| Reopen Closed      | ⌘⇧T                       |
| Toggle Split       | ⌘\\                       |
| Switch to Nth      | ⌘1–⌘9                     |
