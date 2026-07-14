import type {
  CreateFileOptions,
  FileSystemService,
  FsUnwatchFn,
  FsWatchEvent,
  FsWatchEventKind,
  NativeFsDirEntry,
  NativeFsEntryKind,
  NativeFsPath,
  NativeFsStat,
  OpenFileOptions,
  OpenFolderOptions,
  SaveAsOptions,
  WatchPathOptions,
} from '@/modules/filesystem/types';

import { FileSystemServiceError, mapNativeFsError } from '@/modules/filesystem/services/errors';
import {
  assertNonEmptyPath,
  assertValidEntryName,
  getNativeBaseName,
  getNativeParentPath,
  joinNativePath,
  pathsEqual,
} from '@/modules/filesystem/services/path';
import { detectTauriRuntime } from '@/window/native';

async function loadFs() {
  return import('@tauri-apps/plugin-fs');
}

async function loadDialog() {
  return import('@tauri-apps/plugin-dialog');
}

function ensureTauriRuntime(): void {
  if (!detectTauriRuntime()) {
    throw new FileSystemServiceError(
      'UNSUPPORTED',
      'FileSystemService requires the Tauri desktop runtime.',
    );
  }
}

function mapWatchKind(kind: unknown): FsWatchEventKind {
  if (kind === 'any') {
    return 'any';
  }
  if (kind === 'other' || !kind || typeof kind !== 'object') {
    return 'other';
  }
  if ('create' in kind) {
    return 'create';
  }
  if ('modify' in kind) {
    const modify = (kind as { modify?: { kind?: string } }).modify;
    if (modify && typeof modify === 'object' && modify.kind === 'rename') {
      return 'rename';
    }
    return 'modify';
  }
  if ('remove' in kind) {
    return 'remove';
  }
  if ('access' in kind) {
    return 'access';
  }
  return 'other';
}

/**
 * Tauri-backed File System Engine.
 * No React / UI coupling — call from stores, commands, or adapters only.
 */
export class TauriFileSystemService implements FileSystemService {
  readonly id = 'tauri-fs';

  async openFolder(options: OpenFolderOptions = {}): Promise<NativeFsPath | null> {
    ensureTauriRuntime();
    try {
      const { open } = await loadDialog();
      const selected = await open({
        directory: true,
        multiple: false,
        ...(options.title !== undefined ? { title: options.title } : {}),
        ...(options.defaultPath !== undefined ? { defaultPath: options.defaultPath } : {}),
      });

      if (selected === null) {
        return null;
      }
      if (typeof selected !== 'string') {
        throw new FileSystemServiceError(
          'UNKNOWN',
          'Open folder dialog returned an unexpected selection.',
        );
      }
      return assertNonEmptyPath(selected);
    } catch (error) {
      throw mapNativeFsError(error, {
        message: 'Failed to open folder dialog',
        code: 'IO_ERROR',
      });
    }
  }

  async openFile(options: OpenFileOptions = {}): Promise<NativeFsPath | null> {
    ensureTauriRuntime();
    try {
      const { open } = await loadDialog();
      const selected = await open({
        directory: false,
        multiple: options.multiple ?? false,
        ...(options.title !== undefined ? { title: options.title } : {}),
        ...(options.defaultPath !== undefined ? { defaultPath: options.defaultPath } : {}),
        ...(options.filters !== undefined ? { filters: [...options.filters] } : {}),
      });

      if (selected === null) {
        return null;
      }
      if (Array.isArray(selected)) {
        const first = selected[0];
        return typeof first === 'string' ? assertNonEmptyPath(first) : null;
      }
      if (typeof selected !== 'string') {
        throw new FileSystemServiceError(
          'UNKNOWN',
          'Open file dialog returned an unexpected selection.',
        );
      }
      return assertNonEmptyPath(selected);
    } catch (error) {
      throw mapNativeFsError(error, {
        message: 'Failed to open file dialog',
        code: 'IO_ERROR',
      });
    }
  }

  async saveAsDialog(options: SaveAsOptions = {}): Promise<NativeFsPath | null> {
    ensureTauriRuntime();
    try {
      const { save } = await loadDialog();
      const selected = await save({
        ...(options.title !== undefined ? { title: options.title } : {}),
        ...(options.defaultPath !== undefined ? { defaultPath: options.defaultPath } : {}),
        ...(options.filters !== undefined ? { filters: [...options.filters] } : {}),
      });
      if (selected === null) {
        return null;
      }
      return assertNonEmptyPath(selected);
    } catch (error) {
      throw mapNativeFsError(error, {
        message: 'Failed to open save dialog',
        code: 'IO_ERROR',
      });
    }
  }

