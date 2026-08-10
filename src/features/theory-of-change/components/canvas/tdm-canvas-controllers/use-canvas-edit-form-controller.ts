import { useCallback } from 'react';

import type { TdmNodeDraft } from '../../../domain/tdm-types';

type UseCanvasEditFormControllerParams = {
  emptyDraft: TdmNodeDraft;
  setEditDraft: (value: TdmNodeDraft) => void;
  setEditError: (value: string | undefined) => void;
  setIsEditAccordionOpen: (value: boolean) => void;
};

export function useCanvasEditFormController({
  emptyDraft,
  setEditDraft,
  setEditError,
  setIsEditAccordionOpen
}: UseCanvasEditFormControllerParams) {
  const clearEditFormState = useCallback(() => {
    setEditDraft({ ...emptyDraft });
    setEditError(undefined);
    setIsEditAccordionOpen(false);
  }, [emptyDraft, setEditDraft, setEditError, setIsEditAccordionOpen]);

  return { clearEditFormState };
}
