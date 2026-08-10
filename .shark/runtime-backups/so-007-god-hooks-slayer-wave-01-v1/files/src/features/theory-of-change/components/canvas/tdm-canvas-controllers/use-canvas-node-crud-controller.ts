import { useCallback, type Dispatch, type SetStateAction } from 'react';

import type { TdmStage } from '../../../domain/tdm-stages';
import type { TdmEdge as TdmEdgeModel, TdmNode as TdmNodeModel, TdmNodeDraft } from '../../../domain/tdm-types';
import { createNode } from '../../../utils/create-node';
import { getCreateNodePosition, getDuplicateNodePosition } from '../../../utils/node-placement';
import type { StageCreation } from '../../../utils/stage-creation';

type Setter<T> = Dispatch<SetStateAction<T>>;

type UseCanvasNodeCrudControllerParams = {
  nodes: TdmNodeModel[];
  selectedNode: TdmNodeModel | null;
  selectedNodeId: string | null;
  stageCreation: StageCreation;
  creationDrafts: Record<TdmStage, TdmNodeDraft>;
  editDraft: TdmNodeDraft;
  emptyDraft: TdmNodeDraft;
  quickStageDrafts: Record<TdmStage, TdmNodeDraft>;
  setNodes: Setter<TdmNodeModel[]>;
  setEdges: Setter<TdmEdgeModel[]>;
  setSelectedNodeId: Setter<string | null>;
  setToolbarNodeId: Setter<string | null>;
  setSelectedEdgeId: Setter<string | null>;
  setEditingNodeId: Setter<string | null>;
  setCreationDrafts: Setter<Record<TdmStage, TdmNodeDraft>>;
  setCreationError: Setter<string | undefined>;
  setEditDraft: Setter<TdmNodeDraft>;
  setEditError: Setter<string | undefined>;
  setIsCreateAccordionOpen: Setter<boolean>;
  setIsEditAccordionOpen: Setter<boolean>;
  setMarkerDraft: Setter<string>;
  bumpViewportReset: () => void;
  clearEditFormState: () => void;
};

