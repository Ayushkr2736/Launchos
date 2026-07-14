export type WindowResizeEdge =
  'East' | 'North' | 'NorthEast' | 'NorthWest' | 'South' | 'SouthEast' | 'SouthWest' | 'West';

export interface DesktopWindowState {
  readonly isTauri: boolean;
  readonly isMaximized: boolean;
  readonly isMinimized: boolean;
  readonly isFocused: boolean;
  readonly width: number;
  readonly height: number;
  readonly scaleFactor: number;
}

export type WindowControlAction = 'minimize' | 'maximize' | 'restore' | 'close';
