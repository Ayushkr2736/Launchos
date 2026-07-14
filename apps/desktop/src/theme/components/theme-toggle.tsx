import { Tooltip, TooltipContent, TooltipTrigger, cn } from '@launchos/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { Moon, Sun, SunMoon } from 'lucide-react';

import type { ThemeMode } from '@/theme/types';

import { IconButton } from '@/components/atoms/icon-button';
import { useTheme } from '@/hooks/use-theme';

const THEME_META: Record<ThemeMode, { label: string; Icon: typeof Sun }> = {
  light: { label: 'Light theme', Icon: Sun },
  dark: { label: 'Dark theme', Icon: Moon },
  system: { label: 'System theme', Icon: SunMoon },
};

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { mode, cycleMode } = useTheme();
  const { label, Icon } = THEME_META[mode];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <IconButton
          aria-label={`Theme: ${label}. Click to cycle.`}
          className={cn(className)}
          onClick={cycleMode}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={mode}
              initial={{ opacity: 0, rotate: -45, scale: 0.8 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 45, scale: 0.8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="inline-flex"
            >
              <Icon className="h-4 w-4" aria-hidden />
            </motion.span>
          </AnimatePresence>
        </IconButton>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
