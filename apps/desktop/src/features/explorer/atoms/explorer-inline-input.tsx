import { cn } from '@launchos/ui';
import { useEffect, useRef, type KeyboardEvent } from 'react';

import { explorerDepthClass } from '@/features/explorer/utils/depth-class';

interface ExplorerInlineInputProps {
  initialValue: string;
  depth: number;
  ariaLabel: string;
  errorMessage?: string | null;
  onSubmit: (value: string) => boolean | void;
  onCancel: () => void;
}

export function ExplorerInlineInput({
  initialValue,
  depth,
  ariaLabel,
  errorMessage = null,
  onSubmit,
  onCancel,
}: ExplorerInlineInputProps) {
  const ref = useRef<HTMLInputElement>(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    const input = ref.current;
    if (!input) {
      return;
    }
    input.focus();
    const dot = initialValue.lastIndexOf('.');
    if (dot > 0) {
      input.setSelectionRange(0, dot);
    } else {
      input.select();
    }
  }, [initialValue]);

  const commit = (value: string) => {
    if (submittedRef.current) {
      return;
    }
    submittedRef.current = true;
    const result = onSubmit(value);
    if (result === false) {
      submittedRef.current = false;
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      commit(event.currentTarget.value);
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      submittedRef.current = true;
      onCancel();
    }
  };

  return (
    <div className={cn('flex flex-col gap-0.5 py-0.5 pr-2', explorerDepthClass(depth))}>
      <input
        ref={ref}
        aria-label={ariaLabel}
        aria-invalid={Boolean(errorMessage)}
        defaultValue={initialValue}
        onKeyDown={handleKeyDown}
        onClick={(event) => {
          event.stopPropagation();
        }}
        onBlur={(event) => {
          commit(event.currentTarget.value);
        }}
        className={cn(
          'bg-background text-foreground h-7 w-full rounded-sm border px-1.5 text-sm outline-none transition-colors',
          errorMessage ? 'border-destructive' : 'border-ring',
        )}
      />
      {errorMessage ? <p className="text-destructive px-0.5 text-[10px]">{errorMessage}</p> : null}
    </div>
  );
}
