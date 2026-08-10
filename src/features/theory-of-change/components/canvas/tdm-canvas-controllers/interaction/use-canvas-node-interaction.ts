import { useCallback, type MouseEvent as ReactMouseEvent } from 'react';

import type { TdmNode } from '../../../../domain/tdm-types';
import type { CanvasInteractionStateSetters } from './types';

interface UseCanvasNodeInteractionArgs
  extends Pick<
    CanvasInteractionStateSetters,
    | 'setSelectedNodeId'
    | 'setToolbarNodeId'
    | 'setSelectedEdgeId'
    | 'setCreationError'
    | 'setEditError'
    | 'setIsCreateAccordionOpen'
    | 'setIsEditAccordionOpen'
  > {
  nodes: TdmNode[];
  editingNodeId: string | null;
  syncEditDraftFromNode: (node: TdmNode) => void;
  openNodeEditor: (nodeId: string) => void;
}

export function useCanvasNodeInteraction({
  nodes,
  editingNodeId,
  syncEditDraftFromNode,
  openNodeEditor,
  setSelectedNodeId,
  setToolbarNodeId,
  setSelectedEdgeId,
  setCreationError,
  setEditError,
  setIsCreateAccordionOpen,
  setIsEditAccordionOpen
}: UseCanvasNodeInteractionArgs) {
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

  return { focusNodeSelection, handleNodeDoubleClick, handleNodeClick };
}
