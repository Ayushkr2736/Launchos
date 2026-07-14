const DEPTH_PADDING = [
  'pl-1',
  'pl-4',
  'pl-7',
  'pl-10',
  'pl-[52px]',
  'pl-[64px]',
  'pl-[76px]',
  'pl-[88px]',
  'pl-[100px]',
  'pl-[112px]',
  'pl-[124px]',
  'pl-[136px]',
  'pl-[148px]',
] as const;

export function explorerDepthClass(depth: number): string {
  return DEPTH_PADDING[Math.min(Math.max(depth, 0), DEPTH_PADDING.length - 1)] ?? 'pl-1';
}
