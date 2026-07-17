'use client';

import Link from 'next/link';
import styles from './result-toolbar.module.sass';

type ResultToolbarProps = {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onCenter: () => void;
  onReset: () => void;
  closeHref?: string;
  onClose?: () => void;
  closeLabel?: string;
};

export function ResultToolbar({
  zoom,
  onZoomIn,
  onZoomOut,
  onCenter,
  onReset,
  closeHref,
  onClose,
  closeLabel = 'Fechar'
}: ResultToolbarProps) {
  return (
    <>
      <div className={styles.cluster}>
        <button className={styles.toolButton} type="button" aria-label="Aumentar zoom" onClick={onZoomIn}>
          +
        </button>
        <span className={styles.zoomLabel}>{Math.round(zoom * 100)}%</span>
        <button className={styles.toolButton} type="button" aria-label="Diminuir zoom" onClick={onZoomOut}>
          −
        </button>
        <span className={styles.divider} aria-hidden="true" />
        <button className={styles.toolButton} type="button" aria-label="Centralizar visualização" onClick={onCenter}>
          ⌖
        </button>
        <button className={styles.toolButton} type="button" aria-label="Reiniciar visualização" onClick={onReset}>
          ↺
        </button>
      </div>

      {closeHref ? (
        <Link className={styles.closeButton} href={closeHref}>
          {closeLabel}
        </Link>
      ) : (
        <button type="button" className={styles.closeButton} onClick={onClose}>
          {closeLabel}
        </button>
      )}
    </>
  );
}
