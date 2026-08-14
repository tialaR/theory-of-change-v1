'use client';

import { useId } from 'react';
import type { TheoryDocumentFigure } from '../theory-narrative.types';
import styles from './theory-document-figure.module.sass';

type Props = {
  figure: TheoryDocumentFigure;
};

function truncate(title: string, max = 26): string {
  const clean = title.trim();
  if (clean.length <= max) {
    return clean;
  }
  return `${clean.slice(0, max - 1)}…`;
}

export function TheoryConvergenceMapFigure({ figure }: Props) {
  const reactId = useId().replace(/:/g, '');
  const arrowId = `convergence-arrow-${reactId}`;
  const activities = (figure.nodes ?? []).filter((node) => node.stage === 'activity');
  const products = (figure.nodes ?? []).filter((node) => node.stage === 'output');
  const results = (figure.nodes ?? []).filter((node) => node.stage === 'outcome');
  const edges = figure.edges ?? [];

  const colY = (index: number, total: number, center = 320) => {
    if (total <= 1) {
      return center;
    }
    const span = Math.min(360, 80 * (total - 1));
    const start = center - span / 2;
    return start + (span / Math.max(total - 1, 1)) * index;
  };

  const activityPos = new Map(
    activities.map((node, index) => [node.id, { x: 180, y: colY(index, activities.length) }])
  );
  const productPos = new Map(
    products.map((node, index) => [node.id, { x: 560, y: colY(index, products.length) }])
  );
  const resultPos = new Map(
    results.map((node, index) => [node.id, { x: 940, y: colY(index, results.length) }])
  );

  const resolvePos = (id: string) => activityPos.get(id) ?? productPos.get(id) ?? resultPos.get(id);

  return (
    <figure className={styles.figure} data-figure-kind={figure.kind}>
      <figcaption className={styles.figureTitle}>{figure.title}</figcaption>
      <div className={styles.figureFrame}>
        <svg className={styles.svg} viewBox="0 0 1120 640" role="img" aria-label={figure.altText}>
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
          <rect width="1120" height="640" className={styles.canvas} />
          <text x="180" y="48" textAnchor="middle" className={styles.columnLabel}>
            ATIVIDADES
          </text>
          <text x="560" y="48" textAnchor="middle" className={styles.columnLabel}>
            PRODUTOS
          </text>
          <text x="940" y="48" textAnchor="middle" className={styles.columnLabel}>
            RESULTADO
          </text>

          {edges.map((edge) => {
            const from = resolvePos(edge.sourceId);
            const to = resolvePos(edge.targetId);
            if (!from || !to) {
              return null;
            }
            const midX = (from.x + 110 + to.x - 110) / 2;
            return (
              <g key={edge.id}>
                <path
                  d={`M ${from.x + 110} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${to.x - 110} ${to.y}`}
                  className={styles.pathLine}
                  markerEnd={`url(#${arrowId})`}
                />
                {edge.marker ? (
                  <text x={midX} y={(from.y + to.y) / 2 - 8} textAnchor="middle" className={styles.edgeMarker}>
                    {edge.marker}
                  </text>
                ) : null}
              </g>
            );
          })}

          {[...activityPos.entries(), ...productPos.entries(), ...resultPos.entries()].map(([id, pos]) => {
            const node = figure.nodes?.find((item) => item.id === id);
            if (!node) {
              return null;
            }
            const height = node.stage === 'outcome' ? 72 : 56;
            return (
              <g key={id} transform={`translate(${pos.x - 110}, ${pos.y - height / 2})`}>
                <rect width="220" height={height} rx="8" className={styles.nodeRect} />
                <text x="110" y={height / 2 + 5} textAnchor="middle" className={styles.nodeTitle}>
                  {truncate(node.title)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <p className={styles.source}>{figure.sourceNote}</p>
    </figure>
  );
}
