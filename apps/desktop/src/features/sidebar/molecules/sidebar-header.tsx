import { cn } from '@launchos/ui';
import { PanelLeftClose } from 'lucide-react';

import { IconButton } from '@/components/atoms/icon-button';

interface SidebarHeaderProps {
  collapsed: boolean;
  onExpand: () => void;
  onCollapse: () => void;
}

export function SidebarHeader({ collapsed, onExpand, onCollapse }: SidebarHeaderProps) {
  return (
    <div
      className={cn(
        'border-sidebar-border flex h-11 shrink-0 items-center border-b px-2',
        collapsed ? 'justify-center' : 'justify-between',
      )}
    >
      {collapsed ? (
        <button
          type="button"
          className="text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:ring-ring flex h-8 w-8 items-center justify-center rounded-md text-[10px] font-bold tracking-tight transition-colors focus-visible:outline-none focus-visible:ring-2"
          aria-label="Open LaunchOS sidebar"
          title="Open LaunchOS"
          onClick={onExpand}
        >
          L
        </button>
      ) : (
        <>
          <button
            type="button"
            className="text-sidebar-foreground/70 hover:text-sidebar-foreground focus-visible:ring-ring rounded-md px-1 text-left text-xs font-semibold tracking-[0.18em] transition-colors focus-visible:outline-none focus-visible:ring-2"
            aria-label="Collapse LaunchOS sidebar"
            onClick={onCollapse}
          >
            LAUNCHOS
          </button>
          <IconButton aria-label="Collapse sidebar" aria-expanded onClick={onCollapse}>
            <PanelLeftClose className="h-4 w-4" aria-hidden />
          </IconButton>
        </>
      )}
    </div>
  );
}
