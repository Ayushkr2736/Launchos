import { Button, cn } from '@launchos/ui';

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  children?: ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex h-full min-h-[12rem] flex-col items-center justify-center gap-3 px-6 text-center',
        className,
      )}
    >
      <div className="bg-muted text-muted-foreground flex h-11 w-11 items-center justify-center rounded-full">
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <div className="space-y-1">
        <h3 className="text-foreground text-sm font-medium">{title}</h3>
        <p className="text-muted-foreground max-w-sm text-sm">{description}</p>
      </div>
      {actionLabel && onAction ? (
        <Button type="button" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
      {children}
    </div>
  );
}
