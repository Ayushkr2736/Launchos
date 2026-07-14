import type { FsFileNode, FsFolderNode, FsNode, FsPath } from '@/features/explorer/fs/types';

import {
  FS_ROOT_PATH,
  getFsName,
  getFsParentPath,
  joinFsPath,
  normalizeFsPath,
} from '@/features/explorer/fs/path';

function now(): number {
  return Date.now();
}

function folder(path: FsPath, children: FsPath[], createdAt = now()): FsFolderNode {
  return {
    path: normalizeFsPath(path),
    name: getFsName(path),
    kind: 'folder',
    parentPath: getFsParentPath(path),
    children: children.map(normalizeFsPath),
    createdAt,
    updatedAt: createdAt,
  };
}

function file(path: FsPath, content: string, createdAt = now()): FsFileNode {
  return {
    path: normalizeFsPath(path),
    name: getFsName(path),
    kind: 'file',
    parentPath: getFsParentPath(path),
    content,
    createdAt,
    updatedAt: createdAt,
  };
}

/**
 * Seed tree for the mock filesystem — representative LaunchOS project chrome.
 * Not production data; replace when a real FS adapter is wired.
 */
export function createDefaultMockTree(): Record<FsPath, FsNode> {
  const stamp = now();
  const nodes: Record<FsPath, FsNode> = {};

  const add = (node: FsNode) => {
    nodes[node.path] = node;
  };

  add(
    folder(
      FS_ROOT_PATH,
      ['/apps', '/packages', '/docs', '/package.json', '/README.md', '/pnpm-workspace.yaml'],
      stamp,
    ),
  );

  add(folder('/apps', ['/apps/desktop', '/apps/api'], stamp));
  add(
    folder(
      '/apps/desktop',
      ['/apps/desktop/src', '/apps/desktop/package.json', '/apps/desktop/index.html'],
      stamp,
    ),
  );
  add(
    folder(
      '/apps/desktop/src',
      [
        '/apps/desktop/src/App.tsx',
        '/apps/desktop/src/main.tsx',
        '/apps/desktop/src/features',
        '/apps/desktop/src/layout',
      ],
      stamp,
    ),
  );
  add(folder('/apps/desktop/src/features', ['/apps/desktop/src/features/explorer'], stamp));
  add(
    folder(
      '/apps/desktop/src/features/explorer',
      ['/apps/desktop/src/features/explorer/explorer.tsx'],
      stamp,
    ),
  );
  add(folder('/apps/desktop/src/layout', ['/apps/desktop/src/layout/index.ts'], stamp));
  add(folder('/apps/api', ['/apps/api/src', '/apps/api/package.json'], stamp));
  add(folder('/apps/api/src', ['/apps/api/src/index.ts'], stamp));

  add(folder('/packages', ['/packages/ui', '/packages/types', '/packages/utils'], stamp));
  add(folder('/packages/ui', ['/packages/ui/src', '/packages/ui/package.json'], stamp));
  add(folder('/packages/ui/src', ['/packages/ui/src/index.ts'], stamp));
  add(folder('/packages/types', ['/packages/types/src', '/packages/types/package.json'], stamp));
  add(folder('/packages/types/src', ['/packages/types/src/index.ts'], stamp));
  add(folder('/packages/utils', ['/packages/utils/src', '/packages/utils/package.json'], stamp));
  add(folder('/packages/utils/src', ['/packages/utils/src/index.ts'], stamp));

  add(
    folder('/docs', ['/docs/architecture.md', '/docs/layout-engine.md', '/docs/sidebar.md'], stamp),
  );

  add(file('/package.json', '{\n  "name": "launchos",\n  "private": true\n}\n', stamp));
  add(file('/pnpm-workspace.yaml', 'packages:\n  - apps/*\n  - packages/*\n', stamp));
  add(file('/README.md', '# LaunchOS\n\nDesktop AI operating system.\n', stamp));
  add(
    file(
      '/apps/desktop/package.json',
      '{\n  "name": "@launchos/desktop",\n  "private": true\n}\n',
      stamp,
    ),
  );
  add(file('/apps/desktop/index.html', '<!doctype html>\n<html lang="en"></html>\n', stamp));
  add(file('/apps/desktop/src/App.tsx', 'export function App() {\n  return null;\n}\n', stamp));
  add(file('/apps/desktop/src/main.tsx', "import { App } from './App';\n", stamp));
  add(
    file(
      '/apps/desktop/src/features/explorer/explorer.tsx',
      'export function Explorer() {\n  return null;\n}\n',
      stamp,
    ),
  );
  add(file('/apps/desktop/src/layout/index.ts', 'export {};\n', stamp));
  add(
    file('/apps/api/package.json', '{\n  "name": "@launchos/api",\n  "private": true\n}\n', stamp),
  );
  add(file('/apps/api/src/index.ts', 'export {};\n', stamp));
  add(
    file(
      '/packages/ui/package.json',
      '{\n  "name": "@launchos/ui",\n  "private": true\n}\n',
      stamp,
    ),
  );
  add(file('/packages/ui/src/index.ts', 'export {};\n', stamp));
  add(
    file(
      '/packages/types/package.json',
      '{\n  "name": "@launchos/types",\n  "private": true\n}\n',
      stamp,
    ),
  );
  add(file('/packages/types/src/index.ts', 'export {};\n', stamp));
  add(
    file(
      '/packages/utils/package.json',
      '{\n  "name": "@launchos/utils",\n  "private": true\n}\n',
      stamp,
    ),
  );
  add(file('/packages/utils/src/index.ts', 'export {};\n', stamp));
  add(file('/docs/architecture.md', '# Architecture\n', stamp));
  add(file('/docs/layout-engine.md', '# Layout Engine\n', stamp));
  add(file('/docs/sidebar.md', '# Sidebar\n', stamp));

  return nodes;
}

export function uniqueChildName(
  parentPath: FsPath,
  baseName: string,
  existing: Set<string>,
): string {
  if (!existing.has(baseName)) {
    return baseName;
  }
  const dot = baseName.lastIndexOf('.');
  const hasExt = dot > 0;
  const stem = hasExt ? baseName.slice(0, dot) : baseName;
  const ext = hasExt ? baseName.slice(dot) : '';
  let index = 1;
  while (existing.has(`${stem} ${index}${ext}`)) {
    index += 1;
  }
  return `${stem} ${index}${ext}`;
}

export function suggestNewFileName(parentPath: FsPath, siblingNames: readonly string[]): string {
  return uniqueChildName(parentPath, 'untitled.ts', new Set(siblingNames));
}

export function suggestNewFolderName(parentPath: FsPath, siblingNames: readonly string[]): string {
  return uniqueChildName(parentPath, 'New Folder', new Set(siblingNames));
}

export { joinFsPath };
