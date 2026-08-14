'use client';

import Link from 'next/link';
import { useEffect, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import styles from './result-experience.module.sass';

const ease = [0.22, 1, 0.36, 1] as const;

type InteractiveExperienceShellProps = {
  title: string;
  backHref: string;
  closeHref: string;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onCenter: () => void;
  onReset: () => void;
  children: ReactNode;
  experienceClassName?: string;
};

export function InteractiveExperienceShell({
  title,
  backHref,
  closeHref,
  zoom,
  onZoomIn,
  onZoomOut,
  onCenter,
  onReset,
  children,
  experienceClassName = ''
}: InteractiveExperienceShellProps) {
  const reduce = useReducedMotion();

  useEffect(() => {
    document.body.classList.add('public-page-scroll');
    return () => document.body.classList.remove('public-page-scroll');
  }, []);

  return (
    <main className={`${styles.interactivePage} ${styles.interactiveExperience} ${experienceClassName}`.trim()}>
      <div className={styles.interactiveFrame}>
        <header className={styles.interactiveTopbar}>
          <div className={styles.interactiveTopbarStart}>
            <Link href={backHref} className={styles.interactiveBackButton} aria-label="Voltar">
              <span aria-hidden="true">←</span>
            </Link>
          </div>

          <h1 className={styles.interactiveTopbarHeading}>{title}</h1>

          <div className={styles.interactiveToolbar}>
            <div className={styles.interactiveToolbarCluster}>
              <button className={styles.toolButton} type="button" aria-label="Aumentar zoom" onClick={onZoomIn}>+</button>
              <span className={styles.interactiveZoomLabel}>{Math.round(zoom * 100)}%</span>
              <button className={styles.toolButton} type="button" aria-label="Diminuir zoom" onClick={onZoomOut}>−</button>
              <span className={styles.interactiveToolbarDivider} aria-hidden="true" />
              <button className={styles.toolButton} type="button" aria-label="Centralizar visualização" onClick={onCenter}>⌖</button>
              <button className={styles.toolButton} type="button" aria-label="Reiniciar visualização" onClick={onReset}>↺</button>
            </div>
            <Link className={styles.interactiveCloseButton} href={closeHref}>Fechar</Link>
          </div>
        </header>

        <motion.section
          className={styles.workspaceShell}
          initial={false}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reduce ? 0.01 : 0.28, ease }}
        >
          {children}
        </motion.section>
      </div>
    </main>
  );
}
