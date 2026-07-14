# Command Palette

Cursor-like command surface powered by **cmdk**, animated with Framer Motion.

## Shortcut

`⌘K` / `Ctrl+K` — toggles globally (works while typing in inputs/editors).

## Groups

| Group           | Contents                                            |
| --------------- | --------------------------------------------------- |
| Recent Files    | Persisted recent editor files                       |
| Recent Projects | Recent workspaces (Workspace Manager)               |
| Open File       | Fuzzy workspace file index (type to search)         |
| Search          | Search / Replace in Files                           |
| Commands        | Layout toggles, terminal, AI, reset layout          |
| Workspace       | Open Folder / Open File, tabs, split, pin           |
| Git             | Source Control, stage, commit, sync, stash, history |
| Theme           | Light / Dark / System                               |
| Settings        | Open Settings + settings pages                      |
| Navigation      | Sidebar sections + nested destinations              |
| Agent Actions   | Switch agent + future agent command placeholders    |

Empty query shows a curated list (recents + pinned primary actions). Typing filters with fuzzy subsequence matching.

## Keyboard

| Key                                | Action                 |
| ---------------------------------- | ---------------------- |
| `↑` / `↓` (or `Ctrl+N` / `Ctrl+P`) | Move selection (loops) |
| `↵`                                | Run selected command   |
| `Esc`                              | Close palette          |
| `⌘K`                               | Toggle palette         |

## Reusable API

```tsx
import {
  CommandPaletteSurface,
  CommandPaletteDialog,
  useRegisterCommands,
  runAndClose,
} from '@/features/command-palette';

// Register extra commands from any feature:
useRegisterCommands('my-feature', [
  {
    id: 'my.action',
    group: 'commands',
    label: 'My Action',
    icon: Sparkles,
    pinned: true, // show when palette opens with empty query
    run: runAndClose(() => {
      /* … */
    }),
  },
]);
```

`CommandPaletteSurface` is chrome-only: pass `items`, `query`, and `onQueryChange`.

## Accessibility

- Radix dialog focus trap + Escape to close
- cmdk ↑↓ / Enter / loop selection
- `aria-live` result count
- Screen-reader title/description
- Title-bar triggers labeled

## Structure

```text
features/command-palette/
  command-palette.tsx
  molecules/command-palette-surface.tsx
  molecules/command-palette-dialog.tsx
  atoms/command-palette-item.tsx
  hooks/use-command-palette-commands.ts
  hooks/use-open-file-commands.ts
  hooks/use-register-commands.ts
  lib/filter-commands.ts
  lib/palette-actions.ts
stores/command-registry-store.ts
```
