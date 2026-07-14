import { AnimatePresence, motion } from 'framer-motion';

import type { ReactNode } from 'react';

import { LAYOUT_ANIMATION } from '@/layout/constants';

interface AnimatedPanelFrameProps {
  open: boolean;
  side?: 'left' | 'right' | 'bottom';
  children: ReactNode;
  className?: string;
}

const OFFSET: Record<'left' | 'right' | 'bottom', { x?: number; y?: number }> = {
  left: { x: -16 },
  right: { x: 16 },
  bottom: { y: 12 },
};

export function AnimatedPanelFrame({
  open,
  side = 'left',
  children,
  className,
}: AnimatedPanelFrameProps) {
  const offset = OFFSET[side];

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      {open ? (
        <motion.div
          key="panel-frame"
          className={className ?? 'h-full min-h-0 w-full min-w-0'}
          initial={{ opacity: 0, ...offset }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, ...offset }}
          transition={{ duration: LAYOUT_ANIMATION.fadeMs / 1000, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
