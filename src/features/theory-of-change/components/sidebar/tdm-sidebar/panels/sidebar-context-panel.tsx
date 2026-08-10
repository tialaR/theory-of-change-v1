import type { TdmSidebarContext } from '../../tdm-sidebar.contract';
import { TdmSidebarContextPanel } from '../tdm-sidebar-context-panel';

export function SidebarContextPanel({ context }: { context: TdmSidebarContext }) {
  return <TdmSidebarContextPanel context={context} />;
}
