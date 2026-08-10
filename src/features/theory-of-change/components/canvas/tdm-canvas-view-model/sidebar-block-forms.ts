import type { TdmStage } from '../../../domain/tdm-stages';
import type { TdmNode, TdmNodeDraft } from '../../../domain/tdm-types';
import type { StageCreation } from '../../../utils/stage-creation';
import type { TdmBlockForms } from '../../sidebar/tdm-sidebar';

export type SidebarBlockFormsInput = {
  stageCreation: StageCreation;
  creationDrafts: Record<TdmStage, TdmNodeDraft>;
  creationError?: string;
  isCreateAccordionOpen: boolean;
  editDraft: TdmNodeDraft;
  editError?: string;
  isEditAccordionOpen: boolean;
  selectedNode: TdmNode | null;
  onCreateOpenChange: (open: boolean) => void;
  onCreateDraftChange: (nextDraft: TdmNodeDraft) => void;
  onCreate: () => void;
  onEditOpenChange: (open: boolean) => void;
  onEditDraftChange: (nextDraft: TdmNodeDraft) => void;
  onSaveEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
};

export function buildSidebarBlockForms(input: SidebarBlockFormsInput): TdmBlockForms | null {
  if (input.stageCreation === 'ready-to-connect') return null;
  const stage = input.stageCreation;

  return {
    stage,
    create: {
      draft: input.creationDrafts[stage],
      errorMessage: input.creationError,
      isOpen: input.isCreateAccordionOpen,
      onOpenChange: input.onCreateOpenChange,
      onDraftChange: input.onCreateDraftChange,
      onSubmit: input.onCreate
    },
    edit: {
      draft: input.editDraft,
      errorMessage: input.editError,
      isOpen: input.isEditAccordionOpen,
      selectedStage: input.selectedNode?.stage ?? null,
      onOpenChange: input.onEditOpenChange,
      onDraftChange: input.onEditDraftChange,
      onSubmit: input.onSaveEdit,
      onDuplicate: input.onDuplicate,
      onDelete: input.onDelete
    }
  };
}
