import type { RefObject } from 'react';
import type { TdmSidebarFeatureProps } from '../tdm-sidebar.types';
import { TdmSidebarProgress } from '../tdm-sidebar-progress';

export function SidebarProgressPanel({ props, boundaryRef }: { props: Omit<TdmSidebarFeatureProps, 'isOpen'>; boundaryRef: RefObject<HTMLDivElement | null> }) {
  return <TdmSidebarProgress stageCreation={props.stageCreation} stageCounts={props.stageCounts} advanceLabel={props.advanceLabel} canAdvance={props.canAdvance} onAdvance={props.onAdvance} boundaryRef={boundaryRef} />;
}
