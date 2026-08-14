import type { TdmBlockForms } from '../../tdm-sidebar.contract';
import { TdmSidebarBlockForms } from '../tdm-sidebar-block-forms';

export function SidebarBlockFormsPanel({ blockForms }: { blockForms?: TdmBlockForms | null }) {
  return <TdmSidebarBlockForms blockForms={blockForms} />;
}
