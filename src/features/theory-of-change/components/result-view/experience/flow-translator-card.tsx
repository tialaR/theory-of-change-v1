'use client';

import type { TdmNode } from '../../../domain/tdm-types';
import { STAGE_META } from './types';
import styles from './flow-vision-interactive.module.sass';

type FlowTranslatorCardProps = {
  selectedNode: TdmNode | null;
  relatedCount: number;
  description: string;
  markerTexts: { risks: string[]; hypotheses: string[] };
  flowPath: string;
  incomingConnections: string[];
  outgoingConnections: string[];
};

export function FlowTranslatorCard({
  selectedNode,
  relatedCount,
  description,
  markerTexts,
  flowPath,
  incomingConnections,
  outgoingConnections
}: FlowTranslatorCardProps) {
  const hasMarkers = markerTexts.risks.length > 0 || markerTexts.hypotheses.length > 0;

  return (
    <aside className={styles.flowTranslatorCard} aria-live="polite">
      <div className={styles.flowTranslatorCardHandle}>
        <span className={styles.flowTranslatorCardGrip} aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </span>
        <p className={styles.flowTranslatorCardKicker}>Tradutor do fluxo</p>
      </div>

      <div className={styles.flowTranslatorCardBody}>
        {selectedNode ? (
          <>
            <h2>{selectedNode.title}</h2>
            <p className={styles.flowTranslatorCardLead}>{description}</p>

            <div className={styles.flowTranslatorCardMeta}>
              <span>{STAGE_META[selectedNode.stage].label}</span>
              <span>{relatedCount} relacionados</span>
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

            {markerTexts.risks.length ? (
              <div className={styles.flowTranslatorCardBlock}>
                <h3>Riscos</h3>
                <ul>
                  {markerTexts.risks.map((risk) => (
                    <li key={risk}>{risk}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {markerTexts.hypotheses.length ? (
              <div className={styles.flowTranslatorCardBlock}>
                <h3>Hipóteses</h3>
                <ul>
                  {markerTexts.hypotheses.map((hypothesis) => (
                    <li key={hypothesis}>{hypothesis}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {flowPath ? (
              <div className={styles.flowTranslatorCardBlock}>
                <h3>Caminho resumido</h3>
                <p className={styles.flowTranslatorCardPath}>{flowPath}</p>
              </div>
            ) : null}

            {incomingConnections.length ? (
              <div className={styles.flowTranslatorCardBlock}>
                <h3>Entradas</h3>
                <ul>
                  {incomingConnections.map((label) => (
                    <li key={`in-${label}`}>{label}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {outgoingConnections.length ? (
              <div className={styles.flowTranslatorCardBlock}>
                <h3>Saídas</h3>
                <ul>
                  {outgoingConnections.map((label) => (
                    <li key={`out-${label}`}>{label}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </>
        ) : (
          <>
            <h2>Selecione um elemento</h2>
            <p className={styles.flowTranslatorCardLead}>
              Clique em um card para entender o papel dele no caminho causal, suas conexões, riscos e
              hipóteses.
            </p>
          </>
        )}
      </div>
    </aside>
  );
}
