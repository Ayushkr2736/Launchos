import {
  Bug,
  GitBranch,
  ListChecks,
  Rocket,
  ScrollText,
  SquareTerminal,
  TerminalSquare,
  Workflow,
} from 'lucide-react';

import type { BottomPanelTabId, ShellSlotId } from '@/types/shell';
import type { LucideIcon } from 'lucide-react';

export interface BottomPanelTabConfig {
  readonly id: BottomPanelTabId;
  readonly label: string;
  readonly shortcut?: string;
  readonly icon: LucideIcon;
  readonly slot: ShellSlotId;
  readonly emptyTitle: string;
  readonly emptyDescription: string;
}

/** Ordered like Cursor / VS Code bottom chrome. */
export const BOTTOM_PANEL_TAB_CONFIG: readonly BottomPanelTabConfig[] = [
  {
    id: 'terminal',
    label: 'Terminal',
    shortcut: '⌘`',
    icon: SquareTerminal,
    slot: 'bottom.terminal',
    emptyTitle: 'Terminal',
    emptyDescription: 'No terminal session yet. A terminal host can register on bottom.terminal.',
  },
  {
    id: 'problems',
    label: 'Problems',
    icon: Bug,
    slot: 'bottom.problems',
    emptyTitle: 'No problems',
    emptyDescription: 'Diagnostics will appear here when a language service registers.',
  },
  {
    id: 'output',
    label: 'Output',
    icon: TerminalSquare,
    slot: 'bottom.output',
    emptyTitle: 'Output',
    emptyDescription: 'Task and extension output channels register on bottom.output.',
  },
  {
    id: 'logs',
    label: 'Logs',
    icon: ScrollText,
    slot: 'bottom.logs',
    emptyTitle: 'Logs',
    emptyDescription: 'Application and agent log streams register on bottom.logs.',
  },
  {
    id: 'ai-tasks',
    label: 'AI Tasks',
    icon: Workflow,
    slot: 'bottom.ai-tasks',
    emptyTitle: 'AI Tasks',
    emptyDescription: 'Agent task queues register on bottom.ai-tasks.',
  },
  {
    id: 'git',
    label: 'Git',
    icon: GitBranch,
    slot: 'bottom.git',
    emptyTitle: 'Source Control',
    emptyDescription: 'Git status and diffs register on bottom.git.',
  },
  {
    id: 'tests',
    label: 'Tests',
    icon: ListChecks,
    slot: 'bottom.tests',
    emptyTitle: 'Tests',
    emptyDescription: 'Test runners register on bottom.tests.',
  },
  {
    id: 'deployments',
    label: 'Deployments',
    icon: Rocket,
    slot: 'bottom.deployments',
    emptyTitle: 'Deployments',
    emptyDescription: 'Deployment status registers on bottom.deployments.',
  },
] as const;

export const BOTTOM_PANEL_TABS = BOTTOM_PANEL_TAB_CONFIG.map((tab) => ({
  id: tab.id,
  label: tab.label,
}));

export function getBottomPanelTabConfig(id: BottomPanelTabId): BottomPanelTabConfig {
  const config = BOTTOM_PANEL_TAB_CONFIG.find((tab) => tab.id === id);
  if (!config) {
    return BOTTOM_PANEL_TAB_CONFIG[0]!;
  }
  return config;
}