export function useCanvasNodeCrudController({
  nodes,
  selectedNode,
  selectedNodeId,
  stageCreation,
  creationDrafts,
  editDraft,
  emptyDraft,
  quickStageDrafts,
  setNodes,
  setEdges,
  setSelectedNodeId,
  setToolbarNodeId,
  setSelectedEdgeId,
  setEditingNodeId,
  setCreationDrafts,
  setCreationError,
  setEditDraft,
  setEditError,
  setIsCreateAccordionOpen,
  setIsEditAccordionOpen,
  setMarkerDraft,
  bumpViewportReset,
  clearEditFormState
}: UseCanvasNodeCrudControllerParams) {
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
    [
      nodes,
      setCreationError,
      setEditError,
      setEditingNodeId,
      setIsCreateAccordionOpen,
      setIsEditAccordionOpen,
      setSelectedEdgeId,
      setSelectedNodeId,
      setToolbarNodeId,
      syncEditDraftFromNode
    ]
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

      setNodes((currentNodes) =>
        currentNodes.map((node) => {
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
            data: {
              ...node.data,
              stage: node.stage,
              ...nextNodeData
            }
          };
        })
      );
      setEditingNodeId(null);
      setToolbarNodeId(nodeId);
      setEditError(undefined);

      if (selectedNodeId === nodeId) setEditDraft(nextDraft);
      return true;
    },
    [selectedNodeId, setEditDraft, setEditError, setEditingNodeId, setNodes, setToolbarNodeId]
  );

  const deleteNodeById = useCallback(
    (nodeId: string) => {
      setEdges((currentEdges) => currentEdges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
      setNodes((currentNodes) => currentNodes.filter((node) => node.id !== nodeId));
      setSelectedNodeId((currentSelectedId) => (currentSelectedId === nodeId ? null : currentSelectedId));
      setToolbarNodeId((currentToolbarId) => (currentToolbarId === nodeId ? null : currentToolbarId));
      setSelectedEdgeId(null);
      setEditingNodeId((currentEditingId) => (currentEditingId === nodeId ? null : currentEditingId));
      setMarkerDraft('');
      setEditDraft({ ...emptyDraft });
      setEditError(undefined);
      setIsEditAccordionOpen(false);
      bumpViewportReset();
    },
    [
      bumpViewportReset,
      emptyDraft,
      setEdges,
      setEditDraft,
      setEditError,
      setEditingNodeId,
      setIsEditAccordionOpen,
      setMarkerDraft,
      setNodes,
      setSelectedEdgeId,
      setSelectedNodeId,
      setToolbarNodeId
    ]
  );

  const duplicateNodeById = useCallback(
    (nodeId: string) => {
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
    },
    [
      bumpViewportReset,
      nodes,
      setEditingNodeId,
      setIsCreateAccordionOpen,
      setIsEditAccordionOpen,
      setNodes,
      setSelectedEdgeId,
      setSelectedNodeId,
      setToolbarNodeId,
      syncEditDraftFromNode
    ]
  );

  const duplicateSelectedNode = useCallback(() => {
    if (selectedNode) duplicateNodeById(selectedNode.id);
  }, [duplicateNodeById, selectedNode]);

  const deleteSelectedNode = useCallback(() => {
    if (selectedNode) deleteNodeById(selectedNode.id);
  }, [deleteNodeById, selectedNode]);

  const handleCreateDraftChange = useCallback(
    (nextDraft: TdmNodeDraft) => {
      if (stageCreation === 'ready-to-connect') return;
      setCreationDrafts((currentDrafts) => ({ ...currentDrafts, [stageCreation]: nextDraft }));
      setCreationError(undefined);
    },
    [setCreationDrafts, setCreationError, stageCreation]
  );

  const createNodeFromDraft = useCallback(
    ({ stage, x, y, useQuickDraft = false }: { stage: TdmStage; x?: number; y?: number; useQuickDraft?: boolean }) => {
      const baseDraft = creationDrafts[stage];
      const draft = useQuickDraft ? quickStageDrafts[stage] : baseDraft;
      const title = draft.title.trim();

      if (!title) {
        setCreationError('Preencha o título do bloco antes de adicionar ao canvas.');
        return null;
      }

      const smartPosition = getCreateNodePosition(stage, nodes);
      const createdNode = createNode({
        title,
        stage,
        description: draft.description.trim(),
        advancedDetails: draft.advancedDetails.trim(),
        shortNotes: draft.shortNotes.trim(),
        x: x ?? smartPosition.x,
        y: y ?? smartPosition.y
      });

      setNodes((currentNodes) => [...currentNodes, createdNode]);
      setSelectedNodeId(null);
      setToolbarNodeId(null);
      setSelectedEdgeId(null);
      setEditingNodeId(null);
      clearEditFormState();
      if (!useQuickDraft || creationDrafts[stage].title.trim()) {
        setCreationDrafts((currentDrafts) => ({ ...currentDrafts, [stage]: { ...emptyDraft } }));
      }
      setCreationError(undefined);
      bumpViewportReset();
      return createdNode;
    },
    [
      bumpViewportReset,
      clearEditFormState,
      creationDrafts,
      emptyDraft,
      nodes,
      quickStageDrafts,
      setCreationDrafts,
      setCreationError,
      setEditingNodeId,
      setNodes,
      setSelectedEdgeId,
      setSelectedNodeId,
      setToolbarNodeId
    ]
  );

  const handleCreateNode = useCallback(() => {
    if (stageCreation !== 'ready-to-connect') createNodeFromDraft({ stage: stageCreation });
  }, [createNodeFromDraft, stageCreation]);

  const handleEditDraftChange = useCallback(
    (nextDraft: TdmNodeDraft) => {
      setEditDraft(nextDraft);
      setEditError(undefined);
    },
    [setEditDraft, setEditError]
  );

  const handleSaveSelectedNode = useCallback(() => {
    if (!selectedNode) return;
    if (!editDraft.title.trim()) {
      setEditError('Dê um nome para este bloco antes de adicioná-lo ao canvas.');
      return;
    }
    updateNodeById(selectedNode.id, editDraft);
  }, [editDraft, selectedNode, setEditError, updateNodeById]);

  const handleCreateAccordionOpenChange = useCallback(
    (open: boolean) => {
      setIsCreateAccordionOpen(open);
      if (open) {
        setIsEditAccordionOpen(false);
        setSelectedNodeId(null);
        setToolbarNodeId(null);
        setEditingNodeId(null);
        setEditDraft({ ...emptyDraft });
        setEditError(undefined);
      }
    },
    [
      emptyDraft,
      setEditDraft,
      setEditError,
      setEditingNodeId,
      setIsCreateAccordionOpen,
      setIsEditAccordionOpen,
      setSelectedNodeId,
      setToolbarNodeId
    ]
  );

  const handleEditAccordionOpenChange = useCallback(
    (open: boolean) => {
      setIsEditAccordionOpen(open);
      if (open) setIsCreateAccordionOpen(false);
    },
    [setIsCreateAccordionOpen, setIsEditAccordionOpen]
  );

  return {
    syncEditDraftFromNode,
    openNodeEditor,
    cancelNodeEditor,
    updateNodeById,
    deleteNodeById,
    duplicateNodeById,
    duplicateSelectedNode,
    deleteSelectedNode,
    handleCreateDraftChange,
    createNodeFromDraft,
    handleCreateNode,
    handleEditDraftChange,
    handleSaveSelectedNode,
    handleCreateAccordionOpenChange,
    handleEditAccordionOpenChange
  };
}
