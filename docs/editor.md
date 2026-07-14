# Editor Module

Production Monaco editor for LaunchOS (`apps/desktop/src/modules/editor`).

## Public API

```ts
import {
  Editor,
  EditorProvider,
  useEditor,
  EditorStore,
  resolveEditorLanguage,
} from '@/modules/editor';

// App root
<EditorProvider>
  <App />
</EditorProvider>

// Document surface
<Editor
  id={tabId}
  value={source}
  path={filePath}
  themeMode="system"
  readOnly={false}
  loading={false}
  onChange={({ value }) => setBuffer(value)}
  onSave={({ value }) => void persist(value)}
/>

// Imperative commands (active editor)
const { find, replace, goToLine, fontZoomIn } = useEditor();
```

## Languages

TypeScript · JavaScript · TSX · JSX · JSON · HTML · CSS · SCSS · Markdown · Python · Rust · Go (+ plaintext fallback)

## Features

| Feature                   | Implementation                           |
| ------------------------- | ---------------------------------------- |
| Syntax highlighting       | Monaco language workers + extension map  |
| Minimap                   | Preference + `minimap.enabled`           |
| Multiple cursors          | `multiCursorModifier: 'alt'`             |
| Code folding              | `folding` / fold-all commands            |
| Bracket pair colorization | Enabled by default                       |
| Auto indentation          | `autoIndent: 'full'` + detectIndentation |
| Word wrap                 | Preference (`on` / `off` / …)            |
| Find / Replace            | Monaco actions (`⌘F` / `⌘⌥F`)            |
| Go to line                | Monaco action (`⌃G`)                     |
| Font zoom                 | Monaco zoom actions + store fontSize     |
| Sticky scroll             | Preference                               |
| Theme switching           | `vs` / `vs-dark` via LaunchOS theme      |
| Read-only                 | `readOnly` prop                          |
| Loading / empty           | Overlay chrome                           |

## Layout

```text
modules/editor/
  components/     Editor, MonacoEditor, EditorProvider, states
  hooks/          useEditor, useEditorTheme, useEditorAutosave
  services/       monaco-setup, languages, themes, commands, binary
  stores/         EditorStore (Zustand + persist preferences)
  types/          Public contracts
  constants.ts
  index.ts
```

## Integration

- `EditorProvider` mounts in `AppProviders` and boots Vite-bundled workers.
- `WorkspaceEditorSurface` loads FS content and renders `<Editor />`.
- `@/features/editor` re-exports this module for older imports.
