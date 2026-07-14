# File System Service

Native filesystem abstraction for LaunchOS desktop. **No UI and no editor integration** —
features call this service (or an injected `FileSystemService`) instead of Tauri plugins.

> Distinct from the Explorer mock `FileSystemProvider` (`features/explorer/fs`), which is an
> in-memory tree for UI development. This service talks to the real OS via Tauri.

## Capabilities

| Operation      | Method                                   | Notes                                   |
| -------------- | ---------------------------------------- | --------------------------------------- |
| Open folder    | `openFolder()`                           | Native dialog; `null` on cancel         |
| Read file      | `readFile(path)`                         | UTF-8 text                              |
| Write file     | `writeFile(path, content)`               | Creates or overwrites a file            |
| Rename         | `rename(path, nextName)`                 | Renames final segment; returns new path |
| Delete         | `delete(path)`                           | Files or folders (recursive)            |
| Create file    | `createFile(parent, name, { content? })` | Fails if already exists                 |
| Create folder  | `createFolder(parent, name)`             | Fails if already exists                 |
| Read directory | `readDir(path)`                          | Sorted entries (folders first)          |
| Exists         | `exists(path)`                           | Boolean                                 |
| Stat           | `stat(path)`                             | Kind + timestamps                       |
| Move           | `move(path, targetFolder)`               | Keeps basename                          |

## Usage

```ts
import {
  fileSystemService,
  FileSystemServiceError,
  isFileSystemServiceError,
} from '@/services/filesystem';

const root = await fileSystemService.openFolder({ title: 'Open Project' });
if (!root) {
  return; // cancelled
}

try {
  const source = await fileSystemService.readFile(`${root}/README.md`);
  await fileSystemService.writeFile(`${root}/NOTES.md`, source);
} catch (error) {
  if (isFileSystemServiceError(error)) {
    console.error(error.code, error.path, error.message);
  }
  throw error;
}
```

Inject in tests:

```ts
const fs = createFileSystemService(); // Tauri impl in app; UNSUPPORTED outside Tauri
```

## Errors

`FileSystemServiceError` with codes:

`NOT_FOUND` · `ALREADY_EXISTS` · `INVALID_NAME` · `INVALID_PATH` · `PERMISSION_DENIED` ·
`NOT_A_FILE` · `NOT_A_FOLDER` · `CANCELLED` · `UNSUPPORTED` · `IO_ERROR` · `UNKNOWN`

## Structure

```text
services/filesystem/
  types.ts                      FileSystemService interface + options
  errors.ts                     Typed errors + native error mapping
  path.ts                       Native path helpers (join / parent / name)
  tauri-file-system-service.ts  @tauri-apps/plugin-fs + plugin-dialog
  create-file-system-service.ts Factory + shared `fileSystemService`
  index.ts
```

## Tauri wiring

- JS: `@tauri-apps/plugin-fs`, `@tauri-apps/plugin-dialog`
- Rust: `tauri-plugin-fs`, `tauri-plugin-dialog` registered in `src-tauri/src/lib.rs`
- Capabilities: home / document / desktop / download recursive read+write, `dialog:default`

Scope is intentionally limited to common user project locations. Expand
`src-tauri/capabilities/default.json` if additional roots are required.
