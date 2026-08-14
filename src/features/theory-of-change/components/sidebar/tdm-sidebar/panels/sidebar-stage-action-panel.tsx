import { V1StageActionSection } from '../../v1-progress-and-stage-action';
import type { TdmSidebarFeatureProps } from '../tdm-sidebar.types';

export function SidebarStageActionPanel({ props }: { props: Omit<TdmSidebarFeatureProps, 'isOpen'> }) {
  return <V1StageActionSection stageCreation={props.stageCreation} actionLabel={props.actionLabel} onStageDragStart={props.onStageDragStart} />;
}
