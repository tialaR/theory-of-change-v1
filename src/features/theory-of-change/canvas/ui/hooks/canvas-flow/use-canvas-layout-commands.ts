'use client';

import { useCallback } from 'react';
import { centralizeCanvasColumns, organizeCanvasFlow } from '../../../application/canvas-layout';
import type { CanvasCausalEdge } from '../../../react-flow/canvas-flow.types';
import type { CaptureCanvasSnapshot, SetCanvasNodes } from './types';

type Options = {
  edges: CanvasCausalEdge[];
  setNodes: SetCanvasNodes;
  capture: CaptureCanvasSnapshot;
};

export function useCanvasLayoutCommands({ edges, setNodes, capture }: Options) {
  const centralizeColumns = useCallback(() => {
    capture();
    setNodes((items) => centralizeCanvasColumns(items));
  }, [capture, setNodes]);

  const organizeFlow = useCallback(() => {
    capture();
    setNodes((items) => organizeCanvasFlow(items, edges));
  }, [capture, edges, setNodes]);

  return { centralizeColumns, organizeFlow };
}
