## Desktop Shell Architecture

The desktop shell owns **layout chrome only**. Features register into named slots; the shell never owns agent, git, terminal, or editor business logic.

### Structure

```text
apps/desktop/src/
  layouts/           DesktopShell composition
  features/          Region UIs (sidebar, title-bar, explorer, …)
  components/
    atoms/           IconButton, PanelChrome, ShellResizeHandle
    molecules/       EmptyState, PanelHeader, SearchField
    organisms/       ShellSlot (plugin host)
  hooks/             Theme, shortcuts, window controls, CSS vars
  stores/            Zustand + persist (layout/theme/sidebar/workspace)
  providers/         Query + Tooltip
  constants/         Nav items, sizes, shortcuts
  types/             Shell contracts + slot IDs
```

### Plugin model

`useShellRegistry.register({ id, slot, render })` mounts UI into a `ShellSlot`. Unregistered slots render production empty states, not mock data.

### Persistence

Zustand `persist` stores sidebar collapse/width, explorer/AI/bottom sizes, theme, pinned nav, and open tabs.
