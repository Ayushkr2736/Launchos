import type { CommandPaletteGroupMeta } from '@/features/command-palette/types';

export const COMMAND_PALETTE_STORAGE_KEY = 'launchos.shell.command-palette';
export const AGENTS_STORAGE_KEY = 'launchos.shell.agents';
export const RECENT_FILES_STORAGE_KEY = 'launchos.shell.recent-files';

export const COMMAND_PALETTE_RECENT_FILES_MAX = 20;
export const COMMAND_PALETTE_OPEN_FILE_MAX = 80;
export const COMMAND_PALETTE_EMPTY_RECENT_FILES = 8;
export const COMMAND_PALETTE_EMPTY_RECENT_PROJECTS = 8;
export const COMMAND_PALETTE_EMPTY_PINNED_MAX = 24;

export const COMMAND_PALETTE_ANIMATION = {
  overlayMs: 160,
  panelMs: 200,
  itemMs: 120,
} as const;

/**
 * Display order — curated empty state leads with recents,
 * then primary actions, then deeper groups when searching.
 */
export const COMMAND_PALETTE_GROUP_ORDER: readonly CommandPaletteGroupMeta[] = [
  { id: 'recent-files', heading: 'Recent Files' },
  { id: 'recent-projects', heading: 'Recent Projects' },
  { id: 'open-file', heading: 'Open File' },
  { id: 'search', heading: 'Search' },
  { id: 'commands', heading: 'Commands' },
  { id: 'workspace', heading: 'Workspace' },
  { id: 'git', heading: 'Git' },
  { id: 'theme', heading: 'Theme' },
  { id: 'settings', heading: 'Settings' },
  { id: 'navigation', heading: 'Navigation' },
  { id: 'agents', heading: 'Agent Actions' },
] as const;

export const DEFAULT_AGENTS = [
  {
    id: 'launchos-default',
    name: 'LaunchOS Agent',
    description: 'General assistant for the current workspace',
  },
  {
    id: 'launchos-code',
    name: 'Code Agent',
    description: 'Focused on editing, diffs, and refactors',
  },
  {
    id: 'launchos-research',
    name: 'Research Agent',
    description: 'Sources, notes, and long-context synthesis',
  },
  {
    id: 'launchos-browser',
    name: 'Browser Agent',
    description: 'Web navigation and page summarization',
  },
] as const;
