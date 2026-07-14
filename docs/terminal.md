# Terminal

Interactive multi-tab shell panel backed by a PTY host and xterm.js.

## Note on node-pty

LaunchOS is a **Tauri** app (Rust host + WebView). There is no Node.js runtime in the packaged
desktop binary, so the Node native module `node-pty` cannot run here.

The Rust crate **`portable-pty`** provides the same role as node-pty (spawn a shell in a PTY,
read / write / resize) and is what this integration uses.

## Features

| Feature             | Behavior                                                                                                                                            |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Multiple tabs       | Inner tab bar; `+` menu creates another session                                                                                                     |
| Resize              | FitAddon + ResizeObserver; PTY `terminal_resize`                                                                                                    |
| Scrollback          | 10 000 lines in xterm                                                                                                                               |
| Clear               | Toolbar, context menu, ⌘⇧K, command palette                                                                                                         |
| Copy / Paste        | ⌘C / ⌘V (with selection), ⌘⇧C / ⌘⇧V, toolbar, context menu                                                                                          |
| zsh / bash          | New-terminal menu + command palette; preferred default shell                                                                                        |
| Workspace cwd       | New sessions `cwd` = open folder (`workspacePath`)                                                                                                  |
| Dark theme          | xterm theme matched to panel (`#141414`)                                                                                                            |
| Persistent sessions | Tab metadata + preferred shell survive restarts (`launchos.terminal`); PTYs respawn on boot. In-app, sessions stay alive when switching bottom tabs |

## Shortcuts

| Shortcut | Action                |
| -------- | --------------------- |
| `⌘J`     | Toggle bottom panel   |
| `⌘\``    | Focus Terminal tab    |
| `⌘⇧\``   | New Terminal          |
| `⌘⇧K`    | Clear active terminal |

## Architecture

```text
xterm.js (features/terminal/)
  ↕ invoke / events
Rust portable-pty (src-tauri/src/terminal.rs)
  commands: terminal_create | terminal_write | terminal_resize | terminal_kill | terminal_list_shells
  events:   terminal-output-{id} | terminal-exit-{id}
```

Registered on shell slot `bottom.terminal` via `TerminalHost`.

## Structure

```text
features/terminal/
  terminal-host.tsx
  terminal-panel.tsx
  hooks/use-terminal-shortcuts.ts
  molecules/terminal-tab-bar.tsx
  molecules/terminal-session-view.tsx
  lib/pty-bridge.ts
  lib/session-registry.ts
  constants.ts
stores/terminal-store.ts
src-tauri/src/terminal.rs
```
