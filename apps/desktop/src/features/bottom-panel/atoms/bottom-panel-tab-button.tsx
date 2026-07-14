import { Kbd, cn } from '@launchos/ui';
import { motion } from 'framer-motion';

import type { BottomPanelTabConfig } from '@/features/bottom-panel/constants';

interface BottomPanelTabButtonProps {
  tab: BottomPanelTabConfig;
  active: boolean;
  onSelect: () => void;
}

export function BottomPanelTabButton({ tab, active, onSelect }: BottomPanelTabButtonProps) {
  const Icon = tab.icon;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      id={`bottom-panel-tab-${tab.id}`}
      tabIndex={active ? 0 : -1}
      onClick={onSelect}
      className={cn(
        'relative inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-xs transition-colors',
        active
          ? 'text-foreground'
          : 'text-muted-foreground hover:bg-accent/60 hover:text-accent-foreground',
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span>{tab.label}</span>
      {tab.shortcut && active ? (
        <Kbd className="ml-0.5 hidden sm:inline-flex">{tab.shortcut}</Kbd>
      ) : null}
      {active ? (
        <motion.span
          layoutId="bottom-panel-tab-indicator"
          className="bg-accent absolute inset-0 -z-10 rounded-md"
          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
        />
      ) : null}
    </button>
  );
}
