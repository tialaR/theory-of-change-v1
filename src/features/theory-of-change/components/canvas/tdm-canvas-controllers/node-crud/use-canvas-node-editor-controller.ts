import { useCallback } from 'react';

import type { TdmEdge as TdmEdgeModel, TdmNode as TdmNodeModel, TdmNodeDraft } from '../../../../domain/tdm-types';
import type { Setter } from './types';

type Params = {
  nodes: TdmNodeModel[];
  selectedNode: TdmNodeModel | null;
  selectedNodeId: string | null;
  editDraft: TdmNodeDraft;
  setNodes: Setter<TdmNodeModel[]>;
  setSelectedNodeId: Setter<string | null>;
  setToolbarNodeId: Setter<string | null>;
  setSelectedEdgeId: Setter<string | null>;
  setEditingNodeId: Setter<string | null>;
  setCreationError: Setter<string | undefined>;
  setEditDraft: Setter<TdmNodeDraft>;
  setEditError: Setter<string | undefined>;
  setIsCreateAccordionOpen: Setter<boolean>;
  setIsEditAccordionOpen: Setter<boolean>;
};

export function useCanvasNodeEditorController({
  nodes,
  selectedNode,
  selectedNodeId,
  editDraft,
  setNodes,
  setSelectedNodeId,
  setToolbarNodeId,
  setSelectedEdgeId,
  setEditingNodeId,
  setCreationError,
  setEditDraft,
  setEditError,
  setIsCreateAccordionOpen,
  setIsEditAccordionOpen
}: Params) {
  const syncEditDraftFromNode = useCallback(
    (node: TdmNodeModel) => {
      setEditDraft({
        title: node.title,
        description: node.description,
        advancedDetails: node.advancedDetails,
        shortNotes: node.shortNotes
      });
    },
    [setEditDraft]
  );

  const openNodeEditor = useCallback(
    (nodeId: string) => {
      const node = nodes.find((currentNode) => currentNode.id === nodeId);
      if (!node) return;

      setSelectedNodeId(node.id);
      setToolbarNodeId(null);
      setSelectedEdgeId(null);
      setCreationError(undefined);
      setEditError(undefined);
      syncEditDraftFromNode(node);
      setEditingNodeId(node.id);
      setIsEditAccordionOpen(true);
      setIsCreateAccordionOpen(false);
    },
    [nodes, setCreationError, setEditError, setEditingNodeId, setIsCreateAccordionOpen, setIsEditAccordionOpen, setSelectedEdgeId, setSelectedNodeId, setToolbarNodeId, syncEditDraftFromNode]
  );

  const cancelNodeEditor = useCallback(() => {
    setEditingNodeId(null);
    setEditError(undefined);
    if (selectedNode) {
      syncEditDraftFromNode(selectedNode);
      setToolbarNodeId(selectedNode.id);
    }
  }, [selectedNode, setEditError, setEditingNodeId, setToolbarNodeId, syncEditDraftFromNode]);

  const updateNodeById = useCallback(
    (nodeId: string, nextDraft: TdmNodeDraft) => {
      const title = nextDraft.title.trim();
      if (!title) return false;

      setNodes((currentNodes) => currentNodes.map((node) => {
        if (node.id !== nodeId) return node;
        const nextNodeData = {
          title,
          description: nextDraft.description.trim(),
          advancedDetails: nextDraft.advancedDetails.trim(),
          shortNotes: nextDraft.shortNotes.trim()
        };
        return {
          ...node,
          ...nextNodeData,
          updatedAt: new Date().toISOString(),
          data: { ...node.data, stage: node.stage, ...nextNodeData }
        };
      }));
      setEditingNodeId(null);
      setToolbarNodeId(nodeId);
      setEditError(undefined);
      if (selectedNodeId === nodeId) setEditDraft(nextDraft);
      return true;
    },
    [selectedNodeId, setEditDraft, setEditError, setEditingNodeId, setNodes, setToolbarNodeId]
  );

  const handleEditDraftChange = useCallback((nextDraft: TdmNodeDraft) => {
    setEditDraft(nextDraft);
    setEditError(undefined);
  }, [setEditDraft, setEditError]);

  const handleSaveSelectedNode = useCallback(() => {
    if (!selectedNode) return;
    if (!editDraft.title.trim()) {
      setEditError('Dê um nome para este bloco antes de adicioná-lo ao canvas.');
      return;
    }
    updateNodeById(selectedNode.id, editDraft);
  }, [editDraft, selectedNode, setEditError, updateNodeById]);

  return { syncEditDraftFromNode, openNodeEditor, cancelNodeEditor, updateNodeById, handleEditDraftChange, handleSaveSelectedNode };
}
