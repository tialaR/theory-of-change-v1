'use client';

import { motion, useReducedMotion } from 'motion/react';
import styles from './exemplos.module.sass';

const CANVAS_NODES = [
  { id: 'input', label: 'Insumos', x: '8%', y: '38%', delay: 0 },
  { id: 'activity', label: 'Atividades', x: '32%', y: '28%', delay: 0.15 },
  { id: 'product', label: 'Produtos', x: '56%', y: '42%', delay: 0.3 },
  { id: 'outcome', label: 'Resultados', x: '78%', y: '32%', delay: 0.45 }
] as const;

const RESULT_COLUMNS = [
  { id: 'col-input', label: 'Insumos', items: 2, delay: 0 },
  { id: 'col-activity', label: 'Atividades', items: 2, delay: 0.12 },
  { id: 'col-product', label: 'Produtos', items: 1, delay: 0.24 },
  { id: 'col-outcome', label: 'Resultados', items: 1, delay: 0.36 }
] as const;

function CanvasPreview() {
  const reduceMotion = useReducedMotion();

  return (
    <div className={styles.previewCard}>
      <p className={styles.previewLabel}>Canvas exemplo</p>
      <div className={styles.canvasStage} aria-hidden="true">
        <svg className={styles.canvasEdges} viewBox="0 0 320 180" preserveAspectRatio="none">
          <motion.path
            d="M 50 90 Q 110 60 160 80 T 270 70"
            fill="none"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="1.5"
            initial={{ pathLength: reduceMotion ? 1 : 0, opacity: reduceMotion ? 1 : 0.3 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: reduceMotion ? 0 : 1.2, ease: 'easeInOut', delay: 0.4 }}
          />
        </svg>
        {CANVAS_NODES.map((node) => (
          <motion.div
            key={node.id}
            className={styles.canvasNode}
            style={{ left: node.x, top: node.y }}
            initial={{ opacity: reduceMotion ? 1 : 0, scale: reduceMotion ? 1 : 0.85, y: reduceMotion ? 0 : 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.5, delay: reduceMotion ? 0 : node.delay, ease: 'easeOut' }}
          >
            <span className={styles.canvasNodeLabel}>{node.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ResultPreview() {
  const reduceMotion = useReducedMotion();

  return (
    <div className={styles.previewCard}>
      <p className={styles.previewLabel}>Resultado exemplo</p>
      <div className={styles.resultStage} aria-hidden="true">
        {RESULT_COLUMNS.map((column) => (
          <motion.div
            key={column.id}
            className={styles.resultColumn}
            initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.45, delay: reduceMotion ? 0 : column.delay, ease: 'easeOut' }}
          >
            <span className={styles.resultColumnLabel}>{column.label}</span>
            <div className={styles.resultItems}>
              {Array.from({ length: column.items }).map((_, index) => (
                <motion.div
                  key={`${column.id}-${index}`}
                  className={styles.resultItem}
                  initial={{ opacity: reduceMotion ? 1 : 0, scale: reduceMotion ? 1 : 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: reduceMotion ? 0 : 0.35,
                    delay: reduceMotion ? 0 : column.delay + 0.1 + index * 0.08,
                    ease: 'easeOut'
                  }}
                />
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function ExemplosClient() {
  return (
    <div className={styles.previewGrid}>
      <CanvasPreview />
      <ResultPreview />
    </div>
  );
}
