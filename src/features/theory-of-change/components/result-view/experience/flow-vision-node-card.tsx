'use client';

import { motion, useReducedMotion } from 'motion/react';
import type { TdmNode } from '@/features/theory-of-change/domain/tdm-types';
import { RESULT_MOTION, STAGE_META } from '../result-view.constants';
import type { CustomStyle } from '../result-view.types';
import styles from './flow-vision-node-card.module.sass';

type FlowVisionNodeCardProps = {
  node: TdmNode;
  isSelected: boolean;
  isRelated: boolean;
  isRelatedOnly: boolean;
  isReceded: boolean;
  onSelect: (nodeId: string) => void;
  registerRef: (nodeId: string, element: HTMLButtonElement | null) => void;
};

function getCompactSummary(node: TdmNode): string {
  const notes = node.shortNotes?.trim();
  if (notes) {
    return notes;
  }

  const description = node.description?.trim();
  if (description) {
    return description;
  }

  return node.advancedDetails?.trim() ?? '';
}

export function FlowVisionNodeCard({
  node,
  isSelected,
  isRelated,
  isRelatedOnly,
  isReceded,
  onSelect,
  registerRef
}: FlowVisionNodeCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const meta = STAGE_META[node.stage];
  const summary = getCompactSummary(node);

  return (
    <motion.button
      ref={(element) => registerRef(node.id, element)}
      type="button"
      className={[
        styles.button,
        isRelated ? '' : styles.disabled,
        isReceded ? styles.receded : ''
      ]
        .filter(Boolean)
        .join(' ')}
      data-result-node-id={node.id}
      data-selected={isSelected ? 'true' : 'false'}
      data-related={isRelatedOnly ? 'true' : 'false'}
      style={{ '--stage-color': meta.accent, '--stage-soft': meta.accentSoft } as CustomStyle}
      onClick={() => onSelect(node.id)}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
      initial={false}
      animate={{
        y: shouldReduceMotion ? 0 : isSelected ? -4 : isRelatedOnly ? -1 : 0
      }}
      transition={{ duration: shouldReduceMotion ? 0.01 : RESULT_MOTION.cardDuration, ease: RESULT_MOTION.ease }}
      aria-label={`${node.title}, ${meta.label}`}
    >
      <article
        className={[
          styles.card,
          isSelected ? styles.selected : '',
          isRelatedOnly ? styles.related : ''
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <header className={styles.cardHeader}>
          <span className={styles.stageLabel}>{meta.label.toUpperCase()}</span>
          <span className={styles.icon} aria-hidden="true">
            <span className={styles.iconDot} />
          </span>
        </header>
        <h3 className={styles.title}>{node.title}</h3>
        {summary ? <p className={styles.summary}>{summary}</p> : null}
      </article>
    </motion.button>
  );
}