  async readFile(path: NativeFsPath): Promise<string> {
    ensureTauriRuntime();
    const target = assertNonEmptyPath(path);
    try {
      const { readTextFile, exists, stat } = await loadFs();
      if (!(await exists(target))) {
        throw new FileSystemServiceError('NOT_FOUND', `File not found: ${target}`, {
          path: target,
        });
      }
      const meta = await stat(target);
      if (meta.isDirectory) {
        throw new FileSystemServiceError('NOT_A_FILE', `Path is a folder: ${target}`, {
          path: target,
        });
      }
      return await readTextFile(target);
    } catch (error) {
      throw mapNativeFsError(error, {
        message: `Failed to read file: ${target}`,
        path: target,
      });
    }
  }

  async writeFile(path: NativeFsPath, content: string): Promise<void> {
    ensureTauriRuntime();
    const target = assertNonEmptyPath(path);
    try {
      const { writeTextFile, exists, stat } = await loadFs();
      if (await exists(target)) {
        const meta = await stat(target);
        if (meta.isDirectory) {
          throw new FileSystemServiceError('NOT_A_FILE', `Path is a folder: ${target}`, {
            path: target,
          });
        }
      }
      await writeTextFile(target, content, { create: true });
    } catch (error) {
      throw mapNativeFsError(error, {
        message: `Failed to write file: ${target}`,
        path: target,
      });
    }
  }

  async saveFile(path: NativeFsPath, content: string): Promise<void> {
    return this.writeFile(path, content);
  }

  async saveAs(content: string, options: SaveAsOptions = {}): Promise<NativeFsPath | null> {
    const path = await this.saveAsDialog(options);
    if (!path) {
      return null;
    }
    await this.writeFile(path, content);
    return path;
  }

  async rename(path: NativeFsPath, nextName: string): Promise<NativeFsPath> {
    ensureTauriRuntime();
    const source = assertNonEmptyPath(path);
    const name = assertValidEntryName(nextName);
    const parent = getNativeParentPath(source);
    if (parent === null) {
      throw new FileSystemServiceError(
        'INVALID_PATH',
        `Cannot rename path without a parent: ${source}`,
        {
          path: source,
        },
      );
    }
    const destination = joinNativePath(parent, name);
    if (pathsEqual(destination, source)) {
      return source;
    }

    try {
      const { exists, rename } = await loadFs();
      if (!(await exists(source))) {
        throw new FileSystemServiceError('NOT_FOUND', `Path not found: ${source}`, {
          path: source,
        });
      }
      if (await exists(destination)) {
        throw new FileSystemServiceError(
          'ALREADY_EXISTS',
          `Target already exists: ${destination}`,
          { path: destination },
        );
      }
      await rename(source, destination);
      return destination;
    } catch (error) {
      throw mapNativeFsError(error, {
        message: `Failed to rename: ${source}`,
        path: source,
      });
    }
  }

  async move(path: NativeFsPath, targetFolderPath: NativeFsPath): Promise<NativeFsPath> {
    ensureTauriRuntime();
    const source = assertNonEmptyPath(path);
    const targetFolder = assertNonEmptyPath(targetFolderPath, 'target folder');
    const name = getNativeBaseName(source);
    const destination = joinNativePath(targetFolder, name);
    if (pathsEqual(destination, source)) {
      return source;
    }

    try {
      const { exists, rename, stat } = await loadFs();
      if (!(await exists(source))) {
        throw new FileSystemServiceError('NOT_FOUND', `Path not found: ${source}`, {
          path: source,
        });
      }
      if (!(await exists(targetFolder))) {
        throw new FileSystemServiceError('NOT_FOUND', `Target folder not found: ${targetFolder}`, {
          path: targetFolder,
        });
      }
      const targetMeta = await stat(targetFolder);
      if (!targetMeta.isDirectory) {
        throw new FileSystemServiceError(
          'NOT_A_FOLDER',
          `Target is not a folder: ${targetFolder}`,
          {
            path: targetFolder,
          },
        );
      }
      if (await exists(destination)) {
        throw new FileSystemServiceError(
          'ALREADY_EXISTS',
          `Target already exists: ${destination}`,
          { path: destination },
        );
      }
      await rename(source, destination);
      return destination;
    } catch (error) {
      throw mapNativeFsError(error, {
        message: `Failed to move: ${source}`,
        path: source,
      });
    }
  }

