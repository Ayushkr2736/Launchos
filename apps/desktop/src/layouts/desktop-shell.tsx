import { AiPanel } from '@/features/ai-panel';
import { BottomPanel } from '@/features/bottom-panel';
import { CommandPalette } from '@/features/command-palette';
import { GitStatusBar } from '@/features/git';
import { LeftPanel } from '@/features/left-panel';
import { Sidebar } from '@/features/sidebar';
import { TitleBar } from '@/features/title-bar';
import { Workspace } from '@/features/workspace';
import { LayoutEngine } from '@/layout';
import { ProjectFileSystemHost } from '@/providers/project-file-system-host';

/**
 * Desktop shell composition — wires feature regions into the Layout Engine.
 * Layout chrome only; no business logic.
 */
export function DesktopShell() {
  return (
    <ProjectFileSystemHost>
      <LayoutEngine
        className="layout-root shell-root bg-background text-foreground flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden"
        slots={{
          titleBar: <TitleBar />,
          sidebar: <Sidebar />,
          explorer: <LeftPanel />,
          workspace: <Workspace />,
          aiPanel: <AiPanel />,
          bottomPanel: <BottomPanel />,
          statusBar: <GitStatusBar />,
          overlay: <CommandPalette />,
        }}
      />
    </ProjectFileSystemHost>
  );
}
