import { useCallback, useEffect, useRef } from 'react';
import { Group, Panel, usePanelRef } from 'react-resizable-panels';

import type { LayoutEngineState } from '@/layout/hooks/use-layout-engine';
import type { LayoutEngineSlots } from '@/layout/types';
import type { PanelSize } from 'react-resizable-panels';

import { LayoutRegion } from '@/layout/atoms/layout-region';
import { LayoutResizeHandle } from '@/layout/atoms/layout-resize-handle';
import {
  AI_PANEL_SIZE,
  BOTTOM_PANEL_SIZE,
  EXPLORER_SIZE,
  WORKSPACE_MIN_PERCENT,
} from '@/layout/constants';
import { AnimatedPanelFrame } from '@/layout/molecules/animated-panel-frame';
import { useLayoutStore } from '@/stores/layout-store';

interface LayoutWorkbenchProps {
  slots: Pick<LayoutEngineSlots, 'explorer' | 'workspace' | 'aiPanel' | 'bottomPanel'>;
  state: LayoutEngineState;
}

/** Keep defaultSize stable while a panel is mounted — changing it re-registers the panel and kills drag. */
function useStablePanelDefault(visible: boolean, width: number): number {
  const defaults = useRef({ visible, size: width });
  if (visible && !defaults.current.visible) {
    defaults.current.size = width;
  }
  if (!visible) {
    defaults.current.size = width;
  }
  defaults.current.visible = visible;
  return defaults.current.size;
}

/**
 * Workbench panels with stretchable splitters.
 *
 * Do not pass a fresh onResize/defaultSize every render — react-resizable-panels
 * re-registers the panel and the divider stops stretching.
 */