  async copy(sourcePath: NativeFsPath, destination: NativeFsPath): Promise<NativeFsPath> {
    ensureTauriRuntime();
    const source = assertNonEmptyPath(sourcePath);
    const destInput = assertNonEmptyPath(destination, 'destination');

    try {
      const { exists, stat, copyFile, mkdir } = await loadFs();
      if (!(await exists(source))) {
        throw new FileSystemServiceError('NOT_FOUND', `Path not found: ${source}`, {
          path: source,
        });
      }

      let target = destInput;
      if (await exists(destInput)) {
        const destMeta = await stat(destInput);
        if (destMeta.isDirectory) {
          target = joinNativePath(destInput, getNativeBaseName(source));
        }
      }

      if (await exists(target)) {
        throw new FileSystemServiceError('ALREADY_EXISTS', `Target already exists: ${target}`, {
          path: target,
        });
      }

      const sourceMeta = await stat(source);
      if (sourceMeta.isDirectory) {
        await this.copyDirectoryRecursive(source, target);
      } else {
        const parent = getNativeParentPath(target);
        if (parent && !(await exists(parent))) {
          await mkdir(parent, { recursive: true });
        }
        await copyFile(source, target);
      }
      return target;
    } catch (error) {
      throw mapNativeFsError(error, {
        message: `Failed to copy: ${source}`,
        path: source,
      });
    }
  }

  private async copyDirectoryRecursive(source: NativeFsPath, target: NativeFsPath): Promise<void> {
    const { mkdir, copyFile, exists } = await loadFs();
    if (!(await exists(target))) {
      await mkdir(target, { recursive: true });
    }
    const entries = await this.readDir(source);
    for (const entry of entries) {
      const nextTarget = joinNativePath(target, entry.name);
      if (entry.kind === 'folder') {
        await this.copyDirectoryRecursive(entry.path, nextTarget);
      } else {
        await copyFile(entry.path, nextTarget);
      }
    }
  }

  async delete(path: NativeFsPath): Promise<void> {
    ensureTauriRuntime();
    const target = assertNonEmptyPath(path);
    try {
      const { exists, remove, stat } = await loadFs();
      if (!(await exists(target))) {
        throw new FileSystemServiceError('NOT_FOUND', `Path not found: ${target}`, {
          path: target,
        });
      }
      const meta = await stat(target);
      await remove(target, { recursive: meta.isDirectory });
    } catch (error) {
      throw mapNativeFsError(error, {
        message: `Failed to delete: ${target}`,
        path: target,
      });
    }
  }

  async createFile(
    parentPath: NativeFsPath,
    name: string,
    options: CreateFileOptions = {},
  ): Promise<NativeFsPath> {
    ensureTauriRuntime();
    const parent = assertNonEmptyPath(parentPath, 'parent path');
    const target = joinNativePath(parent, name);
    try {
      const { exists, writeTextFile, stat } = await loadFs();
      if (!(await exists(parent))) {
        throw new FileSystemServiceError('NOT_FOUND', `Parent folder not found: ${parent}`, {
          path: parent,
        });
      }
      const parentMeta = await stat(parent);
      if (!parentMeta.isDirectory) {
        throw new FileSystemServiceError('NOT_A_FOLDER', `Parent is not a folder: ${parent}`, {
          path: parent,
        });
      }
      if (await exists(target)) {
        throw new FileSystemServiceError('ALREADY_EXISTS', `File already exists: ${target}`, {
          path: target,
        });
      }
      await writeTextFile(target, options.content ?? '', { createNew: true });
      return target;
    } catch (error) {
      throw mapNativeFsError(error, {
        message: `Failed to create file: ${target}`,
        path: target,
      });
    }
  }

