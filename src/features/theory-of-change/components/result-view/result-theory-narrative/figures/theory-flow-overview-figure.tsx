'use client';

import { useId } from 'react';
import type { TheoryDocumentFigure } from '../theory-narrative.types';
import styles from './theory-document-figure.module.sass';

type Props = {
  figure: TheoryDocumentFigure;
};

const STAGE_ORDER = ['input', 'activity', 'output', 'outcome'] as const;
const STAGE_TITLE: Record<(typeof STAGE_ORDER)[number], string> = {
  input: 'INSUMOS',
  activity: 'ATIVIDADES',
  output: 'PRODUTOS',
  outcome: 'RESULTADOS'
};
const STAGE_SUBTITLE: Record<(typeof STAGE_ORDER)[number], string> = {
  input: 'Recursos mobilizados',
  activity: 'Ações previstas',
  output: 'Entregas geradas',
  outcome: 'Mudanças esperadas'
};

export function TheoryFlowOverviewFigure({ figure }: Props) {
  const reactId = useId().replace(/:/g, '');
  const arrowId = `overview-arrow-${reactId}`;
  const counts = figure.stageCounts;

  return (
    <figure className={styles.figure} data-figure-kind={figure.kind}>
      <figcaption className={styles.figureTitle}>{figure.title}</figcaption>
      <div className={styles.figureFrame}>
        <svg
          className={styles.svg}
          viewBox="0 0 1200 360"
          role="img"
          aria-label={figure.altText}
        >
          <title>{figure.altText}</title>
          <defs>
            <marker
              id={arrowId}
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto"
            >
              <path d="M0 0 L10 5 L0 10 z" className={styles.arrowHead} />
            </marker>
          </defs>
          <rect width="1200" height="360" className={styles.canvas} />
          {STAGE_ORDER.map((stage, index) => {
            const x = 40 + index * 295;
            const count =
              stage === 'input'
                ? counts?.inputs
                : stage === 'activity'
                  ? counts?.activities
                  : stage === 'output'
                    ? counts?.products
                    : counts?.results;
            return (
              <g key={stage} transform={`translate(${x},90)`}>
                <rect width="230" height="120" rx="8" className={styles.stageRect} />
                <text x="115" y="48" textAnchor="middle" className={styles.stageTitle}>
                  {STAGE_TITLE[stage]}
                </text>
                <text x="115" y="78" textAnchor="middle" className={styles.stageSubtitle}>
                  {STAGE_SUBTITLE[stage]}
                </text>
                {typeof count === 'number' ? (
                  <text x="115" y="102" textAnchor="middle" className={styles.stageCount}>
                    {count}
                  </text>
                ) : null}
              </g>
            );
          })}
          {[280, 575, 870].map((x) => (
            <line
              key={x}
              x1={x}
              y1="150"
              x2={x + 45}
              y2="150"
              className={styles.arrowLine}
              markerEnd={`url(#${arrowId})`}
            />
          ))}
          <g className={styles.markerGroup}>
            <rect x="280" y="245" width="110" height="36" rx="18" className={styles.markerPill} />
            <text x="335" y="268" textAnchor="middle">
              RISCO
            </text>
            <rect x="575" y="245" width="110" height="36" rx="18" className={styles.markerPill} />
            <text x="630" y="268" textAnchor="middle">
              RISCO
            </text>
            <rect x="870" y="245" width="130" height="36" rx="18" className={styles.markerPill} />
            <text x="935" y="268" textAnchor="middle">
              HIPÓTESE
            </text>
          </g>
        </svg>
      </div>
      <p className={styles.source}>{figure.sourceNote}</p>
    </figure>
  );
}
