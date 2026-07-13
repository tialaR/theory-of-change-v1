'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import type { ResultExperienceProps } from './types';
import { InteractiveExperienceShell } from './interactive-experience-shell';
import { FlowVisionDiagram } from './flow-vision-diagram';
import {
  getConnectedFlowFromNode,
  getFlowMarkerTexts
} from './result-experience-data';
import { STAGE_META } from './types';
import shellStyles from './result-experience.module.sass';
import styles from './flow-vision-interactive.module.sass';

const ease = [0.22, 1, 0.36, 1] as const;

export function FlowVisionInteractiveWorkspace({ title, nodes, edges }: ResultExperienceProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const reduce = useReducedMotion();

  const flow = useMemo(() => getConnectedFlowFromNode(selectedId, edges), [selectedId, edges]);
  const selectedNode = nodes.find((node) => node.id === selectedId);
  const markerTexts = useMemo(
    () => (selectedId ? getFlowMarkerTexts(selectedId, edges) : { risks: [], hypotheses: [] }),
    [selectedId, edges]
  );
  const hasMarkers = markerTexts.risks.length > 0 || markerTexts.hypotheses.length > 0;

  const resetView = useCallback(() => {
    setZoom(1);
    setSelectedId(null);
  }, []);

  return (
    <InteractiveExperienceShell
      title={title}
      backHref="/exemplos/visao-do-fluxo"
      closeHref="/exemplos/visao-do-fluxo"
      zoom={zoom}
      onZoomIn={() => setZoom((value) => Math.min(1.4, Number((value + 0.1).toFixed(2))))}
      onZoomOut={() => setZoom((value) => Math.max(0.74, Number((value - 0.1).toFixed(2))))}
      onCenter={() => setZoom(1)}
      onReset={resetView}
      experienceClassName={styles.flowVisionExperience}
    >
      <div className={styles.flowVisionWorkspace}>
        <div className={shellStyles.workspaceViewport}>
          <motion.div
            className={shellStyles.flowWorkspace}
            animate={{ scale: zoom }}
            transition={{ duration: reduce ? 0.01 : 0.28, ease }}
          >
            <FlowVisionDiagram
              nodes={nodes}
              edges={edges}
              selectedNodeId={selectedId}
              onSelectNode={setSelectedId}
              zoom={zoom}
            />
          </motion.div>
        </div>

        <aside className={styles.flowVisionInspector}>
          <p className={shellStyles.inspectorKicker}>Explorar caminho</p>

          {selectedNode ? (
            <>
              <h2>{selectedNode.title}</h2>
              <p>{selectedNode.shortNotes?.trim() || selectedNode.description}</p>

              <div className={styles.flowVisionInspectorMeta}>
                <span>{STAGE_META[selectedNode.stage].label}</span>
                <span>{Math.max(0, flow.nodeIds.size - 1)} relacionados</span>
              </div>

              {hasMarkers ? (
                <div className={shellStyles.legend}>
                  {markerTexts.risks.length ? (
                    <span>
                      <b>R</b> Risco
                    </span>
                  ) : null}
                  {markerTexts.hypotheses.length ? (
                    <span>
                      <b>H</b> Hipótese
                    </span>
                  ) : null}
                </div>
              ) : null}
            </>
          ) : (
            <>
              <h2>Selecione um card</h2>
              <p>Clique em um card para destacar o caminho causal relacionado.</p>
            </>
          )}
        </aside>
      </div>
    </InteractiveExperienceShell>
  );
}
