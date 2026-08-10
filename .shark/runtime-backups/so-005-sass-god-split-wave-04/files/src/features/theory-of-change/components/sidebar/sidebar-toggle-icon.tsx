'use client';

import styles from './tdm-sidebar.module.sass';

export function SidebarToggleIcon({
  direction,
  className
}: {
  direction: 'left' | 'right';
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={[styles.sidebarToggleSvg, className].filter(Boolean).join(' ')}
      fill="none"
    >
      {direction === 'right' ? (
        <path d="m9 6 6 6-6 6" />
      ) : (
        <path d="m15 6-6 6 6 6" />
      )}
    </svg>
  );
}
