'use client';

import { useCallback, useMemo } from 'react';
import { createCanvasNodeId, type CanvasIdTokenFactory } from '../../../domain/canvas-element-id';
import type { CanvasStageId } from '../../../domain/canvas-project';
import { CANVAS_DIMENSIONS } from '../../../domain/canvas-ui.constants';
import type { CanvasStageCopy } from '../../../engine/canvas-engine';
import { appendCanvasEngineNode, removeCanvasEngineNode, updateCanvasEngineNode } from '../../../engine/canvas-engine';
import type { CanvasFlowPosition } from '../../../react-flow/canvas-flow.contracts';
import type { CanvasCausalEdge, CanvasStageNode } from '../../../react-flow/canvas-flow.types';
import type { CaptureCanvasSnapshot, SetCanvasEdges, SetCanvasNodes } from './types';

function createInitialNode(stage: CanvasStageId, id: string, count: number, position: CanvasFlowPosition, copy: CanvasStageCopy): CanvasStageNode {
  return {
    id,
    type: 'canvas-stage',
    position,
    data: {
      stage,
      title: `${copy.singular} ${count}`,
      description: copy.hint,
      advancedDetails: ''
    }
  };
}

type Options = {
  nodes: CanvasStageNode[];
  edges: CanvasCausalEdge[];
  setNodes: SetCanvasNodes;
  setEdges: SetCanvasEdges;
  capture: CaptureCanvasSnapshot;
  getStageCopy: (stage: CanvasStageId) => CanvasStageCopy;
  createDuplicateTitle: (title: string) => string;
  createIdToken: CanvasIdTokenFactory;
};

export function useCanvasNodeCommands(options: Options) {
  const { nodes, edges, setNodes, setEdges, capture, getStageCopy, createDuplicateTitle, createIdToken } = options;
  const counts = useMemo(() => ({
    input: nodes.filter((node) => node.data.stage === 'input').length,
    activity: nodes.filter((node) => node.data.stage === 'activity').length,
    product: nodes.filter((node) => node.data.stage === 'product').length,
    outcome: nodes.filter((node) => node.data.stage === 'outcome').length
  }), [nodes]);

  const createNode = useCallback((stage: CanvasStageId, position: CanvasFlowPosition) => {
    capture();
    const occupiedIds = new Set([...nodes.map((node) => node.id), ...edges.map((edge) => edge.id)]);
    const node = createInitialNode(stage, createCanvasNodeId(stage, occupiedIds, createIdToken), counts[stage] + 1, position, getStageCopy(stage));
    setNodes((items) => appendCanvasEngineNode({ nodes: items, edges }, node).state.nodes);
    return node;
  }, [capture, counts, createIdToken, edges, getStageCopy, nodes, setNodes]);

  const updateNode = useCallback((nodeId: string, patch: Partial<CanvasStageNode['data']>) => {
    setNodes((items) => updateCanvasEngineNode({ nodes: items, edges }, nodeId, (node) => ({ ...node, data: { ...node.data, ...patch } })).state.nodes);
  }, [edges, setNodes]);

  const saveNodeDraft = useCallback((nodeId: string, patch: CanvasStageNode['data']) => {
    capture();
    updateNode(nodeId, patch);
  }, [capture, updateNode]);

  const duplicateNode = useCallback((nodeId: string) => {
    const source = nodes.find((node) => node.id === nodeId);
    if (!source) return null;
    capture();
    const occupiedIds = new Set([...nodes.map((node) => node.id), ...edges.map((edge) => edge.id)]);
    const duplicate: CanvasStageNode = {
      ...structuredClone(source),
      id: createCanvasNodeId(source.data.stage, occupiedIds, createIdToken),
      position: {
        x: Math.min(CANVAS_DIMENSIONS.width - CANVAS_DIMENSIONS.nodeWidth - CANVAS_DIMENSIONS.nodeEdgeGap, source.position.x + CANVAS_DIMENSIONS.duplicateOffset),
        y: Math.min(CANVAS_DIMENSIONS.height - CANVAS_DIMENSIONS.nodeHeight - CANVAS_DIMENSIONS.nodeEdgeGap, source.position.y + CANVAS_DIMENSIONS.duplicateOffset)
      },
      data: { ...source.data, title: createDuplicateTitle(source.data.title) },
      selected: false
    };
    setNodes((items) => appendCanvasEngineNode({ nodes: items, edges }, duplicate).state.nodes);
    return duplicate;
  }, [capture, createDuplicateTitle, createIdToken, edges, nodes, setNodes]);

  const deleteNode = useCallback((nodeId: string) => {
    const node = nodes.find((item) => item.id === nodeId);
    if (!node) return null;
    capture();
    const result = removeCanvasEngineNode({ nodes, edges }, nodeId);
    setNodes(result.state.nodes);
    setEdges(result.state.edges);
    return result.entity;
  }, [capture, edges, nodes, setEdges, setNodes]);

  return { counts, createNode, updateNode, saveNodeDraft, duplicateNode, deleteNode };
}