export function LayoutWorkbench({ slots, state }: LayoutWorkbenchProps) {
  const {
    explorerVisible,
    aiPanelVisible,
    explorerWidth,
    aiPanelWidth,
    bottomPanelHeight,
    bottomPanelCollapsed,
    setExplorerWidth,
    setAiPanelWidth,
    setBottomPanelHeight,
  } = state;

  const sidebarCollapsed = useLayoutStore((s) => s.sidebarCollapsed);
  const explorerPanelRef = usePanelRef();
  const aiPanelRef = usePanelRef();
  const bottomPanelRef = usePanelRef();

  const explorerDefault = useStablePanelDefault(explorerVisible, explorerWidth);
  const aiDefault = useStablePanelDefault(aiPanelVisible, aiPanelWidth);
  const bottomDefault = useStablePanelDefault(
    !bottomPanelCollapsed,
    bottomPanelCollapsed ? BOTTOM_PANEL_SIZE.collapsed : bottomPanelHeight,
  );

  const setExplorerWidthRef = useRef(setExplorerWidth);
  const setAiPanelWidthRef = useRef(setAiPanelWidth);
  const setBottomPanelHeightRef = useRef(setBottomPanelHeight);
  setExplorerWidthRef.current = setExplorerWidth;
  setAiPanelWidthRef.current = setAiPanelWidth;
  setBottomPanelHeightRef.current = setBottomPanelHeight;

  const onExplorerResize = useCallback(
    (panelSize: PanelSize, _id?: string | number, prev?: PanelSize) => {
      if (prev == null) {
        return;
      }
      setExplorerWidthRef.current(panelSize.inPixels);
    },
    [],
  );

  const onAiResize = useCallback(
    (panelSize: PanelSize, _id?: string | number, prev?: PanelSize) => {
      if (prev == null) {
        return;
      }
      setAiPanelWidthRef.current(panelSize.inPixels);
    },
    [],
  );

  const onBottomResize = useCallback(
    (panelSize: PanelSize, _id?: string | number, prev?: PanelSize) => {
      if (prev == null) {
        return;
      }
      if (panelSize.inPixels > BOTTOM_PANEL_SIZE.collapsed + 8) {
        setBottomPanelHeightRef.current(panelSize.inPixels);
      }
    },
    [],
  );

  const prevSidebarCollapsed = useRef(sidebarCollapsed);
  const prevExplorerVisible = useRef(explorerVisible);
  const prevAiVisible = useRef(aiPanelVisible);

  // Programmatic size apply ONLY when sidebar/panels toggle — never during user drag.
  useEffect(() => {
    const sidebarChanged = prevSidebarCollapsed.current !== sidebarCollapsed;
    const explorerShown = !prevExplorerVisible.current && explorerVisible;
    const aiShown = !prevAiVisible.current && aiPanelVisible;

    prevSidebarCollapsed.current = sidebarCollapsed;
    prevExplorerVisible.current = explorerVisible;
    prevAiVisible.current = aiPanelVisible;

    if (!sidebarChanged && !explorerShown && !aiShown) {
      return;
    }

    const id = requestAnimationFrame(() => {
      if (explorerVisible) {
        explorerPanelRef.current?.resize(explorerWidth);
      }
      if (aiPanelVisible) {
        aiPanelRef.current?.resize(aiPanelWidth);
      }
      if (!bottomPanelCollapsed) {
        bottomPanelRef.current?.resize(bottomPanelHeight);
      }
    });

    return () => cancelAnimationFrame(id);
  }, [
    aiPanelRef,
    aiPanelVisible,
    aiPanelWidth,
    bottomPanelCollapsed,
    bottomPanelHeight,
    bottomPanelRef,
    explorerPanelRef,
    explorerVisible,
    explorerWidth,
    sidebarCollapsed,
  ]);

  return (
    <Group
      id="layout-vertical-v5"
      orientation="vertical"
      className="h-full min-h-0 w-full min-w-0 flex-1 overflow-hidden"
      resizeTargetMinimumSize={{ coarse: 28, fine: 14 }}
    >
      <Panel id="layout-main-row" minSize="30%" groupResizeBehavior="preserve-relative-size">
        <Group
          id="layout-horizontal-v5"
          orientation="horizontal"
          className="h-full w-full min-w-0"
          resizeTargetMinimumSize={{ coarse: 28, fine: 14 }}
        >
          {explorerVisible ? (
            <>
              <Panel
                id="layout-explorer"
                panelRef={explorerPanelRef}
                minSize={EXPLORER_SIZE.min}
                maxSize={EXPLORER_SIZE.max}
                defaultSize={explorerDefault}
                groupResizeBehavior="preserve-relative-size"
                onResize={onExplorerResize}
              >
                <LayoutRegion id="layout-explorer" label="Project Explorer" className="h-full">
                  <AnimatedPanelFrame open side="left" className="h-full w-full">
                    {slots.explorer}
                  </AnimatedPanelFrame>
                </LayoutRegion>
              </Panel>
              <LayoutResizeHandle orientation="vertical" />
            </>
          ) : null}

          <Panel
            id="layout-workspace"
            minSize={`${WORKSPACE_MIN_PERCENT}%`}
            defaultSize="50%"
            groupResizeBehavior="preserve-relative-size"
          >
            <LayoutRegion
              id="layout-workspace"
              label="Workspace"
              className="bg-background h-full w-full"
            >
              {slots.workspace}
            </LayoutRegion>
          </Panel>

          {aiPanelVisible ? (
            <>
              <LayoutResizeHandle orientation="vertical" />
              <Panel
                id="layout-ai-panel"
                panelRef={aiPanelRef}
                minSize={AI_PANEL_SIZE.min}
                maxSize={AI_PANEL_SIZE.max}
                defaultSize={aiDefault}
                groupResizeBehavior="preserve-relative-size"
                onResize={onAiResize}
              >
                <LayoutRegion id="layout-ai-panel" label="AI Assistant" className="h-full">
                  <AnimatedPanelFrame open side="right" className="h-full w-full">
                    {slots.aiPanel}
                  </AnimatedPanelFrame>
                </LayoutRegion>
              </Panel>
            </>
          ) : null}
        </Group>
      </Panel>

      <LayoutResizeHandle orientation="horizontal" />

      <Panel
        id="layout-bottom-panel"
        panelRef={bottomPanelRef}
        collapsible
        collapsedSize={BOTTOM_PANEL_SIZE.collapsed}
        minSize={BOTTOM_PANEL_SIZE.min}
        maxSize={BOTTOM_PANEL_SIZE.max}
        defaultSize={bottomDefault}
        groupResizeBehavior="preserve-pixel-size"
        onResize={onBottomResize}
      >
        <LayoutRegion id="layout-bottom-panel" label="Bottom Panel" className="h-full w-full">
          {slots.bottomPanel}
        </LayoutRegion>
      </Panel>
    </Group>
  );
}
