import { useCallback } from 'react';

import type { TdmNodeDraft } from '../../../../domain/tdm-types';
import type { Setter } from './types';

type Params = {
  emptyDraft: TdmNodeDraft;
  setSelectedNodeId: Setter<string | null>;
  setToolbarNodeId: Setter<string | null>;
  setEditingNodeId: Setter<string | null>;
  setEditDraft: Setter<TdmNodeDraft>;
  setEditError: Setter<string | undefined>;
  setIsCreateAccordionOpen: Setter<boolean>;
  setIsEditAccordionOpen: Setter<boolean>;
};

export function useCanvasNodeAccordionController(params: Params) {
  const { emptyDraft, setSelectedNodeId, setToolbarNodeId, setEditingNodeId, setEditDraft, setEditError, setIsCreateAccordionOpen, setIsEditAccordionOpen } = params;

  const handleCreateAccordionOpenChange = useCallback((open: boolean) => {
    setIsCreateAccordionOpen(open);
    if (open) {
      setIsEditAccordionOpen(false);
      setSelectedNodeId(null);
      setToolbarNodeId(null);
      setEditingNodeId(null);
      setEditDraft({ ...emptyDraft });
      setEditError(undefined);
    }
  }, [emptyDraft, setEditDraft, setEditError, setEditingNodeId, setIsCreateAccordionOpen, setIsEditAccordionOpen, setSelectedNodeId, setToolbarNodeId]);

  const handleEditAccordionOpenChange = useCallback((open: boolean) => {
    setIsEditAccordionOpen(open);
    if (open) setIsCreateAccordionOpen(false);
  }, [setIsCreateAccordionOpen, setIsEditAccordionOpen]);

  return { handleCreateAccordionOpenChange, handleEditAccordionOpenChange };
}
