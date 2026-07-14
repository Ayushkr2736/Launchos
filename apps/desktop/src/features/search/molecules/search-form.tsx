import { Button, cn } from '@launchos/ui';
import { CaseSensitive, ChevronDown, Regex, Replace, WholeWord } from 'lucide-react';
import { useRef, type ReactNode } from 'react';

import { SearchField } from '@/components/molecules/search-field';
import { useSearchReplace } from '@/features/search/hooks/use-search-replace';
import {
  useReplaceInputFocusRegistration,
  useSearchInputFocusRegistration,
} from '@/features/search/hooks/use-search-shortcut';
import { useSearchStore } from '@/stores/search-store';

function OptionToggle({
  pressed,
  label,
  title,
  onPressedChange,
  children,
}: {
  pressed: boolean;
  label: string;
  title: string;
  onPressedChange: (next: boolean) => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      aria-label={label}
      title={title}
      onClick={() => {
        onPressedChange(!pressed);
      }}
      className={cn(
        'text-muted-foreground inline-flex h-7 w-7 items-center justify-center rounded-md border transition-colors',
        pressed
          ? 'border-primary/40 bg-primary/15 text-foreground'
          : 'hover:bg-accent hover:text-accent-foreground border-transparent',
      )}
    >
      {children}
    </button>
  );
}

export function SearchForm() {
  const inputRef = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  useSearchInputFocusRegistration(inputRef);
  useReplaceInputFocusRegistration(replaceRef);

  const query = useSearchStore((state) => state.query);
  const replaceQuery = useSearchStore((state) => state.replaceQuery);
  const replaceOpen = useSearchStore((state) => state.replaceOpen);
  const options = useSearchStore((state) => state.options);
  const recentSearches = useSearchStore((state) => state.recentSearches);
  const replaceStatus = useSearchStore((state) => state.replaceStatus);
  const replaceMessage = useSearchStore((state) => state.replaceMessage);
  const setQuery = useSearchStore((state) => state.setQuery);
  const setReplaceQuery = useSearchStore((state) => state.setReplaceQuery);
  const setReplaceOpen = useSearchStore((state) => state.setReplaceOpen);
  const toggleReplaceOpen = useSearchStore((state) => state.toggleReplaceOpen);
  const setOptions = useSearchStore((state) => state.setOptions);
  const clearRecentSearches = useSearchStore((state) => state.clearRecentSearches);
  const { pendingCount, replaceAll } = useSearchReplace();

  return (
    <div className="border-border space-y-2 border-b p-2">
      <div className="flex items-start gap-1">
        <div className="min-w-0 flex-1 space-y-1.5">
          <SearchField
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                setQuery('');
              }
              if (event.key === 'Enter' && event.altKey) {
                event.preventDefault();
                setReplaceOpen(true);
                window.setTimeout(() => replaceRef.current?.focus(), 0);
              }
            }}
            placeholder="Search"
            aria-label="Global search query"
            autoComplete="off"
          />
          {replaceOpen ? (
            <SearchField
              ref={replaceRef}
              value={replaceQuery}
              onChange={(event) => {
                setReplaceQuery(event.target.value);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                  event.preventDefault();
                  void replaceAll();
                }
                if (event.key === 'Escape') {
                  setReplaceOpen(false);
                  inputRef.current?.focus();
                }
              }}
              placeholder="Replace"
              aria-label="Replace with"
              autoComplete="off"
            />
          ) : null}
        </div>
        <div className="flex flex-col gap-1 pt-0.5">
          <button
            type="button"
            aria-expanded={replaceOpen}
            aria-label={replaceOpen ? 'Hide replace' : 'Toggle replace'}
            title="Toggle Replace"
            className={cn(
              'text-muted-foreground hover:bg-accent hover:text-accent-foreground inline-flex h-7 w-7 items-center justify-center rounded-md',
              replaceOpen && 'bg-accent text-accent-foreground',
            )}
            onClick={() => {
              toggleReplaceOpen();
              if (!replaceOpen) {
                window.setTimeout(() => replaceRef.current?.focus(), 0);
              }
            }}
          >
            <ChevronDown
              className={cn('h-3.5 w-3.5 transition-transform', replaceOpen && 'rotate-180')}
            />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1 px-0.5">
        <OptionToggle
          pressed={options.caseSensitive}
          label="Match Case"
          title="Match Case (Aa)"
          onPressedChange={(next) => {
            setOptions({ caseSensitive: next });
          }}
        >
          <CaseSensitive className="h-3.5 w-3.5" />
        </OptionToggle>
        <OptionToggle
          pressed={options.matchWholeWord}
          label="Match Whole Word"
          title="Match Whole Word"
          onPressedChange={(next) => {
            setOptions({ matchWholeWord: next });
          }}
        >
          <WholeWord className="h-3.5 w-3.5" />
        </OptionToggle>
        <OptionToggle
          pressed={options.useRegex}
          label="Use Regular Expression"
          title="Use Regular Expression"
          onPressedChange={(next) => {
            setOptions({ useRegex: next });
          }}
        >
          <Regex className="h-3.5 w-3.5" />
        </OptionToggle>
        <span className="bg-border mx-1 h-4 w-px" aria-hidden />
        <label className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
          <input
            type="checkbox"
            className="border-border h-3 w-3 rounded"
            checked={options.searchFilenames}
            onChange={(event) => {
              setOptions({ searchFilenames: event.target.checked });
            }}
          />
          Files
        </label>
        <label className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
          <input
            type="checkbox"
            className="border-border h-3 w-3 rounded"
            checked={options.searchContent}
            onChange={(event) => {
              setOptions({ searchContent: event.target.checked });
            }}
          />
          Text
        </label>
      </div>

      {replaceOpen ? (
        <div className="flex flex-wrap items-center gap-2 px-0.5">
          <Button
            type="button"
            size="sm"
            className="h-7 gap-1.5"
            disabled={pendingCount === 0 || replaceStatus === 'replacing' || !options.searchContent}
            onClick={() => {
              void replaceAll();
            }}
          >
            <Replace className="h-3.5 w-3.5" />
            Replace All
            {pendingCount > 0 ? ` (${pendingCount})` : ''}
          </Button>
          {replaceMessage ? (
            <span
              className={cn(
                'text-[11px]',
                replaceStatus === 'error' ? 'text-destructive' : 'text-muted-foreground',
              )}
            >
              {replaceMessage}
            </span>
          ) : (
            <span className="text-muted-foreground text-[11px]">⌘↵ to replace all</span>
          )}
        </div>
      ) : null}

      {recentSearches.length > 0 ? (
        <div className="space-y-1">
          <div className="flex items-center justify-between px-0.5">
            <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-wide">
              Recent
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 px-1.5 text-[10px]"
              onClick={() => {
                clearRecentSearches();
              }}
            >
              Clear
            </Button>
          </div>
          <div className="flex flex-wrap gap-1">
            {recentSearches.map((item) => (
              <button
                key={item}
                type="button"
                className="bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md px-1.5 py-0.5 text-[11px]"
                onClick={() => {
                  setQuery(item);
                  inputRef.current?.focus();
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
