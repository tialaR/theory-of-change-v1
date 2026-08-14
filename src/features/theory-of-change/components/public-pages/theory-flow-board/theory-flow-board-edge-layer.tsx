'use client';

import { motion, useReducedMotion } from 'motion/react';
import type { DiagramEdge } from '../../result-view/experience/types';
import { getEdgeBadges } from '../../result-view/experience/result-experience-data';
import styles from '../public-pages.module.sass';

type TheoryFlowBoardEdgeLayerProps = {
  diagramEdges: DiagramEdge[];
  relatedEdges: Set<string>;
  hasSelection: boolean;
  mode: 'preview' | 'interactive';
};

export function TheoryFlowBoardEdgeLayer({ diagramEdges, relatedEdges, hasSelection, mode }: TheoryFlowBoardEdgeLayerProps) {
  const reduced = useReducedMotion();

  return (
    <>
      <defs>
        <marker id={`flow-arrow-${mode}`} markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="strokeWidth">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(244,247,251,.54)" />
        </marker>
      </defs>
      {diagramEdges.map((edge) => {
        const isRelated = !hasSelection || relatedEdges.has(edge.id);
        const badges = getEdgeBadges(edge);
        return (
          <g key={edge.id} className={isRelated ? styles.edgeGroup : styles.edgeDimmed}>
            <motion.path
              className={styles.edgePath}
              d={edge.path}
              markerEnd={`url(#flow-arrow-${mode})`}
              initial={reduced ? false : { pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: isRelated ? 1 : 0.12 }}
              transition={{ duration: reduced ? 0.01 : 0.48, ease: [0.22, 1, 0.36, 1] }}
            />
            {badges.map((badge, index) => (
              <motion.g
                key={`${edge.id}-${badge.label}-${index}`}
                className={`${styles.edgeBadge} ${badge.type === 'risk' ? styles.edgeBadgeRisk : styles.edgeBadgeHypothesis}`}
                transform={`translate(${edge.midX + index * 26}, ${edge.midY - 15})`}
                initial={reduced ? false : { scale: 0.85, opacity: 0 }}
                animate={{ scale: isRelated ? 1 : 0.8, opacity: isRelated ? 1 : 0.15 }}
                transition={{ duration: reduced ? 0.01 : 0.22 }}
              >
                <circle r="13" />
                <text y="4" textAnchor="middle">{badge.label}</text>
              </motion.g>
            ))}
          </g>
        );
      })}
    </>
  );
}
