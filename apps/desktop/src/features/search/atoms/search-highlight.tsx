import { cn } from '@launchos/ui';

interface SearchHighlightProps {
  text: string;
  query: string;
  caseSensitive?: boolean;
  /** When provided, highlight using engine ranges instead of re-deriving from query. */
  matchIndex?: number;
  matchLength?: number;
  className?: string;
}

/** Renders `text` with highlight spans for the active match. */
export function SearchHighlight({
  text,
  query,
  caseSensitive = false,
  matchIndex,
  matchLength,
  className,
}: SearchHighlightProps) {
  if (
    typeof matchIndex === 'number' &&
    typeof matchLength === 'number' &&
    matchLength > 0 &&
    matchIndex >= 0 &&
    matchIndex + matchLength <= text.length
  ) {
    const before = text.slice(0, matchIndex);
    const hit = text.slice(matchIndex, matchIndex + matchLength);
    const after = text.slice(matchIndex + matchLength);
    return (
      <span className={cn(className)}>
        {before}
        <mark className="bg-primary/25 text-foreground rounded-sm px-0.5">{hit}</mark>
        {after}
      </span>
    );
  }

  const trimmed = query.trim();
  if (!trimmed) {
    return <span className={className}>{text}</span>;
  }

  const haystack = caseSensitive ? text : text.toLowerCase();
  const needle = caseSensitive ? trimmed : trimmed.toLowerCase();
  const parts: Array<{ value: string; hit: boolean }> = [];
  let cursor = 0;

  while (cursor < text.length) {
    const index = haystack.indexOf(needle, cursor);
    if (index < 0) {
      parts.push({ value: text.slice(cursor), hit: false });
      break;
    }
    if (index > cursor) {
      parts.push({ value: text.slice(cursor, index), hit: false });
    }
    parts.push({ value: text.slice(index, index + trimmed.length), hit: true });
    cursor = index + Math.max(1, trimmed.length);
  }

  return (
    <span className={cn(className)}>
      {parts.map((part, index) =>
        part.hit ? (
          <mark
            key={`${index}-${part.value}`}
            className="bg-primary/25 text-foreground rounded-sm px-0.5"
          >
            {part.value}
          </mark>
        ) : (
          <span key={`${index}-${part.value}`}>{part.value}</span>
        ),
      )}
    </span>
  );
}
