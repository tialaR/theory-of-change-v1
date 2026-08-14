import type { TdmStage } from '../../../../domain/tdm-stages';
import { V1CanvasOrganizationAccordion } from '../../v1-preserved-sidebar-sections';

export function SidebarOrganizationPanel({ id, stageCounts, onOrganize }: { id: string; stageCounts: Record<TdmStage, number>; onOrganize?: () => void }) {
  return <V1CanvasOrganizationAccordion id={id} stageCounts={stageCounts} onOrganize={onOrganize} />;
}
