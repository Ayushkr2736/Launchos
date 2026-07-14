import type { LucideIcon } from 'lucide-react';

/** Cursor-like command groups — order defined in `COMMAND_PALETTE_GROUP_ORDER`. */
export type CommandPaletteGroupId =
  | 'recent-files'
  | 'recent-projects'
  | 'open-file'
  | 'search'
  | 'commands'
  | 'workspace'
  | 'git'
  | 'theme'
  | 'settings'
  | 'navigation'
  | 'agents';

export interface CommandPaletteItem {
  readonly id: string;
  readonly group: CommandPaletteGroupId;
  readonly label: string;
  readonly keywords?: readonly string[];
  readonly shortcut?: string;
  readonly icon: LucideIcon;
  readonly hint?: string;
  /** When false, item is shown but disabled (e.g. future agent actions). */
  readonly disabled?: boolean;
  /**
   * When true, always shown in the empty (no-query) curated list.
   * Used for primary actions like Open Folder / Search / Theme.
   */
  readonly pinned?: boolean;
  readonly run: () => void;
}

export interface CommandPaletteGroupMeta {
  readonly id: CommandPaletteGroupId;
  readonly heading: string;
}

export interface CommandPaletteAgent {
  readonly id: string;
  readonly name: string;
  readonly description: string;
}

export interface CommandPaletteRecentFile {
  readonly id: string;
  readonly name: string;
  readonly path: string;
  readonly openedAt: number;
}

/** Registered extension pack from a feature module. */
export interface CommandPaletteRegistration {
  readonly id: string;
  readonly items: readonly CommandPaletteItem[];
}
