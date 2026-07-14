import type { SearchLineMatch, SearchOptions } from '@/features/search/types';

import { SEARCH_MAX_MATCHES_PER_FILE, SEARCH_PREVIEW_PAD } from '@/features/search/types';

export class SearchPatternError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SearchPatternError';
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Build a global RegExp from the query + search options.
 * Throws `SearchPatternError` for invalid regex patterns.
 */
export function buildSearchPattern(query: string, options: SearchOptions): RegExp {
  const trimmed = query;
  if (!trimmed) {
    throw new SearchPatternError('Empty search pattern');
  }

  let source: string;
  if (options.useRegex) {
    source = trimmed;
  } else {
    source = escapeRegExp(trimmed);
  }

  if (options.matchWholeWord) {
    source = `\\b(?:${source})\\b`;
  }

  const flags = options.caseSensitive ? 'g' : 'gi';
  try {
    return new RegExp(source, flags);
  } catch (error) {
    throw new SearchPatternError(
      error instanceof Error ? error.message : 'Invalid regular expression',
    );
  }
}

export function matchesFilename(name: string, query: string, options: SearchOptions): boolean {
  try {
    const pattern = buildSearchPattern(query, options);
    pattern.lastIndex = 0;
    return pattern.test(name);
  } catch {
    return false;
  }
}

export function findLineMatches(
  content: string,
  query: string,
  options: SearchOptions,
): SearchLineMatch[] {
  const pattern = buildSearchPattern(query, options);
  const lines = content.split(/\r?\n/);
  const matches: SearchLineMatch[] = [];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i] ?? '';
    pattern.lastIndex = 0;
    let match = pattern.exec(line);
    while (match) {
      const index = match.index;
      const length = match[0]?.length ?? 0;
      if (length === 0) {
        // Avoid infinite loops on zero-width matches.
        pattern.lastIndex = index + 1;
        match = pattern.exec(line);
        continue;
      }

      const start = Math.max(0, index - SEARCH_PREVIEW_PAD);
      const end = Math.min(line.length, index + length + SEARCH_PREVIEW_PAD);
      const preview = `${start > 0 ? '…' : ''}${line.slice(start, end)}${end < line.length ? '…' : ''}`;

      matches.push({
        lineNumber: i + 1,
        column: index + 1,
        preview,
        matchIndex: index - start + (start > 0 ? 1 : 0),
        matchLength: length,
      });

      if (matches.length >= SEARCH_MAX_MATCHES_PER_FILE) {
        return matches;
      }

      match = pattern.exec(line);
    }
  }

  return matches;
}

export function countMatchesInContent(
  content: string,
  query: string,
  options: SearchOptions,
): number {
  const pattern = buildSearchPattern(query, options);
  let count = 0;
  pattern.lastIndex = 0;
  let match = pattern.exec(content);
  while (match) {
    const length = match[0]?.length ?? 0;
    if (length === 0) {
      pattern.lastIndex = (match.index ?? 0) + 1;
      match = pattern.exec(content);
      continue;
    }
    count += 1;
    match = pattern.exec(content);
  }
  return count;
}

/**
 * Replace all matches in content. Supports `$1` / `$&` when regex mode is on.
 */
export function replaceAllInContent(
  content: string,
  query: string,
  replacement: string,
  options: SearchOptions,
): { next: string; count: number } {
  const count = countMatchesInContent(content, query, options);
  if (count === 0) {
    return { next: content, count: 0 };
  }
  const pattern = buildSearchPattern(query, options);
  pattern.lastIndex = 0;
  const next = options.useRegex
    ? content.replace(pattern, replacement)
    : content.replace(pattern, () => replacement);
  return { next, count };
}
