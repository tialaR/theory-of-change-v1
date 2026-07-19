'use client';

import { TDM_STAGE_LABELS, type TdmStage } from '../../../domain/tdm-stages';
import styles from './tdm-canvas-node-card.module.sass';

export function TdmCanvasNodeCardHeader({ stage }: { stage: TdmStage }) {
  return (
    <header className={styles.cardHeader}>
      <span className={styles.stageLabel}>{TDM_STAGE_LABELS[stage].toUpperCase()}</span>
      <span className={styles.indicator} aria-hidden="true">
        <span className={styles.indicatorDot} />
      </span>
    </header>
  );
}

export function TdmCanvasNodeCard({
  stage,
  title,
  description
}: {
  stage: TdmStage;
  title: string;
  description?: string;
}) {
  return (
    <div className={styles.compactBody}>
      <TdmCanvasNodeCardHeader stage={stage} />
      <h3 className={styles.title}>{title}</h3>
      {description ? <p className={styles.summary}>{description}</p> : null}
    </div>
  );
}
