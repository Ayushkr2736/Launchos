import { LayoutResizeHandle } from '@/layout';

interface ShellResizeHandleProps {
  className?: string;
}

/** @deprecated Prefer `LayoutResizeHandle` from `@/layout`. */
export function ShellResizeHandle({ className }: ShellResizeHandleProps) {
  return <LayoutResizeHandle className={className} />;
}
