# Layout Engine

Reusable IDE chrome for LaunchOS. Layout only — no domain or business logic.

## Regions

```text
Title Bar
↓
Sidebar | Project Explorer | Workspace | AI Assistant
↓
Bottom Panel
```

## Capabilities

| Capability        | Behavior                                                          |
| ----------------- | ----------------------------------------------------------------- |
| Resizable panels  | `react-resizable-panels` Group / Panel / Separator                |
| Persist sizes     | Zustand `persist` → `launchos.shell.layout`                       |
| Collapse / expand | Store actions + `layoutPanelApi`                                  |
| Animations        | Framer Motion enter frames; sidebar width CSS transition          |
| Panel API         | Imperative facade over the layout store                           |
| Layout store      | Visibility, sizes, tabs chrome, command palette open              |
| Workspace store   | Tab chrome / content state (no file or agent logic)               |
| Responsive        | Breakpoints laptop → ultra; auto-collapse AI on laptop entry      |
| Keyboard          | `⌘B` sidebar, `⌘J` bottom, `⌘⇧A` AI, `⌘⇧E` explorer, `⌘K` palette |

## Architecture

```text
DesktopShell (composition)
  └─ LayoutEngine (organism)
       ├─ useLayoutEngine
       │    ├─ useLayoutCssVars
       │    ├─ useLayoutShortcuts → layoutPanelApi
       │    └─ useLayoutResponsive
       ├─ LayoutRegion (atom) × title / sidebar
       └─ LayoutWorkbench (organism)
            ├─ LayoutResizeHandle (atom)
            ├─ AnimatedPanelFrame (molecule)
            └─ LayoutRegion × explorer / workspace / AI / bottom

layoutPanelApi ──► useLayoutStore (persisted)
useWorkspaceStore (persisted tab chrome)
```

### Atomic Design

- **Atoms** — `LayoutRegion`, `LayoutResizeHandle`
- **Molecules** — `AnimatedPanelFrame`
- **Organisms** — `LayoutWorkbench`, `LayoutEngine`
- **Template** — `DesktopShell` wires feature slots only

### Panel API

```ts
import { layoutPanelApi } from '@/layout';

layoutPanelApi.toggle('explorer');
layoutPanelApi.collapse('ai');
layoutPanelApi.setSize('bottom', 280);
layoutPanelApi.subscribe((snapshot) => {
  /* layout chrome only */
});
```

Workspace panel cannot be collapsed (throws).

### Stores

- **Layout store** — panel visibility, pixel sizes, breakpoint, bottom/AI tab ids, palette open
- **Workspace store** — workspace name, open tabs, active tab, empty/loading/ready/error chrome, split flag

Neither store contains project, agent, git, or marketplace logic.

### Responsive policy

| Breakpoint | Width  |
| ---------- | ------ |
| laptop     | ≥ 1280 |
| desktop    | ≥ 1440 |
| wide       | ≥ 1920 |
| ultra      | ≥ 2560 |

When the viewport **enters** laptop (from a larger breakpoint) and both explorer and AI are open, AI collapses once to protect workspace width. User can re-expand; the policy does not fight subsequent toggles.

## Structure

```text
src/layout/
  atoms/
  molecules/
  organisms/
  hooks/
  styles/layout.css
  constants.ts
  panel-api.ts
  types.ts
  index.ts
src/stores/layout-store.ts
src/stores/workspace-store.ts
```
