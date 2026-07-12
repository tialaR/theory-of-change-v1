'use client';

import { motion, useReducedMotion } from 'motion/react';
import { useMemo } from 'react';
import { TDM_STAGE_ORDER, TDM_STAGE_LABELS } from '../../domain/tdm-stages';
import type { TdmEdge, TdmNode } from '../../domain/tdm-types';
import { countNodeConnections, groupNodesByStage } from '../result-view/result-view-utils';
import {
  buildDiagramEdges,
  buildDiagramNodes,
  getEdgeBadges,
  getEdgeRelationSet
} from '../result-view/experience/result-experience-data';
import type { CSSProperties } from 'react';
import styles from './public-pages.module.sass';

const STAGE_LABEL_Y = 42;
const CARD_WIDTH = 11.375;

function collectDescendants(nodeId: string, edges: TdmEdge[], ids: Set<string>) {
  ids.add(nodeId);
  for (const edge of edges) {
    if (edge.source === nodeId && !ids.has(edge.target)) {
      collectDescendants(edge.target, edges, ids);
    }
  }
}

function collectAncestors(nodeId: string, edges: TdmEdge[], ids: Set<string>) {
  ids.add(nodeId);
  for (const edge of edges) {
    if (edge.target === nodeId && !ids.has(edge.source)) {
      collectAncestors(edge.source, edges, ids);
    }
  }
}

function getFlowRelationSet(nodeId: string | null, edges: TdmEdge[]): Set<string> {
  if (!nodeId) return new Set();
  const ids = new Set<string>();
  collectDescendants(nodeId, edges, ids);
  collectAncestors(nodeId, edges, ids);
  return ids;
}

type TheoryFlowBoardProps = {
  nodes: TdmNode[];
  edges: TdmEdge[];
  mode: 'preview' | 'interactive';
  selectedNodeId?: string | null;
  onSelectNode?: (nodeId: string) => void;
  zoom?: number;
};

export function TheoryFlowBoard({
  nodes,
  edges,
  mode,
  selectedNodeId = null,
  onSelectNode,
  zoom = 1
}: TheoryFlowBoardProps) {
  const reduced = useReducedMotion();
  const compact = mode === 'preview';
  const diagramNodes = useMemo(() => buildDiagramNodes(nodes), [nodes]);
  const diagramEdges = useMemo(() => buildDiagramEdges(edges, diagramNodes), [edges, diagramNodes]);
  const selected = selectedNodeId ?? (mode === 'interactive' ? nodes[0]?.id ?? null : null);
  const hasSelection = Boolean(selected && (mode === 'interactive' || onSelectNode));
  const relatedNodes = useMemo(() => getFlowRelationSet(selected, edges), [selected, edges]);
  const relatedEdges = useMemo(() => getEdgeRelationSet(relatedNodes, edges), [relatedNodes, edges]);
  const grouped = groupNodesByStage(nodes);

  const scale = compact ? 0.52 : 1;
  const viewW = 1000;
  const viewH = compact ? 360 : 620;

  return (
    <div
      className={`${styles.flowBoard} ${compact ? styles.flowBoard_compact : styles.flowBoard_interactive}`}
    >
      <div
        className={styles.flowScale}
        style={{ '--flow-zoom': zoom } as CSSProperties}
      >
        <svg
          className={styles.flowSvg}
          viewBox={`0 0 ${viewW} ${viewH}`}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <defs>
            <marker
              id={`flow-arrow-${mode}`}
              markerWidth="10"
              markerHeight="10"
              refX="8"
              refY="5"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(244,247,251,.54)" />
            </marker>
          </defs>
          {diagramEdges.map((edge) => {
            const isRelated = !hasSelection || relatedEdges.has(edge.id);
            const badges = getEdgeBadges(edge);

            return (
              <g
                key={edge.id}
                className={isRelated ? styles.edgeGroup : styles.edgeDimmed}
              >
                <motion.path
                  className={styles.edgePath}
                  d={edge.path}
                  markerEnd={`url(#flow-arrow-${mode})`}
                  initial={reduced ? false : { pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: isRelated ? 1 : 0.12 }}
                  transition={{
                    duration: reduced ? 0.01 : 0.48,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                />
                {badges.map((badge, index) => (
                  <motion.g
                    key={`${edge.id}-${badge.label}-${index}`}
                    className={`${styles.edgeBadge} ${badge.type === 'risk' ? styles.edgeBadgeRisk : styles.edgeBadgeHypothesis}`}
                    transform={`translate(${edge.midX + index * 26}, ${edge.midY - 15})`}
                    initial={reduced ? false : { scale: 0.85, opacity: 0 }}
                    animate={{
                      scale: isRelated ? 1 : 0.8,
                      opacity: isRelated ? 1 : 0.15
                    }}
                    transition={{ duration: reduced ? 0.01 : 0.22 }}
                  >
                    <circle r="13" />
                    <text y="4" textAnchor="middle">
                      {badge.label}
                    </text>
                  </motion.g>
                ))}
              </g>
            );
          })}
        </svg>

        <div className={styles.stageLabels} aria-hidden="true">
          {TDM_STAGE_ORDER.map((stage) => {
            const firstNode = diagramNodes.find((node) => node.stage === stage);
            const x = (firstNode?.x ?? 0) * scale;
            const y = STAGE_LABEL_Y * scale;
            return (
              <span
                key={stage}
                className={styles.stageLabel}
                style={{ '--x': `${(x / viewW) * 100}%`, '--y': `${(y / viewH) * 100}%` } as CSSProperties}
              >
                {TDM_STAGE_LABELS[stage]}
                <small>{grouped[stage].length}</small>
              </span>
            );
          })}
        </div>

        <div
          className={`${styles.diagramCards} ${compact ? styles.diagramCards_compact : ''}`}
          style={{ height: `${(compact ? 360 : 620) * scale / 16}rem` }}
        >
          {diagramNodes.map((node) => {
            const isSelected = selected === node.id;
            const isRelated = !hasSelection || relatedNodes.has(node.id);
            const counts = countNodeConnections(node.id, edges);
            const x = (node.x / viewW) * 100;
            const y = (node.y / viewH) * 100;

            return (
              <motion.button
                key={node.id}
                type="button"
                className={[
                  styles.flowCard,
                  isSelected ? styles.flowCardSelected : '',
                  isRelated ? '' : styles.flowCardDisabled
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={
                  {
                    '--x': `${x}%`,
                    '--y': `${y}%`,
                    '--card-width': `${CARD_WIDTH * scale}rem`
                  } as CSSProperties
                }
                onClick={() => onSelectNode?.(node.id)}
                initial={reduced ? false : { opacity: 0, y: 8 }}
                animate={{
                  opacity: isRelated ? 1 : 0.2,
                  scale: isSelected ? 1.04 : isRelated ? 1 : 0.96,
                  y: isSelected ? -4 : 0
                }}
                transition={{ duration: reduced ? 0.01 : 0.22, ease: [0.22, 1, 0.36, 1] }}
              >
                <strong>{node.title}</strong>
                <span>{node.description}</span>
                {(counts.incoming || counts.outgoing) && (
                  <small>
                    {counts.incoming ? `← ${counts.incoming}` : ''}
                    {counts.incoming && counts.outgoing ? ' · ' : ''}
                    {counts.outgoing ? `→ ${counts.outgoing}` : ''}
                  </small>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
