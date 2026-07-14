import {
  Braces,
  File,
  FileCode2,
  FileJson,
  FileText,
  FileType2,
  Folder,
  FolderOpen,
  Image,
  Settings2,
  Terminal,
} from 'lucide-react';

import type { FsNode } from '@/features/explorer/fs/types';
import type { LucideIcon } from 'lucide-react';

const EXT_ICONS: Record<string, LucideIcon> = {
  ts: FileCode2,
  tsx: FileCode2,
  js: FileCode2,
  jsx: FileCode2,
  mjs: FileCode2,
  cjs: FileCode2,
  json: FileJson,
  jsonc: FileJson,
  md: FileText,
  mdx: FileText,
  txt: FileText,
  css: Braces,
  scss: Braces,
  sass: Braces,
  less: Braces,
  html: FileType2,
  htm: FileType2,
  svg: Image,
  png: Image,
  jpg: Image,
  jpeg: Image,
  gif: Image,
  webp: Image,
  ico: Image,
  yaml: Settings2,
  yml: Settings2,
  toml: Settings2,
  env: Settings2,
  rs: FileCode2,
  go: FileCode2,
  py: FileCode2,
  sh: Terminal,
  bash: Terminal,
  zsh: Terminal,
  fish: Terminal,
};

const NAME_ICONS: Record<string, LucideIcon> = {
  'package.json': FileJson,
  'tsconfig.json': Settings2,
  'jsconfig.json': Settings2,
  'cargo.toml': Settings2,
  dockerfile: Settings2,
  makefile: Terminal,
  'readme.md': FileText,
  license: FileText,
  '.gitignore': Settings2,
  '.env': Settings2,
  '.env.local': Settings2,
};

export function getFileIcon(node: FsNode, expanded = false): LucideIcon {
  if (node.kind === 'folder') {
    return expanded ? FolderOpen : Folder;
  }

  const lower = node.name.toLowerCase();
  const byName = NAME_ICONS[lower];
  if (byName) {
    return byName;
  }

  const dot = lower.lastIndexOf('.');
  if (dot > 0) {
    const ext = lower.slice(dot + 1);
    const byExt = EXT_ICONS[ext];
    if (byExt) {
      return byExt;
    }
  }

  return File;
}

/** Soft accent for common folder/file kinds (VS Code–like cues). */
export function getFileIconClass(node: FsNode, selected: boolean): string {
  if (node.kind === 'folder') {
    return selected ? 'text-sky-400' : 'text-sky-500';
  }
  const lower = node.name.toLowerCase();
  if (/\.(tsx?|jsx?|mjs|cjs)$/.test(lower)) {
    return selected ? 'text-accent-foreground' : 'text-amber-500/90';
  }
  if (/\.(json|jsonc)$/.test(lower) || lower === 'package.json') {
    return selected ? 'text-accent-foreground' : 'text-yellow-500/90';
  }
  if (/\.(css|scss|sass|less)$/.test(lower)) {
    return selected ? 'text-accent-foreground' : 'text-fuchsia-500/80';
  }
  if (/\.(png|jpe?g|gif|webp|svg|ico)$/.test(lower)) {
    return selected ? 'text-accent-foreground' : 'text-emerald-500/80';
  }
  return selected ? 'text-accent-foreground' : 'text-muted-foreground';
}
