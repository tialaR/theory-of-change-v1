'use client';

import { motion, useReducedMotion } from 'motion/react';
import type { CSSProperties } from 'react';
import type { TdmEdge, TdmNode } from '@/features/theory-of-change/domain/tdm-types';
import { displayEdges, edgeMidpoint, edgePath, groupNodes, relatedIds, stageAccent } from './result-experience-helpers';
import styles from './result-experience.module.sass';

const ease = [0.22, 1, 0.36, 1] as const;

type FlowBoardProps = {
  nodes: TdmNode[];
  edges: TdmEdge[];
  selectedId: string | null;
  onSelectNode: (nodeId: string) => void;
  compact?: boolean;
};

export function ResultFlowBoard({ nodes, edges, selectedId, onSelectNode, compact = false }: FlowBoardProps) {
  const reduce = useReducedMotion();
  const related = relatedIds(selectedId, edges);
  const decoratedEdges = displayEdges(edges);
  const groups = groupNodes(nodes);

  return (
    <div className={compact ? styles.flowMini : styles.flowWorkspace}>
      <svg className={styles.flowSvg} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <marker id={compact ? 'arrow-mini' : 'arrow-full'} markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto" markerUnits="strokeWidth">
            <path d="M 0 0 L 8 4 L 0 8 z" fill="rgba(255,255,255,.55)" />
          </marker>
        </defs>
        {decoratedEdges.map((edge) => {
          const active = !selectedId || related.has(edge.source) && related.has(edge.target);
          return (
            <motion.path
              key={edge.id}
              d={edgePath(edge, nodes, compact)}
              className={`${styles.edgePath} ${active ? styles.edgePathActive : ''}`}
              markerEnd={`url(#${compact ? 'arrow-mini' : 'arrow-full'})`}
              initial={reduce ? false : { pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: active ? 1 : 0.18 }}
              transition={{ duration: reduce ? 0.01 : 0.65, ease }}
            />
          );
        })}
      </svg>

      {decoratedEdges.map((edge) => {
        const point = edgeMidpoint(edge, nodes, compact);
        const active = !selectedId || related.has(edge.source) && related.has(edge.target);
        if (!edge.markerKinds.length || (!active && selectedId)) return null;
        return edge.markerKinds.map((kind, index) => (
          <span
            key={`${edge.id}-${kind}`}
            className={`${styles.edgeBadge} ${kind === 'risk' ? styles.edgeBadgeRisk : styles.edgeBadgeHypothesis}`}
            style={{ left: `${point.x + index * 2.2}%`, top: `${point.y}%` }}
          >
            {kind === 'risk' ? 'R' : 'H'}
          </span>
        ));
      })}

      {groups.map((group, stageIndex) => (
        <div
          key={group.stage}
          className={styles.stageColumn}
          style={{
            left: compact ? `${6 + stageIndex * 23}%` : `${2 + stageIndex * 25.5}%`,
            top: compact ? '8%' : '12%',
            '--stage-color': group.accent
          } as CSSProperties}
        >
          <div className={styles.stageHeading}>
            <span>{group.label}</span>
            {!compact ? <span className={styles.stageCount}>{group.nodes.length}</span> : null}
          </div>
          {group.nodes.map((node, itemIndex) => {
            const active = selectedId === node.id;
            const isRelated = selectedId ? related.has(node.id) : false;
            const muted = Boolean(selectedId && !isRelated);
            return (
              <motion.button
                key={node.id}
                type="button"
                className={`${styles.flowCard} ${active ? styles.flowCardActive : ''} ${isRelated && !active ? styles.flowCardRelated : ''} ${muted ? styles.flowCardMuted : ''}`}
                onClick={() => onSelectNode(node.id)}
                initial={reduce ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: muted ? 0.26 : 1, y: 0 }}
                transition={{ duration: reduce ? 0.01 : 0.44, delay: itemIndex * 0.04 + stageIndex * 0.05, ease }}
                style={{ '--stage-color': stageAccent(node.stage) } as CSSProperties}
              >
                <span className={styles.flowCardTitle}>{node.title}</span>
                <span className={styles.flowCardText}>{node.description}</span>
              </motion.button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
