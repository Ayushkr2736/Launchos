# Global Search

Production Search in Files for LaunchOS (`apps/desktop/src/features/search`).

## Features

| Feature               | Support                                            |
| --------------------- | -------------------------------------------------- |
| Search Files          | Filename matching (substring / regex / whole word) |
| Search Text           | Line matches across workspace                      |
| Replace / Replace All | Content replace with confirm; refreshes results    |
| Regex                 | `.*` toggle; invalid patterns surface as errors    |
| Case Sensitive        | `Aa` toggle                                        |
| Whole Word            | Word-boundary toggle                               |
| Recent Searches       | Up to 12, persisted                                |
| Results Panel         | Grouped files, expand, progress, ↑↓/Enter          |
| Keyboard              | ⌘⇧F search, ⌘⇧H replace                            |

## Architecture

```text
search-form.tsx          query / replace / options / recent
use-incremental-search   debounce + abort + progress
match-engine.ts          RegExp builder + find/replace helpers
run-search.ts            index cache + scan
run-replace.ts           writeFileContent apply
search-results.tsx       panel + keyboard nav
search-store.ts          state + recent + options persist
```

## Shortcuts

| Action           | Keys                  |
| ---------------- | --------------------- |
| Search in Files  | ⌘⇧F                   |
| Replace in Files | ⌘⇧H                   |
| Replace All      | ⌘↵ (in replace field) |
| Results nav      | ↑ ↓ Enter →           |
