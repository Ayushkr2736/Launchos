import { Separator } from '@launchos/ui';

import { AiProviderIndicator } from '@/features/title-bar/ai-provider-indicator';
import { BranchIndicator } from '@/features/title-bar/branch-indicator';
import { CommandPaletteTrigger } from '@/features/title-bar/command-palette-trigger';
import { NotificationsButton } from '@/features/title-bar/notifications-button';
import { SearchTrigger } from '@/features/title-bar/search-trigger';
import { WorkspaceName } from '@/features/title-bar/workspace-name';
import { ThemeToggle } from '@/theme';
import { WindowControls, WindowDragRegion } from '@/window';

export function TitleBar() {
  return (
    <header className="border-border bg-background flex h-[var(--shell-titlebar-height,2.75rem)] shrink-0 items-stretch border-b">
      <WindowDragRegion className="flex min-w-0 flex-1 items-center gap-3 px-3">
        <WorkspaceName />
        <Separator orientation="vertical" className="h-4 shrink-0" />
        <div data-window-no-drag className="flex min-w-0 flex-1 items-center gap-2">
          <SearchTrigger />
          <CommandPaletteTrigger />
        </div>
      </WindowDragRegion>

      <WindowDragRegion className="flex shrink-0 items-center gap-1 px-1">
        <div data-window-no-drag className="flex items-center gap-1">
          <BranchIndicator />
          <AiProviderIndicator />
          <NotificationsButton />
          <ThemeToggle />
        </div>
        <WindowControls />
      </WindowDragRegion>
    </header>
  );
}
