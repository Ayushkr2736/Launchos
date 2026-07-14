# LaunchOS Architecture

LaunchOS is a Turborepo monorepo for a desktop AI operating system.

## Layers

| Layer          | Location            | Responsibility                           |
| -------------- | ------------------- | ---------------------------------------- |
| Desktop shell  | `apps/desktop`      | Tauri + React UI, local state, IPC       |
| HTTP API       | `apps/api`          | Fastify REST surface, Prisma, PostgreSQL |
| Shared UI      | `packages/ui`       | shadcn/ui primitives and design tokens   |
| Shared types   | `packages/types`    | Cross-boundary TypeScript contracts      |
| Shared utils   | `packages/utils`    | Pure helpers with no framework coupling  |
| Tooling config | `packages/config/*` | ESLint, TypeScript, Tailwind presets     |
| Services       | `services/`         | Future agent runtimes and workers        |

## Data flow

```
Desktop (Tauri/React)
  → TanStack Query / fetch
  → Fastify API
  → Prisma
  → PostgreSQL
```

Agent execution will later move into `services/` so the API stays a control plane
and the desktop stays a presentation + orchestration surface.

## Desktop chrome

The desktop app separates **window chrome** (`src/window/`), **theme** (`src/theme/`),
and **layout** (`src/layout/`) from feature regions (`src/features/*`).

The [Layout Engine](./layout-engine.md) owns resizable panels, persistence,
collapse/expand, responsive density, keyboard shortcuts, and the Panel API.
`DesktopShell` only composes feature slots into `LayoutEngine` — no business logic.

Primary navigation lives in the [Sidebar](./sidebar.md) feature module
(nested sections, search, recent projects, resize, a11y).

Global search and actions live in the [Command Palette](./command-palette.md)
(`⌘K`, cmdk).

The [Project Explorer](./project-explorer.md) is a VS Code–style tree over
`NativeFileSystemProvider` (adapter to `FileSystemService`).
[Open Folder](./open-folder.md) picks a local directory, stores the workspace path,
and restores it on launch. Opening a file in the explorer loads it into Monaco —
see [Explorer ↔ Editor](./explorer-editor.md).

[Global Search](./global-search.md) (`⌘⇧F`) lives in the left panel beside Explorer —
filename + content search, highlights, recent queries, and jump-to-match in the editor.

The [Workspace](./workspace.md) hosts tabs, split editors, and pane view states.
See [Workspace Tabs](./workspace-tabs.md) for pin, drag-reorder, shortcuts, and session persistence.

The [Editor](./editor.md) provides the Monaco-based reusable code surface
(languages, themes, autosave UI hook, read-only / loading / empty).

Native disk I/O lives in the [File System Service](./filesystem-service.md)
(`services/filesystem`) — Tauri FS/dialog APIs behind a UI-free interface.

The [Bottom Panel](./bottom-panel.md) hosts Terminal / Problems / Output and related chrome.
See [Terminal](./terminal.md) for the PTY-backed multi-tab shell (`portable-pty` + xterm.js).
See [Git](./git.md) for Source Control (branch, stage, commit, sync, diff).

## Path aliases

| Alias             | Target            |
| ----------------- | ----------------- |
| `@/*`             | App-local `src/*` |
| `@launchos/ui`    | `packages/ui`     |
| `@launchos/types` | `packages/types`  |
| `@launchos/utils` | `packages/utils`  |
