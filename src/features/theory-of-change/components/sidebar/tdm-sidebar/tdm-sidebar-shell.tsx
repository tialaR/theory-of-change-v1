import type { ReactNode } from 'react';
import { TdmSurface } from '@/shared/ui/tdm-surface/tdm-surface';
import styles from '../tdm-sidebar.module.sass';

export function TdmSidebarShell({ isOpen, children }: { isOpen: boolean; children: ReactNode }) {
  return (
    <aside className={[styles.sidebar, isOpen ? styles.open : styles.closed].join(' ')}>
      <TdmSurface as="div" variant="base" padding="none" radius="sm" className={styles.surface}>
        {children}
      </TdmSurface>
    </aside>
  );
}
