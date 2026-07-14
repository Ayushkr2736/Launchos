# Git Engine / Source Control

Workspace Git integration via the system `git` CLI (Rust) and a Source Control panel (React).

## Features

| Feature             | Behavior                                                      |
| ------------------- | ------------------------------------------------------------- |
| Current branch      | Title-bar badge + status bar + branch picker                  |
| Branches            | Local / remote list; create + checkout / track remote         |
| Checkout            | `git switch` (create with `-c`, remote tracking)              |
| Commit              | Message box + Commit (staged only; blocked while conflicts)   |
| Push / Pull / Fetch | Toolbar + command palette (`pull --ff-only`, `fetch --prune`) |
| Clone               | Dialog (URL + destination) → opens workspace                  |
| Stash               | Push / apply / pop / drop with optional message               |
| History             | Commit list + `git show` in diff pane                         |
| Diff                | Per-file staged/unstaged unified diff                         |
| Conflict detection  | Unmerged files section; status bar + badge highlight          |
| Status bar          | Bottom chrome: branch, ↑↓, conflicts, change count            |

## Shortcuts

| Shortcut               | Action              |
| ---------------------- | ------------------- |
| `⌘⇧G` / `Ctrl+Shift+G` | Open Source Control |

## Architecture

```text
GitPanel / GitBranchBadge / GitStatusBar
  → git-store → git-bridge (invoke)
  → src-tauri/src/git.rs (git -C <repo> …)
```

Registered slots:

- `bottom.git` — full Source Control UI
- `titlebar.branch` — compact branch indicator

Also mounted:

- Layout `statusBar` slot — `GitStatusBar`

Repo root is `project-store.workspacePath`. Status refreshes on workspace change and every ~8s.

## Structure

```text
features/git/
  git-host.tsx
  git-panel.tsx
  lib/git-bridge.ts
  molecules/
    git-branch-badge.tsx
    git-branch-picker.tsx
    git-clone-dialog.tsx
    git-commit-form.tsx
    git-diff-view.tsx
    git-file-list.tsx
    git-history-list.tsx
    git-stash-panel.tsx
    git-status-bar.tsx
stores/git-store.ts
src-tauri/src/git.rs
```
