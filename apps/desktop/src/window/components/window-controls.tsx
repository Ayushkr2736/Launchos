import { Tooltip, TooltipContent, TooltipTrigger } from '@launchos/ui';
import { Maximize2, Minimize2, Minus, X } from 'lucide-react';

import { useWindowManager } from '@/hooks/use-window-manager';
import { WindowControlButton } from '@/window/components/window-control-button';

export function WindowControls() {
  const { isTauri, isMaximized, minimize, toggleMaximize, close } = useWindowManager();

  if (!isTauri) {
    return null;
  }

  return (
    <div className="window-controls flex h-full items-stretch" data-window-no-drag>
      <Tooltip>
        <TooltipTrigger asChild>
          <WindowControlButton
            aria-label="Minimize window"
            onClick={() => {
              void minimize();
            }}
          >
            <Minus className="h-3.5 w-3.5" aria-hidden />
          </WindowControlButton>
        </TooltipTrigger>
        <TooltipContent>Minimize</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <WindowControlButton
            aria-label={isMaximized ? 'Restore window' : 'Maximize window'}
            onClick={() => {
              void toggleMaximize();
            }}
          >
            {isMaximized ? (
              <Minimize2 className="h-3.5 w-3.5" aria-hidden />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" aria-hidden />
            )}
          </WindowControlButton>
        </TooltipTrigger>
        <TooltipContent>{isMaximized ? 'Restore' : 'Maximize'}</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <WindowControlButton
            intent="danger"
            aria-label="Close window"
            onClick={() => {
              void close();
            }}
          >
            <X className="h-3.5 w-3.5" aria-hidden />
          </WindowControlButton>
        </TooltipTrigger>
        <TooltipContent>Close</TooltipContent>
      </Tooltip>
    </div>
  );
}
