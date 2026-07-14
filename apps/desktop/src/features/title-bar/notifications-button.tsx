import { Tooltip, TooltipContent, TooltipTrigger } from '@launchos/ui';
import { Bell } from 'lucide-react';

import { IconButton } from '@/components/atoms/icon-button';
import { ShellSlot } from '@/components/organisms/shell-slot';

export function NotificationsButton() {
  return (
    <ShellSlot
      slot="titlebar.notifications"
      fallback={
        <Tooltip>
          <TooltipTrigger asChild>
            <IconButton aria-label="Notifications">
              <Bell className="h-4 w-4" />
            </IconButton>
          </TooltipTrigger>
          <TooltipContent>No notifications</TooltipContent>
        </Tooltip>
      }
    />
  );
}
