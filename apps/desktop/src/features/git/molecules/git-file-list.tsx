import { Button, cn } from '@launchos/ui';
import { Minus, Plus } from 'lucide-react';

import type { GitFileEntry } from '@/features/git/types';

interface GitFileListProps {
  title: string;
  files: GitFileEntry[];
  emptyLabel: string;
  selectedPath: string | null;
  selectedStaged: boolean;
  sectionStaged: boolean;
  onSelect: (file: GitFileEntry) => void;
  onToggleStage: (file: GitFileEntry) => void;
  onToggleAll?: () => void;
  toggleAllLabel?: string;
}

function statusColor(status: string): string {
  switch (status) {
    case 'A':
    case '?':
      return 'text-emerald-500';
    case 'D':
      return 'text-destructive';
    case 'M':
    case 'R':
    case 'C':
    case 'T':
      return 'text-amber-500';
    case 'U':
      return 'text-orange-500';
    default:
      return 'text-muted-foreground';
  }
}

export function GitFileList({
  title,
  files,
  emptyLabel,
  selectedPath,
  selectedStaged,
  sectionStaged,
  onSelect,
  onToggleStage,
  onToggleAll,
  toggleAllLabel,
}: GitFileListProps) {
  return (
    <section className="border-border border-b">
      <div className="flex h-7 items-center justify-between gap-2 px-2">
        <p className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wide">
          {title}
          {files.length > 0 ? (
            <span className="ml-1 font-normal normal-case">({files.length})</span>
          ) : null}
        </p>
        {onToggleAll && files.length > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 px-1.5 text-[10px]"
            onClick={onToggleAll}
          >
            {toggleAllLabel}
          </Button>
        ) : null}
      </div>
      {files.length === 0 ? (
        <p className="text-muted-foreground px-3 pb-2 text-[11px]">{emptyLabel}</p>
      ) : (
        <ul className="pb-1">
          {files.map((file) => {
            const selected = selectedPath === file.path && selectedStaged === sectionStaged;
            return (
              <li key={`${sectionStaged ? 's' : 'u'}:${file.path}`}>
                <div
                  className={cn(
                    'group flex w-full items-center gap-1 px-1.5 py-0.5 text-left text-xs',
                    selected ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50',
                  )}
                >
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 items-center gap-2 px-1 py-0.5"
                    onClick={() => {
                      onSelect(file);
                    }}
                  >
                    <span
                      className={cn(
                        'w-3 shrink-0 text-center font-mono text-[10px] font-semibold',
                        statusColor(file.status),
                      )}
                    >
                      {file.status}
                    </span>
                    <span className="truncate" title={file.path}>
                      {file.path}
                    </span>
                  </button>
                  <button
                    type="button"
                    className="hover:bg-background/50 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded opacity-0 group-hover:opacity-100"
                    aria-label={sectionStaged ? `Unstage ${file.path}` : `Stage ${file.path}`}
                    onClick={() => {
                      onToggleStage(file);
                    }}
                  >
                    {sectionStaged ? (
                      <Minus className="h-3 w-3" aria-hidden />
                    ) : (
                      <Plus className="h-3 w-3" aria-hidden />
                    )}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
