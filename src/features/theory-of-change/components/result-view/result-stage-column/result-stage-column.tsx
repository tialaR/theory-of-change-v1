'use client';

import type { CSSProperties, ReactNode } from 'react';
import type { TdmStage } from '@/features/theory-of-change/domain/tdm-stages';
import { STAGE_META } from '../result-view.constants';
import styles from './result-stage-column.module.sass';

type ResultStageColumnProps = {
  stage: TdmStage;
  count: number;
  isDimmed: boolean;
  children: ReactNode;
};

export function ResultStageColumn({ stage, count, isDimmed, children }: ResultStageColumnProps) {
  const meta = STAGE_META[stage];
  const countLabel = `${count} ${count === 1 ? 'item' : 'itens'}`;
  const ariaLabel = `${meta.label}, ${countLabel}`;

  return (
    <div
      data-result-column={stage}
      className={[styles.columnHost, isDimmed ? styles.dimmed : ''].filter(Boolean).join(' ')}
      style={
        {
          '--stage-color': meta.accent,
          '--stage-soft': meta.accentSoft
        } as CSSProperties
      }
      aria-label={ariaLabel}
    >
      <section className={styles.panel}>
        <header className={styles.header}>
          <div className={styles.headingGroup}>
            <span className={styles.headingDot} aria-hidden="true" />
            <h2 className={styles.heading}>{meta.label.toUpperCase()}</h2>
          </div>
          <span className={styles.count}>{countLabel}</span>
        </header>
        <div className={styles.divider} aria-hidden="true" />
        <div className={styles.cardList}>{children}</div>
      </section>
    </div>
  );
}
