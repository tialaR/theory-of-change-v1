'use client';

import { useId } from 'react';
import type { TheoryDocumentFigure } from '../theory-narrative.types';
import styles from './theory-document-figure.module.sass';

type Props = {
  figure: TheoryDocumentFigure;
};

function truncate(title: string, max = 28): string {
  const clean = title.trim();
  if (clean.length <= max) {
    return clean;
  }
  return `${clean.slice(0, max - 1)}…`;
}

export function TheoryResourcesMapFigure({ figure }: Props) {
  const reactId = useId().replace(/:/g, '');
  const arrowId = `resources-arrow-${reactId}`;
  const inputs = (figure.nodes ?? []).filter((node) => node.stage === 'input');
  const activities = (figure.nodes ?? []).filter((node) => node.stage === 'activity');
  const edges = figure.edges ?? [];

  const inputY = (index: number, total: number) => {
    if (total <= 1) {
      return 280;
    }
    const span = 360;
    const start = 120;
    return start + (span / Math.max(total - 1, 1)) * index;
  };

  const activityY = (index: number, total: number) => {
    if (total <= 1) {
      return 280;
    }
    const span = 280;
    const start = 160;
    return start + (span / Math.max(total - 1, 1)) * index;
  };

  const inputPos = new Map(inputs.map((node, index) => [node.id, { x: 150, y: inputY(index, inputs.length) }]));
  const activityPos = new Map(
    activities.map((node, index) => [node.id, { x: 750, y: activityY(index, activities.length) }])
  );

  return (
    <figure className={styles.figure} data-figure-kind={figure.kind}>
      <figcaption className={styles.figureTitle}>{figure.title}</figcaption>
      <div className={styles.figureFrame}>
        <svg className={styles.svg} viewBox="0 0 1000 560" role="img" aria-label={figure.altText}>
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
          <rect width="1000" height="560" className={styles.canvas} />
          <text x="150" y="48" textAnchor="middle" className={styles.columnLabel}>
            INSUMOS
          </text>
          <text x="750" y="48" textAnchor="middle" className={styles.columnLabel}>
            ATIVIDADES
          </text>

          {edges.map((edge) => {
            const from = inputPos.get(edge.sourceId);
            const to = activityPos.get(edge.targetId);
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

          {inputs.map((node) => {
            const pos = inputPos.get(node.id);
            if (!pos) {
              return null;
            }
            return (
              <g key={node.id} transform={`translate(${pos.x - 110}, ${pos.y - 28})`}>
                <rect width="220" height="56" rx="8" className={styles.nodeRect} />
                <text x="110" y="34" textAnchor="middle" className={styles.nodeTitle}>
                  {truncate(node.title)}
                </text>
              </g>
            );
          })}

          {activities.map((node) => {
            const pos = activityPos.get(node.id);
            if (!pos) {
              return null;
            }
            return (
              <g key={node.id} transform={`translate(${pos.x - 110}, ${pos.y - 28})`}>
                <rect width="220" height="56" rx="8" className={styles.nodeRect} />
                <text x="110" y="34" textAnchor="middle" className={styles.nodeTitle}>
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
