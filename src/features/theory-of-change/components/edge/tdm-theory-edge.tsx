'use client';

import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath, useStore } from '@xyflow/react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
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
import { computeEdgeEditorPosition } from '../../utils/tdm-edge-editor-position';
import { TdmEdgeMarkerEditor } from './tdm-edge-marker-editor';
import styles from './tdm-theory-edge.module.sass';

const MARKER_PREVIEW_MAX_LENGTH = 110;

function truncateMarkerPreview(text: string): string {
  if (text.length <= MARKER_PREVIEW_MAX_LENGTH) {
    return text;
  }

  return `${text.slice(0, MARKER_PREVIEW_MAX_LENGTH - 1).trimEnd()}…`;
}

function MarkerPreview({
  markerType,
  text,
  visible
}: {
  markerType: 'risk' | 'hypothesis';
  text: string;
  visible: boolean;
}) {
  const prefersReducedMotion = useReducedMotion();
  const title = markerType === 'risk' ? 'Risco' : 'Hipótese';

  return (
    <AnimatePresence>
      {visible ? (
        <div className={styles.markerPreviewHost}>
          <motion.div
            className={[
              styles.markerPreview,
              markerType === 'risk' ? styles.markerPreviewRisk : styles.markerPreviewHypothesis
            ].join(' ')}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 2 }}
            transition={{ duration: prefersReducedMotion ? 0.16 : 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className={styles.markerPreviewTitle}>{title}</p>
            <p className={styles.markerPreviewText}>{truncateMarkerPreview(text)}</p>
            <p className={styles.markerPreviewHint}>Clique para editar</p>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

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
  const [isMarkerHovered, setIsMarkerHovered] = useState(false);
  const [pulseAnimation, setPulseAnimation] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const [editorSize, setEditorSize] = useState({ width: 288, height: 176 });
  const prefersReducedMotion = useReducedMotion();

  const transform = useStore((state) => state.transform);
  const viewportWidth = useStore((state) => state.width);
  const viewportHeight = useStore((state) => state.height);

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
  const showMarkerHighlight = hasMarker && isInteractive && !isEditorOpen;

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition
  });

  const editorPosition = useMemo(
    () =>
      computeEdgeEditorPosition({
        labelX,
        labelY,
        sourceX,
        sourceY,
        targetX,
        targetY,
        viewportWidth,
        viewportHeight,
        transform,
        editorWidth: editorSize.width,
        editorHeight: editorSize.height
      }),
    [
      editorSize.height,
      editorSize.width,
      labelX,
      labelY,
      sourceX,
      sourceY,
      targetX,
      targetY,
      transform,
      viewportHeight,
      viewportWidth
    ]
  );

  useLayoutEffect(() => {
    if (!isEditorOpen || !editorRef.current) {
      return;
    }

    const { width, height } = editorRef.current.getBoundingClientRect();
    setEditorSize((currentSize) => {
      if (Math.abs(currentSize.width - width) < 1 && Math.abs(currentSize.height - height) < 1) {
        return currentSize;
      }

      return { width, height };
    });
  }, [isEditorOpen, markerText, markerType]);

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
        {!isEditorOpen ? (
          <div
            className={styles.labelLayer}
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`
            }}
          >
            {hasMarker ? (
              <div
                className={styles.markerWrap}
                onMouseEnter={() => setIsMarkerHovered(true)}
                onMouseLeave={() => setIsMarkerHovered(false)}
              >
                <motion.button
                  type="button"
                  className={[
                    styles.marker,
                    markerType === 'risk' ? styles.markerRisk : '',
                    markerType === 'hypothesis' ? styles.markerHypothesis : '',
                    showMarkerHighlight ? styles.markerHighlighted : ''
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  whileHover={prefersReducedMotion ? undefined : { scale: 1.05, y: -1 }}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
                  transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
                  onClick={(event) => {
                    event.stopPropagation();
                    openEditor();
                  }}
                >
                  {markerType === 'risk' ? 'R' : 'H'}
                </motion.button>
                <MarkerPreview
                  markerType={markerType!}
                  text={markerText}
                  visible={isMarkerHovered && !isEditorOpen}
                />
              </div>
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
        ) : null}
        {isEditorOpen && (markerType ?? allowedMarkerType) ? (
          <div
            ref={editorRef}
            className={styles.editorLayer}
            style={{
              transform: `translate(-50%, -50%) translate(${editorPosition.x}px,${editorPosition.y}px)`
            }}
          >
            <AnimatePresence>
              <motion.div
                key="edge-marker-editor"
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.98 }}
                animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 4, scale: 0.98 }}
                transition={{ duration: prefersReducedMotion ? 0.16 : 0.22, ease: [0.22, 1, 0.36, 1] }}
              >
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
              </motion.div>
            </AnimatePresence>
          </div>
        ) : null}
      </EdgeLabelRenderer>
    </>
  );
}
