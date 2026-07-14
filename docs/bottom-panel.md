# Bottom Panel

Resizable, collapsible chrome for Terminal, Problems, Output, Logs, AI Tasks, Git, Tests, and Deployments.

## Tabs

| Tab         | Slot                 |
| ----------- | -------------------- |
| Terminal    | `bottom.terminal`    |
| Problems    | `bottom.problems`    |
| Output      | `bottom.output`      |
| Logs        | `bottom.logs`        |
| AI Tasks    | `bottom.ai-tasks`    |
| Git         | `bottom.git`         |
| Tests       | `bottom.tests`       |
| Deployments | `bottom.deployments` |

No backend yet for Problems / Output / … — those tabs render empty states until a plugin registers.

**Terminal** is live — see [Terminal](./terminal.md) (`portable-pty` + xterm.js on `bottom.terminal`: tabs, zsh/bash, clear/copy/paste, persisted sessions).
**Git** is live — see [Git](./git.md) (branches, checkout, stash, history, clone, conflicts, status bar on `bottom.git`).

## Behavior

| Feature     | Implementation                             |
| ----------- | ------------------------------------------ |
| Resizable   | Layout engine vertical panel               |
| Collapsible | Tab bar stays visible (`⌘J`)               |
| Persistent  | Tab + height + collapsed in layout store   |
| Maximize    | Toolbar control → `BOTTOM_PANEL_SIZE.max`  |
| Animations  | Framer Motion tab indicator + content fade |
| Dark theme  | `bg-panel` / panel tokens                  |

## Shortcuts

| Shortcut      | Action                         |
| ------------- | ------------------------------ |
| `⌘J`          | Toggle bottom panel            |
| `⌘\``         | Focus Terminal (expands panel) |
| `⌘⌥→` / `⌘⌥←` | Cycle tabs                     |

## Structure

```text
features/bottom-panel/
  atoms/bottom-panel-tab-button.tsx
  molecules/bottom-panel-tab-bar.tsx
  molecules/bottom-panel-body.tsx
  hooks/use-bottom-panel-shortcuts.ts
  constants.ts
  bottom-panel.tsx
```
