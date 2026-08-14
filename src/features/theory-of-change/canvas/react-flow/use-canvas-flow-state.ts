'use client';

import { useEdgesState, useNodesState, useReactFlow } from '@xyflow/react';
import { useMemo } from 'react';
import type { CanvasStageDropRuntime, CanvasViewportRuntime } from './canvas-flow.contracts';
import type { CanvasCausalEdge, CanvasStageNode } from './canvas-flow.types';

export function useCanvasFlowState(
  initialNodes: CanvasStageNode[] = [],
  initialEdges: CanvasCausalEdge[] = []
) {
  const [nodes, setNodes, onNodesChange] = useNodesState<CanvasStageNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<CanvasCausalEdge>(initialEdges);

  return {
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange
  };
}

export function useCanvasFlowRuntime() {
  const reactFlow = useReactFlow<CanvasStageNode, CanvasCausalEdge>();

  return useMemo<{
    stageDropRuntime: CanvasStageDropRuntime;
    viewportRuntime: CanvasViewportRuntime;
  }>(() => ({
    stageDropRuntime: {
      screenToFlowPosition: (position) => reactFlow.screenToFlowPosition(position)
    },
    viewportRuntime: {
      getNodesBounds: (nodes) => reactFlow.getNodesBounds(nodes as CanvasStageNode[]),
      getViewport: () => reactFlow.getViewport(),
      setViewport: (viewport, transition) => reactFlow.setViewport(viewport, transition),
      zoomIn: (transition) => reactFlow.zoomIn(transition),
      zoomOut: (transition) => reactFlow.zoomOut(transition)
    }
  }), [reactFlow]);
}
