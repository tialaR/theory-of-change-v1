'use client';

import { useCallback, useMemo, type SetStateAction } from 'react';
import { useEdgesState, useNodesState, type Edge, type Node } from '@xyflow/react';
import type { CanvasEdge, CanvasNode } from './canvas-workspace.model';

type CanvasFlowNodeData = {
  stage: CanvasNode['stage'];
  title: string;
  description: string;
  advancedDetails: string;
};

type CanvasFlowEdgeData = {
  relationKind?: CanvasEdge['relationKind'];
  relationTitle?: string;
  relationText?: string;
  relationAdvancedDetails?: string;
};

type CanvasFlowNode = Node<CanvasFlowNodeData, 'canvas-stage'>;
type CanvasFlowEdge = Edge<CanvasFlowEdgeData, 'canvas-causal'>;

function toFlowNode(node: CanvasNode): CanvasFlowNode {
  return {
    id: node.id,
    type: 'canvas-stage',
    position: { x: node.x, y: node.y },
    data: {
      stage: node.stage,
      title: node.title,
      description: node.description,
      advancedDetails: node.advancedDetails
    }
  };
}

function fromFlowNode(node: CanvasFlowNode): CanvasNode {
  return {
    id: node.id,
    stage: node.data.stage,
    title: node.data.title,
    description: node.data.description,
    advancedDetails: node.data.advancedDetails,
    x: node.position.x,
    y: node.position.y
  };
}

function toFlowEdge(edge: CanvasEdge): CanvasFlowEdge {
  return {
    id: edge.id,
    type: 'canvas-causal',
    source: edge.source,
    target: edge.target,
    data: {
      relationKind: edge.relationKind,
      relationTitle: edge.relationTitle,
      relationText: edge.relationText,
      relationAdvancedDetails: edge.relationAdvancedDetails
    }
  };
}

function fromFlowEdge(edge: CanvasFlowEdge): CanvasEdge {
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    relationKind: edge.data?.relationKind,
    relationTitle: edge.data?.relationTitle,
    relationText: edge.data?.relationText,
    relationAdvancedDetails: edge.data?.relationAdvancedDetails
  };
}

function resolveStateAction<T>(action: SetStateAction<T[]>, current: T[]): T[] {
  return typeof action === 'function'
    ? (action as (previous: T[]) => T[])(current)
    : action;
}

export function useCanvasFlowState(
  initialNodes: CanvasNode[],
  initialEdges: CanvasEdge[]
) {
  const [flowNodes, setFlowNodes] = useNodesState<CanvasFlowNode>(initialNodes.map(toFlowNode));
  const [flowEdges, setFlowEdges] = useEdgesState<CanvasFlowEdge>(initialEdges.map(toFlowEdge));

  const nodes = useMemo(() => flowNodes.map(fromFlowNode), [flowNodes]);
  const edges = useMemo(() => flowEdges.map(fromFlowEdge), [flowEdges]);

  const setNodes = useCallback((action: SetStateAction<CanvasNode[]>) => {
    setFlowNodes((currentFlowNodes) => {
      const currentNodes = currentFlowNodes.map(fromFlowNode);
      return resolveStateAction(action, currentNodes).map(toFlowNode);
    });
  }, [setFlowNodes]);

  const setEdges = useCallback((action: SetStateAction<CanvasEdge[]>) => {
    setFlowEdges((currentFlowEdges) => {
      const currentEdges = currentFlowEdges.map(fromFlowEdge);
      return resolveStateAction(action, currentEdges).map(toFlowEdge);
    });
  }, [setFlowEdges]);

  return { nodes, edges, setNodes, setEdges };
}
