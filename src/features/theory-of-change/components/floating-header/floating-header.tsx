'use client';

import { IconButton } from '@/shared/ui/icon-button/icon-button';
import styles from './floating-header.module.sass';

export function FloatingHeader({ isSidebarOpen, onToggleSidebar }: { isSidebarOpen: boolean; onToggleSidebar: () => void; }) {
  return (
    <header className={styles.header}>
      <div>
        <p className={styles.kicker}>Teoria da Mudança</p>
        <h1 className={styles.title}>Teoria da Mudança</h1>
      </div>
      <IconButton aria-label={isSidebarOpen ? 'Esconder sidebar' : 'Mostrar sidebar'} onClick={onToggleSidebar}>
        {isSidebarOpen ? '—' : '+'}
      </IconButton>
    </header>
  );
}
