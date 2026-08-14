import type { Dispatch, SetStateAction } from 'react';

import type { TdmNode, TdmNodeDraft } from '../../../../domain/tdm-types';

export interface CanvasInteractionStateSetters {
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

export interface UseCanvasInteractionControllerArgs extends CanvasInteractionStateSetters {
  nodes: TdmNode[];
  editingNodeId: string | null;
  emptyDraft: TdmNodeDraft;
  syncEditDraftFromNode: (node: TdmNode) => void;
  openNodeEditor: (nodeId: string) => void;
}
