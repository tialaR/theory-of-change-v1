import { useId, type RefObject } from 'react';
import styles from '../tdm-sidebar.module.sass';
import type { TdmSidebarFeatureProps } from './tdm-sidebar.types';
import { SidebarBlockFormsPanel } from './panels/sidebar-block-forms-panel';
import { SidebarContextPanel } from './panels/sidebar-context-panel';
import { SidebarFinalResultPanel } from './panels/sidebar-final-result-panel';
import { SidebarOrganizationPanel } from './panels/sidebar-organization-panel';
import { SidebarProgressPanel } from './panels/sidebar-progress-panel';
import { SidebarShortcutsPanel } from './panels/sidebar-shortcuts-panel';
import { SidebarStageActionPanel } from './panels/sidebar-stage-action-panel';

type TdmSidebarPanelsProps = {
  props: Omit<TdmSidebarFeatureProps, 'isOpen'>;
  contentRef: RefObject<HTMLDivElement | null>;
};

export function TdmSidebarPanels({ props, contentRef }: TdmSidebarPanelsProps) {
  const organizationId = useId();

  return (
    <div ref={contentRef} className={styles.content}>
      <SidebarProgressPanel props={props} boundaryRef={contentRef} />
      <SidebarStageActionPanel props={props} />
      <SidebarBlockFormsPanel blockForms={props.blockForms} />
      <SidebarContextPanel context={props.context} />
      <SidebarOrganizationPanel id={organizationId} stageCounts={props.stageCounts} onOrganize={props.onOrganize} />
      <SidebarShortcutsPanel canRestoreTheory={props.canRestoreTheory} onRestoreTheory={props.onRestoreTheory} />
      <SidebarFinalResultPanel canViewTdmResult={props.canViewTdmResult} resultAvailabilityMessage={props.resultAvailabilityMessage} onViewResult={props.onViewResult} />
    </div>
  );
}
