import type { DragEvent } from 'react';
import type { TdmStage } from '../../../domain/tdm-stages';
import type { StageCreation } from '../../../utils/stage-creation';
import type { TdmBlockForms, TdmSidebarContext } from '../tdm-sidebar.contract';

export type TdmSidebarFeatureProps = {
  isOpen: boolean;
  theoryName: string;
  onTheoryNameChange: (nextValue: string) => void;
  stageCreation: StageCreation;
  stageCounts: Record<TdmStage, number>;
  actionLabel?: string;
  onOrganize?: () => void;
  advanceLabel?: string;
  onAdvance?: () => void;
  canAdvance?: boolean;
  canViewTdmResult: boolean;
  resultAvailabilityMessage: string;
  canRestoreTheory: boolean;
  onRestoreTheory: () => void;
  onViewResult: () => void;
  context: TdmSidebarContext;
  blockForms?: TdmBlockForms | null;
  onStageDragStart?: (event: DragEvent<HTMLElement>, stage: TdmStage) => void;
};
