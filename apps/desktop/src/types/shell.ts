import type { ReactNode } from 'react';

export type SidebarSectionId =
  | 'home'
  | 'projects'
  | 'code'
  | 'research'
  | 'browser'
  | 'design'
  | 'marketing'
  | 'finance'
  | 'voice'
  | 'data'
  | 'marketplace'
  | 'settings'
  | 'profile';

export type BottomPanelTabId =
  'terminal' | 'problems' | 'output' | 'logs' | 'ai-tasks' | 'git' | 'tests' | 'deployments';

export type AiPanelTabId = 'chat' | 'agent' | 'memory' | 'tasks' | 'context';

/** Left workbench panel views (Explorer / Search). */
export type LeftPanelTabId = 'explorer' | 'search';

export type WorkspaceContentState = 'empty' | 'loading' | 'ready' | 'error';

export type WorkspaceTabKind = 'file' | 'untitled' | 'preview';

export type WorkspacePaneId = 'primary' | 'secondary';

export type ShellSlotId =
  | 'explorer.tree'
  | 'explorer.search'
  | 'workspace.content'
  | 'ai.chat'
  | 'ai.agent'
  | 'ai.memory'
  | 'ai.tasks'
  | 'ai.context'
  | 'bottom.terminal'
  | 'bottom.problems'
  | 'bottom.output'
  | 'bottom.logs'
  | 'bottom.ai-tasks'
  | 'bottom.git'
  | 'bottom.tests'
  | 'bottom.deployments'
  | 'titlebar.branch'
  | 'titlebar.ai-provider'
  | 'titlebar.notifications'
  | 'sidebar.recent';

export interface WorkspaceTab {
  readonly id: string;
  readonly title: string;
  readonly closable: boolean;
  readonly kind?: WorkspaceTabKind;
  readonly path?: string;
  readonly dirty?: boolean;
  /** Pinned tabs stay on the left and resist accidental close. */
  readonly pinned?: boolean;
}

export interface WorkspacePaneState {
  readonly id: WorkspacePaneId;
  readonly activeTabId: string | null;
  readonly viewState: WorkspaceContentState;
  readonly errorMessage: string | null;
}

export interface SidebarNavChild {
  readonly id: string;
  readonly label: string;
  readonly parentId: SidebarSectionId;
}

export interface SidebarNavItem {
  readonly id: SidebarSectionId;
  readonly label: string;
  readonly shortcut?: string;
  readonly children?: readonly SidebarNavChild[];
}

export interface SidebarRecentProject {
  readonly id: string;
  readonly name: string;
  readonly path?: string;
  readonly openedAt: number;
}

export type SidebarFocusTarget =
  | { readonly kind: 'section'; readonly id: SidebarSectionId }
  | { readonly kind: 'child'; readonly id: string; readonly parentId: SidebarSectionId }
  | { readonly kind: 'recent'; readonly id: string };

export interface PanelSizeConstraints {
  readonly min: number;
  readonly max: number;
  readonly default: number;
  readonly collapsed?: number;
}

export interface ShellLayoutSizes {
  readonly sidebarWidth: number;
  readonly explorerWidth: number;
  readonly aiPanelWidth: number;
  readonly bottomPanelHeight: number;
}

export type ShellSlotRenderer = () => ReactNode;
