'use client';

import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { TDM_STAGE_ORDER } from '@/features/theory-of-change/domain/tdm-stages';
import type { TdmEdge, TdmNode } from '@/features/theory-of-change/domain/tdm-types';
import { groupNodesByStage } from '../result-view-utils';
import { ResultConnectionsLayer } from '../result-connections-layer/result-connections-layer';
import type { CardRect, ConnectedFlow } from '../result-view.types';
import { areCardRectsEqual, getConnectedFlowFromNode, getLayoutRectRelativeTo } from '../result-view.utils';
import {
  FLOW_VISION_CARD_WIDTH,
  getFlowVisionBoardSize,
  getFlowVisionNodePositions
} from './flow-vision-layout';
import { FlowVisionNodeCard } from './flow-vision-node-card';
import styles from './flow-vision-interactive.module.sass';

type FlowVisionDiagramProps = {
  nodes: TdmNode[];
  edges: TdmEdge[];
  selectedNodeId?: string | null;
  selectedEdgeId?: string | null;
  flow?: ConnectedFlow;
  onSelectNode?: (nodeId: string) => void;
  onSelectEdge?: (edgeId: string) => void;
  onSelectMarker?: (edgeId: string, markerId: string) => void;
};

export function FlowVisionDiagram({
  nodes,
  edges,
  selectedNodeId = null,
  selectedEdgeId = null,
  flow: flowProp,
  onSelectNode,
  onSelectEdge,
  onSelectMarker
}: FlowVisionDiagramProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [cardRects, setCardRects] = useState<Map<string, CardRect>>(new Map());
  const grouped = groupNodesByStage(nodes);
  const selected = selectedNodeId ?? null;
  const positions = useMemo(() => getFlowVisionNodePositions(nodes), [nodes]);
  const boardSize = useMemo(() => getFlowVisionBoardSize(nodes), [nodes]);

  const flow = useMemo(
    () => flowProp ?? getConnectedFlowFromNode(selected, edges),
    [edges, flowProp, selected]
  );
  const hasSelection = Boolean(selectedNodeId || selectedEdgeId);
  const selectedEdge = useMemo(
    () => (selectedEdgeId ? (edges.find((edge) => edge.id === selectedEdgeId) ?? null) : null),
    [edges, selectedEdgeId]
  );

  const relatedEdgeOrder = useMemo(() => {
    if (!hasSelection) {
      return new Map<string, number>();
    }

    const sorted = edges
      .filter((edge) => flow.edgeIds.has(edge.id))
      .sort((left, right) => {
        const sourceStage = (stage: string) =>
          TDM_STAGE_ORDER.indexOf(stage as (typeof TDM_STAGE_ORDER)[number]);
        const leftSource = nodes.find((node) => node.id === left.source);
        const rightSource = nodes.find((node) => node.id === right.source);
        const leftTarget = nodes.find((node) => node.id === left.target);
        const rightTarget = nodes.find((node) => node.id === right.target);
        const leftIndex =
          sourceStage(leftSource?.stage ?? 'input') * 100 +
          sourceStage(leftTarget?.stage ?? 'input') * 10 +
          left.source.localeCompare(right.source);
        const rightIndex =
          sourceStage(rightSource?.stage ?? 'input') * 100 +
          sourceStage(rightTarget?.stage ?? 'input') * 10 +
          right.source.localeCompare(right.target);
        return leftIndex - rightIndex;
      });

    return new Map(sorted.map((edge, index) => [edge.id, index]));
  }, [edges, flow.edgeIds, hasSelection, nodes]);

  const measureCards = useCallback(() => {
    const board = boardRef.current;
    if (!board) {
      return;
    }

    const nextRects = new Map<string, CardRect>();

    cardRefs.current.forEach((element, nodeId) => {
      const rect = getLayoutRectRelativeTo(element, board);
      if (
        !Number.isFinite(rect.x) ||
        !Number.isFinite(rect.y) ||
        !Number.isFinite(rect.width) ||
        !Number.isFinite(rect.height) ||
        rect.width < 1 ||
        rect.height < 1
      ) {
        return;
      }
      nextRects.set(nodeId, rect);
    });

    setCardRects((previous) => (areCardRectsEqual(previous, nextRects) ? previous : nextRects));
  }, []);

  useLayoutEffect(() => {
    measureCards();
    const board = boardRef.current;
    if (!board) {
      return;
    }

    const observer = new ResizeObserver(() => {
      measureCards();
    });
    observer.observe(board);
    window.addEventListener('resize', measureCards);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measureCards);
    };
  }, [measureCards, nodes, edges]);

  const registerCardRef = useCallback((nodeId: string, element: HTMLButtonElement | null) => {
    if (element) {
      cardRefs.current.set(nodeId, element);
      return;
    }

    cardRefs.current.delete(nodeId);
  }, []);

  const handleSelectNode = useCallback(
    (nodeId: string) => {
      onSelectNode?.(nodeId);
    },
    [onSelectNode]
  );

  return (
    <div className={styles.flowVisionDiagram}>
      <div
        className={styles.flowVisionBoard}
        ref={boardRef}
        data-result-board="true"
        data-theory-export-diagram="true"
        style={{ width: boardSize.width, height: boardSize.height }}
      >
        <ResultConnectionsLayer
          edges={edges}
          cardRects={cardRects}
          flow={flow}
          hasSelection={hasSelection}
          selectedEdgeId={selectedEdgeId}
          relatedEdgeOrder={relatedEdgeOrder}
          onSelectEdge={onSelectEdge}
          onSelectMarker={onSelectMarker}
        />

        <div className={styles.flowVisionNodes}>
          {TDM_STAGE_ORDER.flatMap((stage) =>
            grouped[stage].map((node) => {
              const position = positions.get(node.id);
              if (!position) {
                return null;
              }

              const isSelected =
                selected === node.id ||
                selectedEdge?.source === node.id ||
                selectedEdge?.target === node.id;
              const isRelated = !hasSelection || flow.nodeIds.has(node.id);
              const isRelatedOnly = isRelated && !isSelected;
              const isReceded = hasSelection && !isRelated;

              return (
                <div
                  key={node.id}
                  className={styles.flowVisionNodeSlot}
                  style={{
                    left: position.x,
                    top: position.y,
                    width: FLOW_VISION_CARD_WIDTH
                  }}
                >
                  <FlowVisionNodeCard
                    node={node}
                    isSelected={isSelected}
                    isRelated={isRelated}
                    isRelatedOnly={isRelatedOnly}
                    isReceded={isReceded}
                    onSelect={handleSelectNode}
                    registerRef={registerCardRef}
                  />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
