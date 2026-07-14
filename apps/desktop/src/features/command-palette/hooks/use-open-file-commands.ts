import { FileCode2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import type { CommandPaletteItem } from '@/features/command-palette/types';
import type { FileSystemProvider, FsNode, FsPath } from '@/features/explorer/fs/types';

import { COMMAND_PALETTE_OPEN_FILE_MAX } from '@/features/command-palette/constants';
import { runAndClose } from '@/features/command-palette/lib/palette-actions';
import { FS_ROOT_PATH } from '@/features/explorer/fs/path';
import { useFileSystem } from '@/features/explorer/fs/use-file-system';
import { useLayoutStore } from '@/stores/layout-store';
import { useProjectStore } from '@/stores/project-store';
import { useRecentFilesStore } from '@/stores/recent-files-store';
import { useSidebarStore } from '@/stores/sidebar-store';
import { useWorkspaceStore } from '@/stores/workspace-store';

interface FileIndexCache {
  workspacePath: string;
  files: FsNode[];
}

let fileIndexCache: FileIndexCache | null = null;

function collectFiles(fs: FileSystemProvider, path: FsPath, out: FsNode[], max: number): void {
  if (out.length >= max) {
    return;
  }
  for (const child of fs.listChildren(path)) {
    if (out.length >= max) {
      return;
    }
    if (child.kind === 'file') {
      out.push(child);
      continue;
    }
    collectFiles(fs, child.path, out, max);
  }
}

function scoreFile(query: string, name: string, path: string): number {
  const q = query.toLowerCase();
  if (!q) {
    return 1;
  }
  const n = name.toLowerCase();
  const p = path.toLowerCase();
  if (n === q) {
    return 100;
  }
  if (n.startsWith(q)) {
    return 80;
  }
  if (n.includes(q)) {
    return 60;
  }
  // Fuzzy subsequence on file name.
  let qi = 0;
  for (let i = 0; i < n.length && qi < q.length; i += 1) {
    if (n[i] === q[qi]) {
      qi += 1;
    }
  }
  if (qi === q.length) {
    return 50;
  }
  if (p.includes(q)) {
    return 40;
  }
  return 0;
}

/**
 * Workspace file index for the Open File group (⌘P-style inside ⌘K).
 * Results appear once the user starts typing a name/path.
 */
export function useOpenFileCommands(query: string): CommandPaletteItem[] {
  const open = useLayoutStore((state) => state.commandPaletteOpen);
  const workspacePath = useProjectStore((state) => state.workspacePath);
  const fs = useFileSystem();
  const openTab = useWorkspaceStore((state) => state.openTab);
  const setActiveSection = useSidebarStore((state) => state.setActiveSection);
  const addRecentFile = useRecentFilesStore((state) => state.addRecentFile);
  const [files, setFiles] = useState<FsNode[]>(() =>
    workspacePath && fileIndexCache?.workspacePath === workspacePath ? fileIndexCache.files : [],
  );
  const [indexing, setIndexing] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    if (!open || !workspacePath) {
      if (!workspacePath) {
        fileIndexCache = null;
        setFiles([]);
      }
      return;
    }

    if (fileIndexCache?.workspacePath === workspacePath && fileIndexCache.files.length > 0) {
      setFiles(fileIndexCache.files);
      return;
    }

    const id = ++requestId.current;
    let cancelled = false;
    setIndexing(true);

    void (async () => {
      try {
        await fs.indexTree(FS_ROOT_PATH);
        if (cancelled || id !== requestId.current) {
          return;
        }
        const collected: FsNode[] = [];
        collectFiles(fs, FS_ROOT_PATH, collected, 2_000);
        fileIndexCache = { workspacePath, files: collected };
        setFiles(collected);
      } catch {
        if (!cancelled && id === requestId.current) {
          setFiles([]);
        }
      } finally {
        if (!cancelled && id === requestId.current) {
          setIndexing(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fs, open, workspacePath]);

  return useMemo(() => {
    if (!workspacePath) {
      return [];
    }

    const trimmed = query.trim();
    // Don't flood the empty palette — Open File appears once typing begins.
    if (!trimmed) {
      return [];
    }

    const ranked = files
      .map((file) => ({
        file,
        score: scoreFile(trimmed, file.name, file.path),
      }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || a.file.name.localeCompare(b.file.name))
      .slice(0, COMMAND_PALETTE_OPEN_FILE_MAX);

    if (ranked.length === 0 && indexing) {
      return [
        {
          id: 'open-file.indexing',
          group: 'open-file' as const,
          label: 'Indexing workspace files…',
          keywords: ['open', 'file', 'index'],
          icon: FileCode2,
          disabled: true,
          run: () => undefined,
        },
      ];
    }

    return ranked.map(({ file }) => ({
      id: `open-file.${file.path}`,
      group: 'open-file' as const,
      label: file.name,
      keywords: ['open', 'file', 'go to', file.name, file.path],
      icon: FileCode2,
      hint: file.path,
      run: runAndClose(() => {
        openTab({
          id: file.path,
          title: file.name,
          closable: true,
          kind: 'file',
          path: file.path,
        });
        addRecentFile({ id: file.path, name: file.name, path: file.path });
        setActiveSection('code');
      }),
    }));
  }, [addRecentFile, files, indexing, openTab, query, setActiveSection, workspacePath]);
}
