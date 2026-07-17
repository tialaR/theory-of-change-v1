'use client';

import { motion, useReducedMotion } from 'motion/react';
import type { TdmNode } from '@/features/theory-of-change/domain/tdm-types';
import { RESULT_MOTION, STAGE_META } from '../result-view.constants';
import type { CustomStyle } from '../result-view.types';
import styles from './result-node-card.module.sass';

type ResultNodeCardProps = {
  node: TdmNode;
  incomingCount: number;
  outgoingCount: number;
  isSelected: boolean;
  isRelated: boolean;
  isRelatedOnly: boolean;
  isReceded: boolean;
  onSelect: (nodeId: string) => void;
  registerRef: (nodeId: string, element: HTMLButtonElement | null) => void;
};

export function ResultNodeCard({
  node,
  incomingCount,
  outgoingCount,
  isSelected,
  isRelated,
  isRelatedOnly,
  isReceded,
  onSelect,
  registerRef
}: ResultNodeCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const meta = STAGE_META[node.stage];
  const hasDetails = Boolean(node.advancedDetails?.trim());
  const hasNotes = Boolean(node.shortNotes?.trim());
  const hasDirectionalConnections = incomingCount > 0 || outgoingCount > 0;

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
          <span className={styles.icon} aria-hidden="true">
            <span className={styles.iconDot} />
          </span>
          <h3 className={styles.title}>{node.title}</h3>
          {hasDirectionalConnections ? (
            <div className={styles.connections} aria-label="Conexões do card">
              {incomingCount > 0 ? (
                <span className={styles.count} aria-label={`${incomingCount} conexões de entrada`}>
                  <span className={styles.arrow} aria-hidden="true">
                    ←
                  </span>
                  <span>{incomingCount}</span>
                </span>
              ) : null}
              {outgoingCount > 0 ? (
                <span className={styles.count} aria-label={`${outgoingCount} conexões de saída`}>
                  <span className={styles.arrow} aria-hidden="true">
                    →
                  </span>
                  <span>{outgoingCount}</span>
                </span>
              ) : null}
            </div>
          ) : null}
        </header>

        <p className={styles.description}>{node.description}</p>

        {hasDetails ? (
          <section className={styles.section}>
            <h4 className={styles.label}>DETALHES</h4>
            <p className={styles.copy}>{node.advancedDetails}</p>
          </section>
        ) : null}

        {hasNotes ? (
          <section className={[styles.section, styles.notesSection].join(' ')}>
            <h4 className={styles.label}>NOTAS</h4>
            <p className={styles.copy}>{node.shortNotes}</p>
          </section>
        ) : null}
      </article>
    </motion.button>
  );
}
