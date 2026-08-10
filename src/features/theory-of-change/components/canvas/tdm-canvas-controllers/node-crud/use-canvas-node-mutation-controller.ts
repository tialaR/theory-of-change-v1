import { useCallback } from 'react';

import type { TdmEdge as TdmEdgeModel, TdmNode as TdmNodeModel, TdmNodeDraft } from '../../../../domain/tdm-types';
import { createNode } from '../../../../utils/create-node';
import { getDuplicateNodePosition } from '../../../../utils/node-placement';
import type { Setter } from './types';

type Params = {
  nodes: TdmNodeModel[];
  selectedNode: TdmNodeModel | null;
  emptyDraft: TdmNodeDraft;
  setNodes: Setter<TdmNodeModel[]>;
  setEdges: Setter<TdmEdgeModel[]>;
  setSelectedNodeId: Setter<string | null>;
  setToolbarNodeId: Setter<string | null>;
  setSelectedEdgeId: Setter<string | null>;
  setEditingNodeId: Setter<string | null>;
  setEditDraft: Setter<TdmNodeDraft>;
  setEditError: Setter<string | undefined>;
  setIsCreateAccordionOpen: Setter<boolean>;
  setIsEditAccordionOpen: Setter<boolean>;
  setMarkerDraft: Setter<string>;
  bumpViewportReset: () => void;
  syncEditDraftFromNode: (node: TdmNodeModel) => void;
};

export function useCanvasNodeMutationController(params: Params) {
  const { nodes, selectedNode, emptyDraft, setNodes, setEdges, setSelectedNodeId, setToolbarNodeId, setSelectedEdgeId, setEditingNodeId, setEditDraft, setEditError, setIsCreateAccordionOpen, setIsEditAccordionOpen, setMarkerDraft, bumpViewportReset, syncEditDraftFromNode } = params;

  const deleteNodeById = useCallback((nodeId: string) => {
    setEdges((currentEdges) => currentEdges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    setNodes((currentNodes) => currentNodes.filter((node) => node.id !== nodeId));
    setSelectedNodeId((currentId) => currentId === nodeId ? null : currentId);
    setToolbarNodeId((currentId) => currentId === nodeId ? null : currentId);
    setSelectedEdgeId(null);
    setEditingNodeId((currentId) => currentId === nodeId ? null : currentId);
    setMarkerDraft('');
    setEditDraft({ ...emptyDraft });
    setEditError(undefined);
    setIsEditAccordionOpen(false);
    bumpViewportReset();
  }, [bumpViewportReset, emptyDraft, setEdges, setEditDraft, setEditError, setEditingNodeId, setIsEditAccordionOpen, setMarkerDraft, setNodes, setSelectedEdgeId, setSelectedNodeId, setToolbarNodeId]);

  const duplicateNodeById = useCallback((nodeId: string) => {
    const sourceNode = nodes.find((node) => node.id === nodeId);
    if (!sourceNode) return;
    const position = getDuplicateNodePosition(sourceNode, nodes);
    const clonedNode = createNode({
      title: `${sourceNode.title} cópia`,
      stage: sourceNode.stage,
      description: sourceNode.description,
      advancedDetails: sourceNode.advancedDetails,
      shortNotes: sourceNode.shortNotes,
      x: position.x,
      y: position.y
    });
    setNodes((currentNodes) => [...currentNodes, clonedNode]);
    setSelectedNodeId(clonedNode.id);
    setToolbarNodeId(null);
    setSelectedEdgeId(null);
    setEditingNodeId(null);
    syncEditDraftFromNode(clonedNode);
    setIsEditAccordionOpen(true);
    setIsCreateAccordionOpen(false);
    bumpViewportReset();
  }, [bumpViewportReset, nodes, setEditingNodeId, setIsCreateAccordionOpen, setIsEditAccordionOpen, setNodes, setSelectedEdgeId, setSelectedNodeId, setToolbarNodeId, syncEditDraftFromNode]);

  const duplicateSelectedNode = useCallback(() => {
    if (selectedNode) duplicateNodeById(selectedNode.id);
  }, [duplicateNodeById, selectedNode]);

  const deleteSelectedNode = useCallback(() => {
    if (selectedNode) deleteNodeById(selectedNode.id);
  }, [deleteNodeById, selectedNode]);

  return { deleteNodeById, duplicateNodeById, duplicateSelectedNode, deleteSelectedNode };
}