  async createFolder(parentPath: NativeFsPath, name: string): Promise<NativeFsPath> {
    ensureTauriRuntime();
    const parent = assertNonEmptyPath(parentPath, 'parent path');
    const target = joinNativePath(parent, name);
    try {
      const { exists, mkdir, stat } = await loadFs();
      if (!(await exists(parent))) {
        throw new FileSystemServiceError('NOT_FOUND', `Parent folder not found: ${parent}`, {
          path: parent,
        });
      }
      const parentMeta = await stat(parent);
      if (!parentMeta.isDirectory) {
        throw new FileSystemServiceError('NOT_A_FOLDER', `Parent is not a folder: ${parent}`, {
          path: parent,
        });
      }
      if (await exists(target)) {
        throw new FileSystemServiceError('ALREADY_EXISTS', `Folder already exists: ${target}`, {
          path: target,
        });
      }
      await mkdir(target, { recursive: false });
      return target;
    } catch (error) {
      throw mapNativeFsError(error, {
        message: `Failed to create folder: ${target}`,
        path: target,
      });
    }
  }

  async readDir(path: NativeFsPath): Promise<readonly NativeFsDirEntry[]> {
    ensureTauriRuntime();
    const target = assertNonEmptyPath(path);
    try {
      const { exists, readDir, stat } = await loadFs();
      if (!(await exists(target))) {
        throw new FileSystemServiceError('NOT_FOUND', `Folder not found: ${target}`, {
          path: target,
        });
      }
      const meta = await stat(target);
      if (!meta.isDirectory) {
        throw new FileSystemServiceError('NOT_A_FOLDER', `Path is not a folder: ${target}`, {
          path: target,
        });
      }
      const entries = await readDir(target);
      return entries
        .filter((entry) => Boolean(entry.name))
        .map((entry) => {
          const name = entry.name;
          const entryPath = joinNativePath(target, name);
          const kind: NativeFsEntryKind = entry.isDirectory ? 'folder' : 'file';
          return { name, kind, path: entryPath };
        })
        .sort((a, b) => {
          if (a.kind !== b.kind) {
            return a.kind === 'folder' ? -1 : 1;
          }
          return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
        });
    } catch (error) {
      throw mapNativeFsError(error, {
        message: `Failed to read directory: ${target}`,
        path: target,
      });
    }
  }

  async exists(path: NativeFsPath): Promise<boolean> {
    ensureTauriRuntime();
    const target = assertNonEmptyPath(path);
    try {
      const { exists } = await loadFs();
      return await exists(target);
    } catch (error) {
      throw mapNativeFsError(error, {
        message: `Failed to check path: ${target}`,
        path: target,
      });
    }
  }

  async stat(path: NativeFsPath): Promise<NativeFsStat> {
    ensureTauriRuntime();
    const target = assertNonEmptyPath(path);
    try {
      const { exists, stat } = await loadFs();
      if (!(await exists(target))) {
        throw new FileSystemServiceError('NOT_FOUND', `Path not found: ${target}`, {
          path: target,
        });
      }
      const meta = await stat(target);
      return {
        kind: meta.isDirectory ? 'folder' : 'file',
        size: meta.size ?? null,
        modifiedAt: meta.mtime ? meta.mtime.getTime() : null,
        createdAt: meta.birthtime ? meta.birthtime.getTime() : null,
      };
    } catch (error) {
      throw mapNativeFsError(error, {
        message: `Failed to stat path: ${target}`,
        path: target,
      });
    }
  }

  async watch(
    path: NativeFsPath,
    onEvent: (event: FsWatchEvent) => void,
    options: WatchPathOptions = {},
  ): Promise<FsUnwatchFn> {
    ensureTauriRuntime();
    const target = assertNonEmptyPath(path);
    try {
      const { exists, watch, watchImmediate } = await loadFs();
      if (!(await exists(target))) {
        throw new FileSystemServiceError('NOT_FOUND', `Path not found: ${target}`, {
          path: target,
        });
      }

      const recursive = options.recursive ?? true;
      const delayMs = options.delayMs ?? 250;
      const handler = (event: { paths: string[]; type: unknown }) => {
        onEvent({
          kind: mapWatchKind(event.type),
          paths: event.paths,
        });
      };

      const unwatch =
        delayMs > 0
          ? await watch(target, handler, { recursive, delayMs })
          : await watchImmediate(target, handler, { recursive });

      return () => {
        try {
          unwatch();
        } catch {
          // Ignore double-unwatch.
        }
      };
    } catch (error) {
      throw mapNativeFsError(error, {
        message: `Failed to watch path: ${target}`,
        path: target,
        code: 'WATCH_ERROR',
      });
    }
  }
}
