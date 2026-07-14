import { cn, ScrollArea } from '@launchos/ui';
import { ChevronRight, FileCode2 } from 'lucide-react';
import { useCallback, useMemo, useState, type KeyboardEvent } from 'react';

import type { SearchFileResult, SearchLineMatch } from '@/features/search/types';

import { SearchHighlight } from '@/features/search/atoms/search-highlight';
import { useSearchActions } from '@/features/search/hooks/use-search-actions';
import { useSearchStore } from '@/stores/search-store';

type ResultTarget =
  | { kind: 'file'; file: SearchFileResult }
  | { kind: 'match'; file: SearchFileResult; match: SearchLineMatch };

function SearchFileGroup({
  file,
  query,
  caseSensitive,
  expanded,
  focusedKey,
}: {
  file: SearchFileResult;
  query: string;
  caseSensitive: boolean;
  expanded: boolean;
  focusedKey: string | null;
}) {
  const toggleExpanded = useSearchStore((state) => state.toggleExpanded);
  const { openFileResult } = useSearchActions();
  const matchCount = file.matches.length + (file.filenameMatch ? 1 : 0);

  return (
    <div className="border-border/60 border-b">
      <button
        type="button"
        id={`search-result-file-${file.path}`}
        data-search-target={`file:${file.path}`}
        className={cn(
          'hover:bg-accent/60 flex w-full items-center gap-1 px-2 py-1.5 text-left text-xs',
          focusedKey === `file:${file.path}` && 'bg-accent/70 ring-ring ring-1 ring-inset',
        )}
        onClick={() => {
          if (file.matches.length === 0 && file.filenameMatch) {
            openFileResult(file);
            return;
          }
          toggleExpanded(file.path);
        }}
        onDoubleClick={() => {
          openFileResult(file);
        }}
      >
        <ChevronRight
          className={cn(
            'text-muted-foreground h-3.5 w-3.5 shrink-0 transition-transform',
            expanded && file.matches.length > 0 && 'rotate-90',
            file.matches.length === 0 && 'opacity-0',
          )}
          aria-hidden
        />
        <FileCode2 className="text-muted-foreground h-3.5 w-3.5 shrink-0" aria-hidden />
        <span className="text-foreground min-w-0 flex-1 truncate font-medium">
          <SearchHighlight text={file.name} query={query} caseSensitive={caseSensitive} />
        </span>
        <span className="text-muted-foreground shrink-0 text-[10px]">{matchCount}</span>
      </button>
      {file.filenameMatch ? (
        <button
          type="button"
          data-search-target={`filename:${file.path}`}
          className={cn(
            'text-muted-foreground hover:bg-accent/50 flex w-full items-center gap-2 py-1 pl-8 pr-2 text-left text-[11px]',
            focusedKey === `filename:${file.path}` && 'bg-accent/70 ring-ring ring-1 ring-inset',
          )}
          onClick={() => {
            openFileResult(file);
          }}
        >
          <span className="bg-muted rounded px-1 py-0.5 text-[10px] uppercase tracking-wide">
            filename
          </span>
          <span className="truncate">{file.path}</span>
        </button>
      ) : null}
      {expanded
        ? file.matches.map((match) => {
            const key = `match:${file.path}:${match.lineNumber}:${match.column}`;
            return (
              <button
                key={key}
                type="button"
                data-search-target={key}
                className={cn(
                  'hover:bg-accent/50 flex w-full gap-2 py-1 pl-8 pr-2 text-left text-[11px]',
                  focusedKey === key && 'bg-accent/70 ring-ring ring-1 ring-inset',
                )}
                onClick={() => {
                  openFileResult(file, match);
                }}
              >
                <span className="text-muted-foreground w-8 shrink-0 text-right">
                  {match.lineNumber}
                </span>
                <SearchHighlight
                  className="text-foreground min-w-0 flex-1 truncate font-mono"
                  text={match.preview}
                  query={query}
                  caseSensitive={caseSensitive}
                  matchIndex={match.matchIndex}
                  matchLength={match.matchLength}
                />
              </button>
            );
          })
        : null}
    </div>
  );
}

