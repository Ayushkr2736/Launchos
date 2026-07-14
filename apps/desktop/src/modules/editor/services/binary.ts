const BINARY_EXTENSIONS = new Set([
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'ico',
  'bmp',
  'tif',
  'tiff',
  'psd',
  'ai',
  'pdf',
  'zip',
  'gz',
  'tgz',
  'rar',
  '7z',
  'tar',
  'bz2',
  'xz',
  'exe',
  'dll',
  'so',
  'dylib',
  'bin',
  'dat',
  'wasm',
  'class',
  'o',
  'a',
  'lib',
  'dmg',
  'iso',
  'img',
  'mp3',
  'mp4',
  'mov',
  'avi',
  'mkv',
  'wav',
  'flac',
  'ogg',
  'woff',
  'woff2',
  'ttf',
  'otf',
  'eot',
  'sqlite',
  'db',
  'lockb',
]);

function extensionOf(pathOrName: string): string {
  const base = pathOrName.split(/[/\\]/).pop() ?? pathOrName;
  const dot = base.lastIndexOf('.');
  if (dot <= 0) {
    return '';
  }
  return base.slice(dot + 1).toLowerCase();
}

/** True when the path extension is a known binary/media type. */
export function isBinaryFilePath(pathOrName: string): boolean {
  const ext = extensionOf(pathOrName);
  return ext.length > 0 && BINARY_EXTENSIONS.has(ext);
}

/** Heuristic: NUL bytes in the first chunk indicate binary content. */
export function contentLooksBinary(content: string, sampleSize = 8000): boolean {
  const sample = content.slice(0, sampleSize);
  return sample.includes('\0');
}
