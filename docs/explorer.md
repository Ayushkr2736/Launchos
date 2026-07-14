# Explorer

VS Code–quality file explorer for LaunchOS (`apps/desktop/src/features/explorer`).

## Features

| Feature              | Support                                                        |
| -------------------- | -------------------------------------------------------------- |
| Nested tree          | Lazy-loaded folders, flat render with depth                    |
| Icons                | Extension / special-name Lucide icons with color cues          |
| Rename               | F2 / context menu / inline input with validation               |
| Delete               | ⌫ with confirm dialog                                          |
| Drag & drop          | Move onto folders (blocks self/descendant targets)             |
| Search               | Name filter with match highlight + Escape to clear             |
| Create file / folder | Inline row under parent (toolbar, context menu, blank area)    |
| Collapse / expand    | Chevron click, arrows, toolbar collapse-all                    |
| Context menu         | Open, New, Rename, Delete, Copy Path, Reveal in OS             |
| Persistent expansion | Per-workspace `expandedByRoot` in `launchos.explorer.ui`       |
| Selection            | Single select + scroll-into-view + sync from active editor tab |
| Right click          | Node + blank-area menus                                        |
| Keyboard             | ↑↓ Home/End PageUp/Down ←→ Enter F2 Delete typeahead Escape    |
| Animation            | Chevron rotate, row fade/slide, drop target ring               |

## Architecture

```text
FileSystemProvider     data + I/O (mock | native)
explorer-store         UI: expand, select, search, rename/create, errors
useExplorerActions     orchestration (tabs, confirm, clipboard, OS reveal)
useExplorerVisibleNodes view model (inline create + filter)
useExplorerTreeKeyboard Home/End/typeahead/ARIA tree keys
useExplorerTreeDnD      folder drop targets
```

## Key files

- `explorer.tsx` — shell + active-tab reveal
- `organisms/explorer-tree.tsx` — tree container
- `molecules/explorer-tree-node.tsx` — row UI
- `hooks/use-explorer-actions.ts` — mutations
- `stores/explorer-store.ts` — persisted UI state
