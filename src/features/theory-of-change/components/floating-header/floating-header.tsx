'use client';

import { TdmIconButton } from '@/shared/ui/tdm-icon-button/tdm-icon-button';
import styles from './floating-header.module.sass';

export function FloatingHeader({ isSidebarOpen, onToggleSidebar }: { isSidebarOpen: boolean; onToggleSidebar: () => void; }) {
  return (
    <header className={styles.header}>
      <div>
        <p className={styles.kicker}>Teoria da Mudança</p>
        <h1 className={styles.title}>Teoria da Mudança</h1>
      </div>
      <TdmIconButton
        aria-label={isSidebarOpen ? 'Esconder sidebar' : 'Mostrar sidebar'}
        variant="ghost"
        size="md"
        onClick={onToggleSidebar}
      >
        {isSidebarOpen ? '—' : '+'}
      </TdmIconButton>
    </header>
  );
}
