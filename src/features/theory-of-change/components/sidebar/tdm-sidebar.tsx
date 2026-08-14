'use client';

import type { ReactNode } from 'react';
import { SidebarToggleIcon } from './sidebar-toggle-icon';
import { TdmSidebarShell } from './tdm-sidebar/tdm-sidebar-shell';

export { SidebarToggleIcon };
export { TdmSidebarFeature } from './tdm-sidebar/tdm-sidebar-feature';
export type { ExportFormat, TdmBlockForms, TdmSidebarContext } from './tdm-sidebar.contract';
export type { TdmSidebarFeatureProps } from './tdm-sidebar/tdm-sidebar.types';

export type TdmSidebarProps = {
  isOpen: boolean;
  children: ReactNode;
};

export function TdmSidebar({ isOpen, children }: TdmSidebarProps) {
  return <TdmSidebarShell isOpen={isOpen}>{children}</TdmSidebarShell>;
}
