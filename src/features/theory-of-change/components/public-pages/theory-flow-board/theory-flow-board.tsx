'use client';

import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import { groupNodesByStage } from '../../result-view/result-view-utils';
import { buildDiagramEdges, buildDiagramNodes, getEdgeRelationSet } from '../../result-view/experience/result-experience-data';
import styles from '../public-pages.module.sass';
import { TheoryFlowBoardEdgeLayer } from './theory-flow-board-edge-layer';
import { TheoryFlowBoardNodeCards } from './theory-flow-board-node-cards';
import { TheoryFlowBoardStageLabels } from './theory-flow-board-stage-labels';
import type { TheoryFlowBoardProps } from './theory-flow-board.types';
import { getFlowRelationSet } from './theory-flow-board-utils';

export function TheoryFlowBoard({ nodes, edges, mode, selectedNodeId = null, onSelectNode, zoom = 1 }: TheoryFlowBoardProps) {
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
    <div className={`${styles.flowBoard} ${compact ? styles.flowBoard_compact : styles.flowBoard_interactive}`}>
      <div className={styles.flowScale} style={{ '--flow-zoom': zoom } as CSSProperties}>
        <svg className={styles.flowSvg} viewBox={`0 0 ${viewW} ${viewH}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
          <TheoryFlowBoardEdgeLayer diagramEdges={diagramEdges} relatedEdges={relatedEdges} hasSelection={hasSelection} mode={mode} />
        </svg>
        <TheoryFlowBoardStageLabels diagramNodes={diagramNodes} grouped={grouped} scale={scale} viewW={viewW} viewH={viewH} />
        <TheoryFlowBoardNodeCards
          diagramNodes={diagramNodes}
          edges={edges}
          selected={selected}
          relatedNodes={relatedNodes}
          hasSelection={hasSelection}
          compact={compact}
          scale={scale}
          viewW={viewW}
          viewH={viewH}
          onSelectNode={onSelectNode}
        />
      </div>
    </div>
  );
}
