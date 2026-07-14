import type { ReactNode } from 'react';

export type LayoutPanelId = 'sidebar' | 'explorer' | 'workspace' | 'ai' | 'bottom';

export type LayoutBreakpoint = 'laptop' | 'desktop' | 'wide' | 'ultra';

export interface PanelSizeConstraints {
  readonly min: number;
  readonly max: number;
  readonly default: number;
  readonly collapsed: number;
}

export interface LayoutPanelSnapshot {
  readonly id: LayoutPanelId;
  readonly collapsed: boolean;
  readonly size: number;
  readonly visible: boolean;
}

export interface LayoutSnapshot {
  readonly breakpoint: LayoutBreakpoint;
  readonly sidebar: LayoutPanelSnapshot;
  readonly explorer: LayoutPanelSnapshot;
  readonly workspace: LayoutPanelSnapshot;
  readonly ai: LayoutPanelSnapshot;
  readonly bottom: LayoutPanelSnapshot;
}

export interface LayoutEngineSlots {
  readonly titleBar: ReactNode;
  readonly sidebar: ReactNode;
  readonly explorer: ReactNode;
  readonly workspace: ReactNode;
  readonly aiPanel: ReactNode;
  readonly bottomPanel: ReactNode;
  readonly statusBar?: ReactNode;
  readonly overlay?: ReactNode;
}

export type LayoutPanelListener = (snapshot: LayoutSnapshot) => void;
