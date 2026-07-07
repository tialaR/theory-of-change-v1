'use client';

import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath } from '@xyflow/react';
import { useEffect, useState, type CSSProperties } from 'react';
import {
  canCreateHypothesis,
  canCreateRisk,
  getConnectionKind
} from '../../domain/tdm-connection-rules';
import {
  getConnectionStrokeColor,
  TDM_CONNECTION_STROKE_WIDTH,
  TDM_EDGE_DASH,
  TDM_EDGE_INTERACTION_WIDTH
} from '../../domain/tdm-connection-theme';
import { getTdmStageTheme } from '../../domain/tdm-theme';
import type { TdmStage } from '../../domain/tdm-stages';
import type { TdmEdge as TdmEdgeModel, TdmMarkerType } from '../../domain/tdm-types';
import { TdmEdgeMarkerEditor } from './tdm-edge-marker-editor';
import styles from './tdm-theory-edge.module.sass';

function resolveMarkerType(sourceStage: TdmStage, targetStage: TdmStage): TdmMarkerType | null {
  if (canCreateRisk(sourceStage, targetStage)) {
    return 'risk';
  }

  if (canCreateHypothesis(sourceStage, targetStage)) {
    return 'hypothesis';
  }

  return null;
}

export function TdmTheoryEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  selected,
  data
}: EdgeProps<TdmEdgeModel>) {
  const [isHovered, setIsHovered] = useState(false);
  const [pulseAnimation, setPulseAnimation] = useState(false);

  const sourceStage = (data?.sourceStage ?? 'input') as TdmStage;
  const targetStage = (data?.targetStage ?? 'activity') as TdmStage;
  const connectionKind = data?.connectionKind ?? getConnectionKind(sourceStage, targetStage);
  const fallbackColor = getTdmStageTheme(sourceStage).accent;
  const strokeColor = getConnectionStrokeColor(connectionKind, fallbackColor);
  const markerType = data?.markerType;
  const markerText = data?.markerText?.trim() ?? '';
  const hasMarker = Boolean(markerType && markerText);
  const allowedMarkerType = resolveMarkerType(sourceStage, targetStage);
  const isInteractive = selected || isHovered;
  const shouldAnimate = isHovered || pulseAnimation || Boolean(data?.recentlyUpdated);
  const isEditorOpen = Boolean(data?.isEditorOpen);
  const showCta = !hasMarker && allowedMarkerType && isInteractive && !isEditorOpen;

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition
  });

  useEffect(() => {
    if (!selected) {
      return;
    }

    setPulseAnimation(true);
    const timeout = window.setTimeout(() => setPulseAnimation(false), 1200);
    return () => window.clearTimeout(timeout);
  }, [selected]);

  useEffect(() => {
    if (!data?.recentlyUpdated) {
      return;
    }

    setPulseAnimation(true);
    const timeout = window.setTimeout(() => setPulseAnimation(false), 1800);
    return () => window.clearTimeout(timeout);
  }, [data?.recentlyUpdated]);

  const openEditor = () => {
    data?.onOpenMarkerEditor?.(id);
  };

  return (
    <>
      <g
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <BaseEdge
          id={id}
          path={edgePath}
          interactionWidth={TDM_EDGE_INTERACTION_WIDTH}
          style={{
            ...style,
            '--edge-stroke': strokeColor,
            stroke: strokeColor,
            strokeDasharray: shouldAnimate ? TDM_EDGE_DASH.active : TDM_EDGE_DASH.rest,
            strokeWidth: selected ? TDM_CONNECTION_STROKE_WIDTH.active : TDM_CONNECTION_STROKE_WIDTH.rest,
            opacity: data?.validationStatus === 'invalid' ? 0.55 : 0.9
          } as CSSProperties}
          markerEnd={markerEnd}
          className={[
            styles.edge,
            selected ? styles.selected : '',
            isHovered ? styles.hovered : '',
            shouldAnimate ? styles.animated : ''
          ]
            .filter(Boolean)
            .join(' ')}
        />
      </g>
      <EdgeLabelRenderer>
        <div
          className={styles.labelLayer}
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`
          }}
        >
          {isEditorOpen && (markerType ?? allowedMarkerType) ? (
            <TdmEdgeMarkerEditor
              markerType={(markerType ?? allowedMarkerType)!}
              initialText={markerText}
              onSave={(text) => {
                const resolvedType = markerType ?? allowedMarkerType;
                if (!resolvedType) {
                  return;
                }

                data?.onSaveMarker?.(id, resolvedType, text);
              }}
              onDelete={() => data?.onDeleteMarker?.(id)}
              onCancel={() => data?.onCloseMarkerEditor?.()}
            />
          ) : hasMarker ? (
            <button
              type="button"
              className={[
                styles.marker,
                markerType === 'risk' ? styles.markerRisk : '',
                markerType === 'hypothesis' ? styles.markerHypothesis : ''
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={(event) => {
                event.stopPropagation();
                openEditor();
              }}
            >
              {markerType === 'risk' ? 'R' : 'H'}
            </button>
          ) : showCta ? (
            <button
              type="button"
              className={styles.cta}
              onClick={(event) => {
                event.stopPropagation();
                openEditor();
              }}
            >
              {allowedMarkerType === 'risk' ? '+ Risco' : '+ Hipótese'}
            </button>
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
