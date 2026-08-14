'use client';

import { TdmSidebarContent } from './tdm-sidebar-content';
import { TdmSidebarShell } from './tdm-sidebar-shell';
import type { TdmSidebarFeatureProps } from './tdm-sidebar.types';

export function TdmSidebarFeature({ isOpen, ...contentProps }: TdmSidebarFeatureProps) {
  return (
    <TdmSidebarShell isOpen={isOpen}>
      <TdmSidebarContent {...contentProps} />
    </TdmSidebarShell>
  );
}
