'use client';

import { useCallback, useMemo, useRef, type CSSProperties, type RefObject } from 'react';
import type { TdmEdge, TdmNode } from '../../../domain/tdm-types';
import { TDM_STAGE_LABELS, TDM_STAGE_ORDER, type TdmStage } from '../../../domain/tdm-stages';
import {
  RESULT_FLOW_BRIDGES,
  buildConnectionCountMap,
  getCardHighlightState,
  getColumnHeaderState,
  getResultStageAccent,
  getResultStageClassName,
  groupNodesByStage
} from '../result-view-utils';
import { ResultViewBlueprintLayer } from '../result-view-blueprint-layer';
import { FlowCausalOverlay, ResultFlowBridge } from '../result-flow-visualization/result-flow-visualization';
import { ResultReadingCard } from '../result-reading-card/result-reading-card';
import {
  LiquidGlassMonochromeBackdrop,
  ResultLiquidColumn,
  getLiquidGlassStageTheme
} from '../liquid-glass';
import styles from '../result-view.module.sass';

type ResultTheoryFlowProps = {
  nodes: TdmNode[];
  edges: TdmEdge[];
  focusedNodeId: string | null;
  focusedEdgeId: string | null;
  relatedNodeIds: Set<string>;
  relatedEdgeIds: Set<string>;
  edgeEndpointIds: Set<string>;
  cardRefs: RefObject<Map<string, HTMLElement>>;
  registerCardRef: (nodeId: string, element: HTMLElement | null) => void;
  onSelectNode: (nodeId: string) => void;
  onSelectEdge: (edgeId: string) => void;
  shouldReduceMotion: boolean | null;
};

export function ResultTheoryFlow({
  nodes,
  edges,
  focusedNodeId,
  focusedEdgeId,
  relatedNodeIds,
  relatedEdgeIds,
  edgeEndpointIds,
  cardRefs,
  registerCardRef,
  onSelectNode,
  onSelectEdge,
  shouldReduceMotion
}: ResultTheoryFlowProps) {
  const flowViewportRef = useRef<HTMLDivElement>(null);
  const columnViewportRefs = useRef<Map<string, HTMLElement>>(new Map());

  const registerColumnViewportRef = useCallback((stage: TdmStage, element: HTMLElement | null) => {
    if (element) {
      columnViewportRefs.current.set(stage, element);
      return;
    }

    columnViewportRefs.current.delete(stage);
  }, []);

  const groupedNodes = useMemo(() => groupNodesByStage(nodes), [nodes]);
  const connectionCounts = useMemo(() => buildConnectionCountMap(edges), [edges]);
  const bridgeEdges = useMemo(
    () =>
      RESULT_FLOW_BRIDGES.reduce<Record<string, TdmEdge[]>>((accumulator, bridge) => {
        accumulator[bridge.id] = edges.filter((edge) => {
          const connectionKind = edge.data?.connectionKind;

          if (connectionKind) {
            return connectionKind === bridge.connectionKind;
          }

          return edge.sourceStage === bridge.sourceStage && edge.targetStage === bridge.targetStage;
        });
        return accumulator;
      }, {}),
    [edges]
  );

  return (
    <section
      className={styles.flowSection}
      aria-label="Fluxo da teoria da mudança"
      data-theory-export-diagram="true"
    >
      <div className={styles.flowViewport} ref={flowViewportRef}>
        <LiquidGlassMonochromeBackdrop
          preset="gray-layers"
          intensity={1.08}
          speed={0.72}
          overlay
          className={styles.flowMonochromeLayer}
        />
        <ResultViewBlueprintLayer />

        <div className={styles.connectionLayer}>
          <FlowCausalOverlay
            containerRef={flowViewportRef}
            columnViewportRefs={columnViewportRefs}
            cardRefs={cardRefs}
            edges={edges}
            focusedNodeId={focusedNodeId}
            focusedEdgeId={focusedEdgeId}
            relatedEdgeIds={relatedEdgeIds}
            onSelectEdge={onSelectEdge}
            shouldReduceMotion={shouldReduceMotion}
          />
        </div>

        <div className={styles.stageGrid}>
          {TDM_STAGE_ORDER.map((stage, index) => {
            const theme = getResultStageAccent(stage);
            const stageNodes = groupedNodes[stage];
            const bridge = index < RESULT_FLOW_BRIDGES.length ? RESULT_FLOW_BRIDGES[index] : null;
            const liquidGlassTheme = getLiquidGlassStageTheme(stage);
            const columnHeaderState = getColumnHeaderState(
              stageNodes,
              focusedNodeId,
              focusedEdgeId,
              relatedNodeIds,
              edgeEndpointIds
            );
            const columnHeaderClassName = [
              styles.columnHeader,
              columnHeaderState.isDimmed ? styles.columnHeaderDimmed : '',
              columnHeaderState.isSelected ? styles.columnHeaderSelected : ''
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <div key={stage} className={styles.flowSegment}>
                <div className={styles.stageColumnShell}>
                  <span
                    className={styles.stageColumnHalo}
                    aria-hidden="true"
                    style={
                      {
                        '--stage-accent': theme.accent,
                        '--stage-glow': theme.glow,
                        '--stage-accent-soft': theme.accentSoft
                      } as CSSProperties
                    }
                  />
                  <ResultLiquidColumn
                    title={TDM_STAGE_LABELS[stage]}
                    countLabel={`${stageNodes.length} ${stageNodes.length === 1 ? 'item' : 'itens'}`}
                    theme={liquidGlassTheme}
                    className={[
                      styles.stageColumn,
                      styles[getResultStageClassName(stage) as keyof typeof styles]
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    headerClassName={columnHeaderClassName}
                    isDimmed={columnHeaderState.isDimmed}
                    isSelected={columnHeaderState.isSelected}
                    ariaLabel={`${TDM_STAGE_LABELS[stage]}, ${stageNodes.length} itens`}
                  >
                    <div
                      ref={(element) => registerColumnViewportRef(stage, element)}
                      className={styles.stageItemsViewport}
                    >
                      {stageNodes.map((node) => {
                        const { incoming, outgoing } = connectionCounts.get(node.id) ?? {
                          incoming: 0,
                          outgoing: 0
                        };
                        const { isFocused, isHighlighted, isDimmed, isDisabled } = getCardHighlightState(
                          node.id,
                          focusedNodeId,
                          focusedEdgeId,
                          relatedNodeIds,
                          connectionCounts
                        );

                        return (
                          <ResultReadingCard
                            key={node.id}
                            node={node}
                            stage={stage}
                            incomingCount={incoming}
                            outgoingCount={outgoing}
                            isFocused={isFocused}
                            isHighlighted={isHighlighted}
                            isDimmed={isDimmed}
                            isDisabled={isDisabled}
                            onSelect={() => onSelectNode(node.id)}
                            onRegisterRef={registerCardRef}
                            shouldReduceMotion={shouldReduceMotion}
                          />
                        );
                      })}
                    </div>
                  </ResultLiquidColumn>
                </div>

                {bridge ? (
                  <ResultFlowBridge
                    bridgeKind={bridge.markerKind}
                    edges={bridgeEdges[bridge.id] ?? []}
                    nodes={nodes}
                    highlightedEdgeIds={relatedEdgeIds}
                    focusedNodeId={focusedNodeId}
                    focusedEdgeId={focusedEdgeId}
                    onSelectEdge={onSelectEdge}
                    shouldReduceMotion={shouldReduceMotion}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
