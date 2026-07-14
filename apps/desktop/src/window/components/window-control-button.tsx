import { cn } from '@launchos/ui';
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type ButtonHTMLAttributes } from 'react';

const windowControlButtonVariants = cva(
  'inline-flex h-8 w-11 items-center justify-center text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      intent: {
        default: 'hover:bg-accent hover:text-accent-foreground',
        danger: 'hover:bg-destructive hover:text-destructive-foreground',
      },
    },
    defaultVariants: {
      intent: 'default',
    },
  },
);

export interface WindowControlButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof windowControlButtonVariants> {}

export const WindowControlButton = forwardRef<HTMLButtonElement, WindowControlButtonProps>(
  ({ className, intent, type = 'button', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(windowControlButtonVariants({ intent }), className)}
        {...props}
      />
    );
  },
);
WindowControlButton.displayName = 'WindowControlButton';
