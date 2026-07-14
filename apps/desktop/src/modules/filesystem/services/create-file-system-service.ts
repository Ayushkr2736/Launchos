import type {
  CreateFileOptions,
  FileSystemService,
  FsUnwatchFn,
  FsWatchEvent,
  NativeFsDirEntry,
  NativeFsPath,
  NativeFsStat,
  OpenFileOptions,
  OpenFolderOptions,
  SaveAsOptions,
  WatchPathOptions,
} from '@/modules/filesystem/types';

import { FileSystemServiceError } from '@/modules/filesystem/services/errors';
import { TauriFileSystemService } from '@/modules/filesystem/services/tauri-file-system-service';
import { detectTauriRuntime } from '@/window/native';

/**
 * Fallback used in Vite browser preview — never talks to disk.
 * Surfaces a typed UNSUPPORTED error so callers can branch without crashing.
 */
class UnsupportedFileSystemService implements FileSystemService {
  readonly id = 'unsupported-fs';

  private fail(operation: string): never {
    throw new FileSystemServiceError(
      'UNSUPPORTED',
      `FileSystemService.${operation} requires the Tauri desktop runtime.`,
    );
  }

  openFolder(_options?: OpenFolderOptions): Promise<NativeFsPath | null> {
    return this.fail('openFolder');
  }

  openFile(_options?: OpenFileOptions): Promise<NativeFsPath | null> {
    return this.fail('openFile');
  }

  saveAsDialog(_options?: SaveAsOptions): Promise<NativeFsPath | null> {
    return this.fail('saveAsDialog');
  }

  readFile(_path: NativeFsPath): Promise<string> {
    return this.fail('readFile');
  }

  writeFile(_path: NativeFsPath, _content: string): Promise<void> {
    return this.fail('writeFile');
  }

  saveFile(_path: NativeFsPath, _content: string): Promise<void> {
    return this.fail('saveFile');
  }

  saveAs(_content: string, _options?: SaveAsOptions): Promise<NativeFsPath | null> {
    return this.fail('saveAs');
  }

  rename(_path: NativeFsPath, _nextName: string): Promise<NativeFsPath> {
    return this.fail('rename');
  }

  move(_path: NativeFsPath, _targetFolderPath: NativeFsPath): Promise<NativeFsPath> {
    return this.fail('move');
  }

  copy(_source: NativeFsPath, _destination: NativeFsPath): Promise<NativeFsPath> {
    return this.fail('copy');
  }

  delete(_path: NativeFsPath): Promise<void> {
    return this.fail('delete');
  }

  createFile(
    _parentPath: NativeFsPath,
    _name: string,
    _options?: CreateFileOptions,
  ): Promise<NativeFsPath> {
    return this.fail('createFile');
  }

  createFolder(_parentPath: NativeFsPath, _name: string): Promise<NativeFsPath> {
    return this.fail('createFolder');
  }

  readDir(_path: NativeFsPath): Promise<readonly NativeFsDirEntry[]> {
    return this.fail('readDir');
  }

  exists(_path: NativeFsPath): Promise<boolean> {
    return this.fail('exists');
  }

  stat(_path: NativeFsPath): Promise<NativeFsStat> {
    return this.fail('stat');
  }

  watch(
    _path: NativeFsPath,
    _onEvent: (event: FsWatchEvent) => void,
    _options?: WatchPathOptions,
  ): Promise<FsUnwatchFn> {
    return this.fail('watch');
  }
}

/** Create the platform-appropriate filesystem service (no UI). */
export function createFileSystemService(): FileSystemService {
  if (detectTauriRuntime()) {
    return new TauriFileSystemService();
  }
  return new UnsupportedFileSystemService();
}

/** Shared app-level instance. Prefer injecting `FileSystemService` in tests. */
export const fileSystemService: FileSystemService = createFileSystemService();
