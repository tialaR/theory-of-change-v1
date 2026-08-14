'use client';

import type { CanvasIdTokenFactory } from '../../domain/canvas-element-id';
import type { CanvasStageId } from '../../domain/canvas-project';
import type { CanvasStageCopy } from '../../engine/canvas-engine';
import type { CanvasCausalEdge, CanvasStageNode } from '../../react-flow/canvas-flow.types';
import { useCanvasFlowState } from '../../react-flow/use-canvas-flow-state';
import type { CanvasConnectFailureCode, CanvasConnectResult, CanvasRelationDraftInput } from './canvas-flow/types';
import { useCanvasEdgeCommands } from './canvas-flow/use-canvas-edge-commands';
import { useCanvasFlowHistory } from './canvas-flow/use-canvas-flow-history';
import { useCanvasLayoutCommands } from './canvas-flow/use-canvas-layout-commands';
import { useCanvasNodeCommands } from './canvas-flow/use-canvas-node-commands';

export type { CanvasConnectFailureCode, CanvasConnectResult, CanvasRelationDraftInput } from './canvas-flow/types';

function createRandomIdToken() { return crypto.randomUUID(); }

export function useCanvasFlowController(
  initialNodes: CanvasStageNode[] = [],
  initialEdges: CanvasCausalEdge[] = [],
  getStageCopy: (stage: CanvasStageId) => CanvasStageCopy,
  createDuplicateTitle: (title: string) => string,
  createIdToken: CanvasIdTokenFactory = createRandomIdToken
) {
  const { nodes, edges, setNodes, setEdges, onNodesChange, onEdgesChange } = useCanvasFlowState(initialNodes, initialEdges);
  const history = useCanvasFlowHistory({ nodes, edges, setNodes, setEdges });
  const nodeCommands = useCanvasNodeCommands({ nodes, edges, setNodes, setEdges, capture: history.capture, getStageCopy, createDuplicateTitle, createIdToken });
  const edgeCommands = useCanvasEdgeCommands({ nodes, edges, setEdges, capture: history.capture, createIdToken });
  const layoutCommands = useCanvasLayoutCommands({ edges, setNodes, capture: history.capture });


  return {
    nodes, edges, setNodes, setEdges, onNodesChange, onEdgesChange,
    ...nodeCommands,
    history: history.history,
    future: history.future,
    canUndo: history.canUndo,
    canRedo: history.canRedo,
    undo: history.undo,
    redo: history.redo,
    beginNodeDrag: history.beginNodeDrag,
    finishNodeDrag: history.finishNodeDrag,
    ...edgeCommands,
    ...layoutCommands
  };
}

export type CanvasFlowController = ReturnType<typeof useCanvasFlowController>;
