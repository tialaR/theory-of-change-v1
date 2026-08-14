import { V1FinalResultCard } from '../../v1-preserved-sidebar-sections';

export function SidebarFinalResultPanel({ canViewTdmResult, resultAvailabilityMessage, onViewResult }: { canViewTdmResult: boolean; resultAvailabilityMessage: string; onViewResult: () => void }) {
  return <V1FinalResultCard canViewTdmResult={canViewTdmResult} resultAvailabilityMessage={resultAvailabilityMessage} onViewResult={onViewResult} />;
}
