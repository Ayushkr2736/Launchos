export type FileSystemServiceErrorCode =
  | 'NOT_FOUND'
  | 'ALREADY_EXISTS'
  | 'INVALID_NAME'
  | 'INVALID_PATH'
  | 'PERMISSION_DENIED'
  | 'NOT_A_FILE'
  | 'NOT_A_FOLDER'
  | 'CANCELLED'
  | 'UNSUPPORTED'
  | 'IO_ERROR'
  | 'WATCH_ERROR'
  | 'UNKNOWN';

export class FileSystemServiceError extends Error {
  readonly code: FileSystemServiceErrorCode;
  readonly path?: string;

  constructor(
    code: FileSystemServiceErrorCode,
    message: string,
    options?: { path?: string; cause?: unknown },
  ) {
    super(message, options?.cause !== undefined ? { cause: options.cause } : undefined);
    this.name = 'FileSystemServiceError';
    this.code = code;
    if (options?.path !== undefined) {
      this.path = options.path;
    }
  }
}

export function isFileSystemServiceError(error: unknown): error is FileSystemServiceError {
  return error instanceof FileSystemServiceError;
}

function extractMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message === 'string') {
      return message;
    }
  }
  return 'Unknown filesystem error';
}

/**
 * Map low-level Tauri / OS errors into typed `FileSystemServiceError`s.
 */
export function mapNativeFsError(
  error: unknown,
  fallback: { code?: FileSystemServiceErrorCode; message: string; path?: string },
): FileSystemServiceError {
  if (isFileSystemServiceError(error)) {
    return error;
  }

  const message = extractMessage(error);
  const lower = message.toLowerCase();
  const path = fallback.path;

  if (
    lower.includes('not found') ||
    lower.includes('no such file') ||
    lower.includes('os error 2') ||
    lower.includes('errno: 2')
  ) {
    return new FileSystemServiceError('NOT_FOUND', message || fallback.message, {
      ...(path !== undefined ? { path } : {}),
      cause: error,
    });
  }

  if (
    lower.includes('already exists') ||
    lower.includes('file exists') ||
    lower.includes('os error 17') ||
    lower.includes('eexist')
  ) {
    return new FileSystemServiceError('ALREADY_EXISTS', message || fallback.message, {
      ...(path !== undefined ? { path } : {}),
      cause: error,
    });
  }

  if (
    lower.includes('permission') ||
    lower.includes('forbidden') ||
    lower.includes('access is denied') ||
    lower.includes('not allowed') ||
    lower.includes('scope')
  ) {
    return new FileSystemServiceError('PERMISSION_DENIED', message || fallback.message, {
      ...(path !== undefined ? { path } : {}),
      cause: error,
    });
  }

  if (lower.includes('not a directory') || lower.includes('is a file')) {
    return new FileSystemServiceError('NOT_A_FOLDER', message || fallback.message, {
      ...(path !== undefined ? { path } : {}),
      cause: error,
    });
  }

  if (lower.includes('is a directory') || lower.includes('not a file')) {
    return new FileSystemServiceError('NOT_A_FILE', message || fallback.message, {
      ...(path !== undefined ? { path } : {}),
      cause: error,
    });
  }

  if (lower.includes('watch')) {
    return new FileSystemServiceError('WATCH_ERROR', message || fallback.message, {
      ...(path !== undefined ? { path } : {}),
      cause: error,
    });
  }

  return new FileSystemServiceError(fallback.code ?? 'IO_ERROR', message || fallback.message, {
    ...(path !== undefined ? { path } : {}),
    cause: error,
  });
}

/** User-facing copy for workspace open / restore failures. */
export function describeWorkspaceError(error: unknown): string {
  if (isFileSystemServiceError(error)) {
    switch (error.code) {
      case 'PERMISSION_DENIED':
        return 'Permission denied. Choose a folder LaunchOS can access (for example under your home, Documents, Desktop, or Downloads), or grant access in system privacy settings.';
      case 'NOT_FOUND':
        return 'That folder no longer exists on disk. Open a different folder.';
      case 'NOT_A_FOLDER':
        return 'The selected path is not a folder.';
      case 'UNSUPPORTED':
        return 'Opening folders requires the LaunchOS desktop app.';
      case 'CANCELLED':
        return 'Folder selection was cancelled.';
      default:
        return error.message || 'Failed to open folder.';
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return 'Failed to open folder.';
}

export function workspaceErrorCode(error: unknown): FileSystemServiceErrorCode | null {
  return isFileSystemServiceError(error) ? error.code : null;
}
