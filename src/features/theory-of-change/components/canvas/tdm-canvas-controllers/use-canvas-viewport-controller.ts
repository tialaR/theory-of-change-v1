import { useCallback, useEffect, useState } from 'react';

import type { TdmEdge, TdmNode } from '../../../domain/tdm-types';
import { layoutNodesByFlow } from '../../../utils/layout-nodes-by-flow';
import { layoutNodesByStage } from '../../../utils/layout-nodes-by-stage';

const CANVAS_FIT_PADDING = 0.16;
const CANVAS_MAX_AUTO_FIT_ZOOM = 1;

type FitView = (options: { padding: number; duration: number; maxZoom: number }) => void;
type ScreenToFlowPosition = (position: { x: number; y: number }) => { x: number; y: number };
type SetNodes = (updater: (nodes: TdmNode[]) => TdmNode[]) => void;

type UseCanvasViewportControllerParams = {
  viewMode: 'canvas' | 'example-preview' | 'result';
  nodesLength: number;
  edges: TdmEdge[];
  fitView: FitView;
  screenToFlowPosition: ScreenToFlowPosition;
  setNodes: SetNodes;
  setCanvasVariant: (variant: 'custom' | 'example') => void;
};

export function useCanvasViewportController({
  viewMode,
  nodesLength,
  edges,
  fitView,
  screenToFlowPosition,
  setNodes,
  setCanvasVariant
}: UseCanvasViewportControllerParams) {
  const [viewportResetToken, setViewportResetToken] = useState(0);

  const fitCanvasToVisibleArea = useCallback(() => {
    if (viewMode !== 'canvas' || nodesLength === 0) {
      return;
    }

    window.requestAnimationFrame(() => {
      screenToFlowPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
      });
      fitView({ padding: CANVAS_FIT_PADDING, duration: 250, maxZoom: CANVAS_MAX_AUTO_FIT_ZOOM });
    });
  }, [fitView, nodesLength, screenToFlowPosition, viewMode]);

  useEffect(() => {
    fitCanvasToVisibleArea();
  }, [fitCanvasToVisibleArea, viewportResetToken]);

  const bumpViewportReset = useCallback(() => {
    setViewportResetToken((currentValue) => currentValue + 1);
  }, []);

  const centerNodes = useCallback(() => {
    setNodes((currentNodes) => layoutNodesByStage(currentNodes));
    setCanvasVariant('custom');
    window.requestAnimationFrame(() => {
      fitView({ padding: CANVAS_FIT_PADDING, duration: 250, maxZoom: CANVAS_MAX_AUTO_FIT_ZOOM });
    });
  }, [fitView, setCanvasVariant, setNodes]);

  const organizeFlow = useCallback(() => {
    setNodes((currentNodes) => layoutNodesByFlow(currentNodes, edges));
    setCanvasVariant('custom');
    window.requestAnimationFrame(() => {
      fitView({ padding: CANVAS_FIT_PADDING, duration: 250, maxZoom: CANVAS_MAX_AUTO_FIT_ZOOM });
    });
  }, [edges, fitView, setCanvasVariant, setNodes]);

  return {
    fitCanvasToVisibleArea,
    bumpViewportReset,
    centerNodes,
    organizeFlow
  };
}
