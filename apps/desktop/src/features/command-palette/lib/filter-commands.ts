import type { CommandPaletteItem } from '@/features/command-palette/types';

import {
  COMMAND_PALETTE_EMPTY_PINNED_MAX,
  COMMAND_PALETTE_EMPTY_RECENT_FILES,
  COMMAND_PALETTE_EMPTY_RECENT_PROJECTS,
} from '@/features/command-palette/constants';

/** Subsequence fuzzy score — higher is better. 0 = no match. */
export function scoreCommandMatch(query: string, item: CommandPaletteItem): number {
  const q = query.trim().toLowerCase();
  if (!q) {
    return 1;
  }

  const label = item.label.toLowerCase();
  const hint = (item.hint ?? '').toLowerCase();
  const keywords = (item.keywords ?? []).join(' ').toLowerCase();

  if (label === q) {
    return 120;
  }
  if (label.startsWith(q)) {
    return 100;
  }
  if (label.includes(q)) {
    return 80;
  }

  let score = 0;
  if (fuzzySubsequence(q, label)) {
    score = Math.max(score, 55);
  }
  if (hint.includes(q) || fuzzySubsequence(q, hint)) {
    score = Math.max(score, 40);
  }
  if (keywords.includes(q) || fuzzySubsequence(q, keywords)) {
    score = Math.max(score, 35);
  }

  return score;
}

function fuzzySubsequence(query: string, text: string): boolean {
  if (!query || !text) {
    return false;
  }
  let qi = 0;
  for (let i = 0; i < text.length && qi < query.length; i += 1) {
    if (text[i] === query[qi]) {
      qi += 1;
    }
  }
  return qi === query.length;
}

/**
 * Filter + rank palette items.
 * Empty query → curated empty state (recents + pinned primary actions).
 * Open-file items are pre-ranked by the open-file hook and always kept when present.
 */
export function filterCommandItems(
  items: readonly CommandPaletteItem[],
  query: string,
): CommandPaletteItem[] {
  const trimmed = query.trim();

  if (!trimmed) {
    return curateEmptyState(items);
  }

  const ranked: Array<{ item: CommandPaletteItem; score: number }> = [];

  for (const item of items) {
    if (item.group === 'open-file') {
      // Pre-ranked by open-file hook.
      ranked.push({ item, score: 90 });
      continue;
    }
    const score = scoreCommandMatch(trimmed, item);
    if (score > 0) {
      ranked.push({ item, score });
    }
  }

  return ranked
    .sort((a, b) => b.score - a.score || a.item.label.localeCompare(b.item.label))
    .map((entry) => entry.item);
}

function curateEmptyState(items: readonly CommandPaletteItem[]): CommandPaletteItem[] {
  const recentFiles = items
    .filter((item) => item.group === 'recent-files')
    .slice(0, COMMAND_PALETTE_EMPTY_RECENT_FILES);
  const recentProjects = items
    .filter((item) => item.group === 'recent-projects')
    .slice(0, COMMAND_PALETTE_EMPTY_RECENT_PROJECTS);
  const pinned = items
    .filter(
      (item) => item.pinned && item.group !== 'recent-files' && item.group !== 'recent-projects',
    )
    .slice(0, COMMAND_PALETTE_EMPTY_PINNED_MAX);

  const seen = new Set<string>();
  const out: CommandPaletteItem[] = [];
  for (const item of [...recentFiles, ...recentProjects, ...pinned]) {
    if (seen.has(item.id)) {
      continue;
    }
    seen.add(item.id);
    out.push(item);
  }
  return out;
}
