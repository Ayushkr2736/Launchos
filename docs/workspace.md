# Workspace

Multi-editor workspace chrome: tabs, drag-reorder, pin, split view, and pane states.

See also [Workspace Tabs](./workspace-tabs.md) for the full tab system.

## Features

| Feature     | Behavior                                                                |
| ----------- | ----------------------------------------------------------------------- |
| Tabs        | Open / activate / dirty / pinned                                        |
| Drag tabs   | Reorder in the tab bar (pinned region first); drop onto a pane to focus |
| Close       | Button, middle-click, context menu, keyboard                            |
| Split view  | Side-by-side primary + secondary editors, resizable ratio               |
| Persistence | Tabs (incl. pin/dirty), panes, focus, split flag + ratio                |

## Store

`useWorkspaceStore`:

- `openTab(tab, paneId?)`
- `closeTab` / `closeOtherTabs` / `closeTabsToTheRight` / `closeAllTabs`
- `pinTab` / `unpinTab` / `togglePinTab` / `cycleTab`
- `reorderTabs`
- `setActiveTab` / `focusPane`
- `toggleSplit` / `setSplitRatio` / `openSplitWithActiveTab`
- `setPaneViewState` / `setTabDirty`

## Structure

```text
features/workspace/
  molecules/   tab item, toolbar, pane states, editor surface
  organisms/   tab bar, editor pane, split view
  hooks/       tab DnD, tab shortcuts, split resize
  utils/tab-order.ts
  workspace.tsx
stores/workspace-store.ts
```

Open a file from the Project Explorer to populate editors. Untitled tabs come from the workspace toolbar.

Editor rendering is delegated to the [Editor](./editor.md) module (Monaco).
