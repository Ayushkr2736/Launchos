import { cn } from '@launchos/ui';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type ButtonHTMLAttributes } from 'react';

const iconButtonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      size: {
        sm: 'h-7 w-7',
        md: 'h-8 w-8',
        lg: 'h-9 w-9',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

export interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof iconButtonVariants> {
  asChild?: boolean;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, size, asChild = false, type = 'button', ...props }, ref) => {
    if (asChild) {
      return <Slot ref={ref} className={cn(iconButtonVariants({ size }), className)} {...props} />;
    }

    return (
      <button
        ref={ref}
        type={type}
        className={cn(iconButtonVariants({ size }), className)}
        {...props}
      />
    );
  },
);
IconButton.displayName = 'IconButton';