function buildTargets(
  results: readonly SearchFileResult[],
  expandedPaths: readonly string[],
): ResultTarget[] {
  const targets: ResultTarget[] = [];
  for (const file of results) {
    targets.push({ kind: 'file', file });
    if (file.filenameMatch) {
      // filename row is openable but we treat file header as primary
    }
    if (expandedPaths.includes(file.path)) {
      for (const match of file.matches) {
        targets.push({ kind: 'match', file, match });
      }
    }
  }
  return targets;
}

export function SearchResults() {
  const query = useSearchStore((state) => state.query);
  const options = useSearchStore((state) => state.options);
  const results = useSearchStore((state) => state.results);
  const status = useSearchStore((state) => state.status);
  const errorMessage = useSearchStore((state) => state.errorMessage);
  const progress = useSearchStore((state) => state.progress);
  const expandedPaths = useSearchStore((state) => state.expandedPaths);
  const expandPath = useSearchStore((state) => state.expandPath);
  const { openFileResult } = useSearchActions();
  const [focusIndex, setFocusIndex] = useState(0);

  const trimmed = query.trim();
  const fileHits = results.length;
  const lineHits = results.reduce((sum, file) => sum + file.matches.length, 0);
  const searching = status === 'searching';

  const targets = useMemo(() => buildTargets(results, expandedPaths), [expandedPaths, results]);

  const focusedKey = useMemo(() => {
    const target = targets[Math.min(focusIndex, Math.max(0, targets.length - 1))];
    if (!target) {
      return null;
    }
    if (target.kind === 'file') {
      return `file:${target.file.path}`;
    }
    return `match:${target.file.path}:${target.match.lineNumber}:${target.match.column}`;
  }, [focusIndex, targets]);

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (targets.length === 0) {
        return;
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setFocusIndex((index) => Math.min(index + 1, targets.length - 1));
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setFocusIndex((index) => Math.max(index - 1, 0));
        return;
      }
      if (event.key === 'ArrowRight') {
        const target = targets[focusIndex];
        if (target?.kind === 'file' && target.file.matches.length > 0) {
          event.preventDefault();
          expandPath(target.file.path);
        }
        return;
      }
      if (event.key === 'Enter') {
        event.preventDefault();
        const target = targets[focusIndex];
        if (!target) {
          return;
        }
        if (target.kind === 'file') {
          openFileResult(target.file, target.file.matches[0]);
        } else {
          openFileResult(target.file, target.match);
        }
      }
    },
    [expandPath, focusIndex, openFileResult, targets],
  );

  if (!trimmed) {
    return (
      <p className="text-muted-foreground px-3 py-8 text-center text-xs">
        Search filenames and text across the open workspace. Toggle Replace to rewrite matches.
      </p>
    );
  }

  if (searching && results.length === 0) {
    return (
      <p className="text-muted-foreground px-3 py-8 text-center text-xs">
        Searching
        {progress && progress.totalFiles > 0
          ? ` (${progress.scannedFiles}/${progress.totalFiles})`
          : '…'}
      </p>
    );
  }

  if (status === 'error') {
    return (
      <p className="text-destructive px-3 py-8 text-center text-xs">
        {errorMessage ?? 'Search failed'}
      </p>
    );
  }

  if (results.length === 0) {
    return (
      <p className="text-muted-foreground px-3 py-8 text-center text-xs">
        No results for “{trimmed}”.
      </p>
    );
  }

  return (
    <div
      className={cn('flex min-h-0 flex-1 flex-col outline-none', searching && 'opacity-70')}
      role="listbox"
      aria-label="Search results"
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <div className="border-border text-muted-foreground flex items-center justify-between border-b px-2 py-1.5 text-[10px]">
        <span>
          {fileHits} file{fileHits === 1 ? '' : 's'}
          {lineHits > 0 ? ` · ${lineHits} match${lineHits === 1 ? '' : 'es'}` : ''}
        </span>
        {searching && progress ? (
          <span>
            {progress.scannedFiles}/{progress.totalFiles}
          </span>
        ) : null}
      </div>
      <ScrollArea className="min-h-0 flex-1">
        {results.map((file) => (
          <SearchFileGroup
            key={file.path}
            file={file}
            query={trimmed}
            caseSensitive={options.caseSensitive}
            expanded={expandedPaths.includes(file.path)}
            focusedKey={focusedKey}
          />
        ))}
      </ScrollArea>
    </div>
  );
}
