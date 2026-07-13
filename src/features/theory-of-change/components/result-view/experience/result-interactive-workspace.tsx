'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import type { ResultExperienceProps } from './types';
import { InteractiveExperienceShell } from './interactive-experience-shell';
import { ResultDiagram } from './result-diagram';
import {
  getConnectedFlowFromNode,
  getFlowMarkerTexts,
  getFlowPathSummary
} from './result-experience-data';
import styles from './result-experience.module.sass';

const ease = [0.22, 1, 0.36, 1] as const;

type DragState = {
  dragging: boolean;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
};

export function ResultInteractiveWorkspace({ title, nodes, edges }: ResultExperienceProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [panelOffset, setPanelOffset] = useState({ x: 0, y: 0 });
  const reduce = useReducedMotion();
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState>({
    dragging: false,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0
  });

  const flow = useMemo(() => getConnectedFlowFromNode(selectedId, edges), [selectedId, edges]);
  const selectedNode = nodes.find((node) => node.id === selectedId);
  const markerTexts = useMemo(
    () => (selectedId ? getFlowMarkerTexts(selectedId, edges) : { risks: [], hypotheses: [] }),
    [selectedId, edges]
  );
  const flowPath = useMemo(
    () => (selectedId ? getFlowPathSummary(selectedId, nodes, edges) : ''),
    [selectedId, nodes, edges]
  );

  const resetView = useCallback(() => {
    setZoom(1);
    setSelectedId(null);
    setPanelOffset({ x: 0, y: 0 });
  }, []);

  const handlePanelPointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    dragRef.current = {
      dragging: true,
      startX: event.clientX,
      startY: event.clientY,
      originX: panelOffset.x,
      originY: panelOffset.y
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }, [panelOffset.x, panelOffset.y]);

  const handlePanelPointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.dragging) {
      return;
    }

    setPanelOffset({
      x: dragRef.current.originX + (event.clientX - dragRef.current.startX),
      y: dragRef.current.originY + (event.clientY - dragRef.current.startY)
    });
  }, []);

  const handlePanelPointerUp = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    dragRef.current.dragging = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  return (
    <InteractiveExperienceShell
      title={title}
      backHref="/exemplos/resultado"
      closeHref="/exemplos/resultado"
      zoom={zoom}
      onZoomIn={() => setZoom((value) => Math.min(1.4, Number((value + 0.1).toFixed(2))))}
      onZoomOut={() => setZoom((value) => Math.max(0.74, Number((value - 0.1).toFixed(2))))}
      onCenter={() => setZoom(1)}
      onReset={resetView}
    >
      <div className={styles.workspaceViewport} ref={viewportRef}>
        <motion.div
          className={styles.flowWorkspace}
          animate={{ scale: zoom }}
          transition={{ duration: reduce ? 0.01 : 0.28, ease }}
        >
          <ResultDiagram
            nodes={nodes}
            edges={edges}
            mode="workspace"
            selectedNodeId={selectedId}
            onSelectNode={setSelectedId}
            zoom={zoom}
          />
        </motion.div>

        {selectedNode ? (
          <aside
            className={styles.flowTranslator}
            style={{ transform: `translate(${panelOffset.x}px, ${panelOffset.y}px)` }}
          >
            <div
              className={styles.flowTranslatorHandle}
              onPointerDown={handlePanelPointerDown}
              onPointerMove={handlePanelPointerMove}
              onPointerUp={handlePanelPointerUp}
              onPointerCancel={handlePanelPointerUp}
            >
              <span className={styles.flowTranslatorGrip} aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
              </span>
              <p className={styles.flowTranslatorKicker}>Tradutor do fluxo</p>
            </div>

            <div className={styles.flowTranslatorBody}>
              <h2>{selectedNode.title}</h2>
              <p>{selectedNode.description}</p>

              <div className={styles.flowTranslatorMeta}>
                <span>{Math.max(0, flow.nodeIds.size - 1)} relacionados</span>
                {markerTexts.risks.length ? <span><b>R</b> Risco</span> : null}
                {markerTexts.hypotheses.length ? <span><b>H</b> Hipótese</span> : null}
              </div>

              {markerTexts.risks.length ? (
                <div className={styles.flowTranslatorBlock}>
                  <h3>Riscos</h3>
                  <ul>
                    {markerTexts.risks.map((risk) => (
                      <li key={risk}>{risk}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {markerTexts.hypotheses.length ? (
                <div className={styles.flowTranslatorBlock}>
                  <h3>Hipóteses</h3>
                  <ul>
                    {markerTexts.hypotheses.map((hypothesis) => (
                      <li key={hypothesis}>{hypothesis}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {flowPath ? (
                <div className={styles.flowTranslatorBlock}>
                  <h3>Caminho resumido</h3>
                  <p className={styles.flowTranslatorPath}>{flowPath}</p>
                </div>
              ) : null}
            </div>
          </aside>
        ) : null}
      </div>
    </InteractiveExperienceShell>
  );
}
