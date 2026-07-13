'use client';

import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { getConnectionLinePoints, getExperienceConnections, getStageBuckets, isNodeRelatedToSelection } from './result-experience-data';
import type { TdmEdge, TdmNode } from '@/features/theory-of-change/domain/tdm-types';
import styles from './result-experience.module.sass';

export function ResultStageBoard({ nodes, edges, compact = false }: { nodes: TdmNode[]; edges: TdmEdge[]; compact?: boolean }) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();
  const buckets = useMemo(() => getStageBuckets(nodes), [nodes]);
  const connections = useMemo(() => getExperienceConnections(nodes, edges), [nodes, edges]);
  const selectedConnections = useMemo(
    () => connections.filter((connection) => !selectedNodeId || connection.source.id === selectedNodeId || connection.target.id === selectedNodeId),
    [connections, selectedNodeId]
  );

  return (
    <div className={compact ? styles.previewBoard : styles.stageBoard} onMouseLeave={() => compact && setSelectedNodeId(null)}>
      <svg className={styles.connectionLayer} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <marker id="tdm-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth">
            <path d="M 0 0 L 8 4 L 0 8 z" fill="rgba(255, 255, 255, 0.52)" />
          </marker>
        </defs>
        {connections.map((connection) => {
          const points = getConnectionLinePoints(connection.source, connection.target, buckets);
          const isActive = !selectedNodeId || connection.source.id === selectedNodeId || connection.target.id === selectedNodeId;
          const controlOffset = Math.max(6, Math.abs(points.targetX - points.sourceX) * 0.38);
          const path = `M ${points.sourceX} ${points.sourceY} C ${points.sourceX + controlOffset} ${points.sourceY}, ${points.targetX - controlOffset} ${points.targetY}, ${points.targetX} ${points.targetY}`;
          return (
            <g key={connection.edge.id} className={isActive ? styles.connectionActive : styles.connectionMuted}>
              <path d={path} className={styles.connectionPath} />
            </g>
          );
        })}
      </svg>

      <div className={styles.connectionBadgeLayer} aria-hidden="true">
        {selectedConnections.map((connection) => {
          const points = getConnectionLinePoints(connection.source, connection.target, buckets);
          if (connection.badges.length === 0) {
            return null;
          }
          const left = `${(points.sourceX + points.targetX) / 2}%`;
          const top = `${(points.sourceY + points.targetY) / 2}%`;
          return (
            <span key={`${connection.edge.id}-badge`} className={styles.connectionBadges} style={{ left, top }}>
              {connection.badges.map((badge) => (
                <span key={badge}>{badge}</span>
              ))}
            </span>
          );
        })}
      </div>

      <div className={styles.stageColumns}>
        {buckets.map((bucket) => (
          <section key={bucket.stage} className={styles.stageColumn} style={{ '--stage-accent': bucket.accent } as CSSProperties}>
            <div className={styles.stageColumnHeader}>
              <span />
              <h3>{bucket.label}</h3>
              <small>{bucket.nodes.length} {bucket.nodes.length === 1 ? 'item' : 'itens'}</small>
            </div>
            <div className={styles.stageCards}>
              {bucket.nodes.map((node) => {
                const isRelated = isNodeRelatedToSelection(node.id, selectedNodeId, connections);
                const isSelected = selectedNodeId === node.id;
                return (
                  <motion.button
                    type="button"
                    key={node.id}
                    className={[styles.stageCard, isSelected ? styles.stageCardSelected : '', !isRelated ? styles.stageCardDisabled : ''].filter(Boolean).join(' ')}
                    onClick={() => setSelectedNodeId((current) => (current === node.id ? null : node.id))}
                    whileHover={reduceMotion ? undefined : { y: compact ? -1 : -2 }}
                    animate={reduceMotion ? undefined : { scale: isSelected ? 1.018 : isRelated ? 1 : 0.985, opacity: isRelated ? 1 : 0.34 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <span className={styles.cardDot} />
                    <strong>{node.title}</strong>
                    <p>{node.description}</p>
                    {!compact ? <small>{node.shortNotes || node.advancedDetails}</small> : null}
                  </motion.button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
