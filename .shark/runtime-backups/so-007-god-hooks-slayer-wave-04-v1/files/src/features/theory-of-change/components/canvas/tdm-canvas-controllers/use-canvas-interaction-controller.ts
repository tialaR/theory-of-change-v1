import { useCallback, type Dispatch, type MouseEvent as ReactMouseEvent, type SetStateAction } from 'react';

import type { TdmEdge, TdmNode, TdmNodeDraft } from '../../../domain/tdm-types';

interface UseCanvasInteractionControllerArgs {
  nodes: TdmNode[];
  editingNodeId: string | null;
  emptyDraft: TdmNodeDraft;
  syncEditDraftFromNode: (node: TdmNode) => void;
  openNodeEditor: (nodeId: string) => void;
  setSelectedNodeId: Dispatch<SetStateAction<string | null>>;
  setToolbarNodeId: Dispatch<SetStateAction<string | null>>;
  setSelectedEdgeId: Dispatch<SetStateAction<string | null>>;
  setEditingNodeId: Dispatch<SetStateAction<string | null>>;
  setCreationError: Dispatch<SetStateAction<string | undefined>>;
  setEditError: Dispatch<SetStateAction<string | undefined>>;
  setEditDraft: Dispatch<SetStateAction<TdmNodeDraft>>;
  setIsCreateAccordionOpen: Dispatch<SetStateAction<boolean>>;
  setIsEditAccordionOpen: Dispatch<SetStateAction<boolean>>;
  setMarkerDraft: Dispatch<SetStateAction<string>>;
  setMarkerEditorEdgeId: Dispatch<SetStateAction<string | null>>;
  setGuideTransientMessage: Dispatch<SetStateAction<string | null>>;
}

export function useCanvasInteractionController({
  nodes,
  editingNodeId,
  emptyDraft,
  syncEditDraftFromNode,
  openNodeEditor,
  setSelectedNodeId,
  setToolbarNodeId,
  setSelectedEdgeId,
  setEditingNodeId,
  setCreationError,
  setEditError,
  setEditDraft,
  setIsCreateAccordionOpen,
  setIsEditAccordionOpen,
  setMarkerDraft,
  setMarkerEditorEdgeId,
  setGuideTransientMessage
}: UseCanvasInteractionControllerArgs) {
  const closeToolbarSelection = useCallback(() => {
    if (editingNodeId) return;
    setToolbarNodeId(null);
    setSelectedNodeId(null);
  }, [editingNodeId, setSelectedNodeId, setToolbarNodeId]);

  const handleCloseToolbar = useCallback(() => {
    setToolbarNodeId(null);
  }, [setToolbarNodeId]);

  const handlePaneClick = useCallback(() => {
    if (editingNodeId) return;
    closeToolbarSelection();
    setSelectedEdgeId(null);
    setMarkerDraft('');
    setMarkerEditorEdgeId(null);
    setGuideTransientMessage(null);
    setCreationError(undefined);
    setEditError(undefined);
  }, [
    closeToolbarSelection,
    editingNodeId,
    setCreationError,
    setEditError,
    setGuideTransientMessage,
    setMarkerDraft,
    setMarkerEditorEdgeId,
    setSelectedEdgeId
  ]);

  const handleFlowBackgroundClick = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (editingNodeId) return;
      const target = event.target as HTMLElement;
      if (target.closest('.react-flow__node') || !target.closest('.react-flow')) return;
      closeToolbarSelection();
    },
    [closeToolbarSelection, editingNodeId]
  );

  const focusNodeSelection = useCallback(
    (nodeId: string) => {
      const node = nodes.find((currentNode) => currentNode.id === nodeId);
      if (!node) return;
      setSelectedNodeId(nodeId);
      setToolbarNodeId(nodeId);
      setSelectedEdgeId(null);
      setCreationError(undefined);
      setEditError(undefined);
      syncEditDraftFromNode(node);
      setIsEditAccordionOpen(true);
      setIsCreateAccordionOpen(false);
    },
    [
      nodes,
      setCreationError,
      setEditError,
      setIsCreateAccordionOpen,
      setIsEditAccordionOpen,
      setSelectedEdgeId,
      setSelectedNodeId,
      setToolbarNodeId,
      syncEditDraftFromNode
    ]
  );

  const handleNodeDoubleClick = useCallback(
    (_event: ReactMouseEvent, node: TdmNode) => openNodeEditor(node.id),
    [openNodeEditor]
  );

  const handleNodeClick = useCallback(
    (event: ReactMouseEvent, node: TdmNode) => {
      event.stopPropagation();
      if (editingNodeId && editingNodeId !== node.id) return;
      focusNodeSelection(node.id);
    },
    [editingNodeId, focusNodeSelection]
  );

  const handleEdgeClick = useCallback(
    (_event: ReactMouseEvent, edge: TdmEdge) => {
      setSelectedEdgeId(edge.id);
      setSelectedNodeId(null);
      setToolbarNodeId(null);
      setEditingNodeId(null);
      setCreationError(undefined);
      setEditError(undefined);
      setEditDraft({ ...emptyDraft });
      setIsEditAccordionOpen(false);
      setMarkerDraft(edge.markerText ?? '');
      setGuideTransientMessage(null);
    },
    [
      emptyDraft,
      setCreationError,
      setEditDraft,
      setEditError,
      setEditingNodeId,
      setGuideTransientMessage,
      setIsEditAccordionOpen,
      setMarkerDraft,
      setSelectedEdgeId,
      setSelectedNodeId,
      setToolbarNodeId
    ]
  );

  return {
    handleCloseToolbar,
    handlePaneClick,
    handleFlowBackgroundClick,
    focusNodeSelection,
    handleNodeDoubleClick,
    handleNodeClick,
    handleEdgeClick
  };
}
