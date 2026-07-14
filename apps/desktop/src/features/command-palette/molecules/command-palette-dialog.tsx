import { cn } from '@launchos/ui';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { type ReactNode } from 'react';

import { COMMAND_PALETTE_ANIMATION } from '@/features/command-palette/constants';

interface CommandPaletteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

/**
 * Animated modal shell for the command palette (overlay + panel).
 * Keyboard: Escape closes (Radix); focus trapped while open.
 */
export function CommandPaletteDialog({ open, onOpenChange, children }: CommandPaletteDialogProps) {
  const overlaySec = COMMAND_PALETTE_ANIMATION.overlayMs / 1000;
  const panelSec = COMMAND_PALETTE_ANIMATION.panelMs / 1000;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open ? (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild>
              <motion.div
                className="fixed inset-0 z-50 bg-black/55"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: overlaySec, ease: 'easeOut' }}
              />
            </DialogPrimitive.Overlay>
            <DialogPrimitive.Content
              asChild
              onOpenAutoFocus={(event) => {
                event.preventDefault();
                const root = event.currentTarget as HTMLElement | null;
                root?.querySelector<HTMLElement>('[cmdk-input], input')?.focus();
              }}
            >
              <motion.div
                role="dialog"
                aria-modal="true"
                className={cn(
                  'fixed left-1/2 top-[16%] z-50 w-[min(40rem,calc(100vw-2rem))] -translate-x-1/2',
                  'border-border/80 bg-popover text-popover-foreground overflow-hidden rounded-xl border',
                  'ring-border/60 shadow-2xl outline-none ring-1',
                )}
                initial={{ opacity: 0, scale: 0.97, y: -12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -8 }}
                transition={{
                  duration: panelSec,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <DialogPrimitive.Title className="sr-only">Command palette</DialogPrimitive.Title>
                <DialogPrimitive.Description className="sr-only">
                  Search commands, open files, navigate, change theme, run git actions, or switch
                  agents. Use arrow keys to navigate and Enter to run.
                </DialogPrimitive.Description>
                {children}
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        ) : null}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}
