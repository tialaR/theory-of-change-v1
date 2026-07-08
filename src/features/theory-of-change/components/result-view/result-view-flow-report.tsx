'use client';

import { motion, useReducedMotion } from 'motion/react';
import type { FlowReportContent, FlowReportPlacement } from './result-view-utils';
import { TdmGlassSurface } from './tdm-glass-surface';
import styles from './result-view-flow-report.module.sass';

const PREMIUM_EASE = [0.22, 1, 0.36, 1] as const;

function MarkerIcon({ kind }: { kind: 'risk' | 'hypothesis' }) {
  return (
    <span
      className={[
        styles.markerIcon,
        kind === 'risk' ? styles.markerIconRisk : styles.markerIconHypothesis
      ]
        .filter(Boolean)
        .join(' ')}
      aria-hidden="true"
    >
      {kind === 'risk' ? 'R' : 'H'}
    </span>
  );
}

function RelationList({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className={styles.reportSection}>
      <p className={styles.reportSectionLabel}>{label}</p>
      <ul className={styles.reportList}>
        {items.map((title) => (
          <li key={title}>{title}</li>
        ))}
      </ul>
    </div>
  );
}

export function ResultViewFlowReport({
  content,
  placement,
  onClear
}: {
  content: FlowReportContent;
  placement: FlowReportPlacement;
  onClear?: () => void;
}) {
  const shouldReduceMotion = useReducedMotion();
  const transition = shouldReduceMotion ? { duration: 0.01 } : { duration: 0.28, ease: PREMIUM_EASE };
  const placementClass = styles[placement];

  return (
    <motion.aside
      layout={false}
      className={[styles.flowReport, placementClass].filter(Boolean).join(' ')}
      aria-label="Relatório do fluxo"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={shouldReduceMotion ? undefined : { opacity: 0, y: 4 }}
      transition={transition}
    >
      <TdmGlassSurface variant="strong" stage="neutral" className={styles.flowReportGlass} contentClassName={styles.flowReportContent}>
        <header className={styles.reportHeader}>
          <div className={styles.reportHeaderCopy}>
            <p className={styles.reportKicker}>Leitura do fluxo</p>
            <h3 className={styles.reportTitle}>{content.nodeTitle}</h3>
            <p className={styles.reportStage}>{content.stageLabel}</p>
          </div>
          {onClear ? (
            <button type="button" className={styles.reportClose} onClick={onClear} aria-label="Fechar relatório">
              ×
            </button>
          ) : null}
        </header>

        <p className={styles.reportDidactic}>{content.didacticNote}</p>

        {!content.hasConnections ? (
          <p className={styles.reportEmpty}>Este bloco ainda não possui conexões.</p>
        ) : (
          <>
            {content.primaryRelation ? (
              <div className={styles.reportSection}>
                <p className={styles.reportSectionLabel}>
                  {content.focusKind === 'edge' ? 'Ligação selecionada' : 'Relação em foco'}
                </p>
                <p className={styles.reportRoute}>
                  {content.primaryRelation.sourceTitle} → {content.primaryRelation.targetTitle}
                </p>
                <p className={styles.reportInsightTitle}>{content.primaryRelation.title}</p>
                <p className={styles.reportInsightBody}>{content.primaryRelation.body}</p>
              </div>
            ) : null}

            {content.familyNodeTitles.length > 0 ? (
              <RelationList label="Família causal" items={content.familyNodeTitles} />
            ) : null}

            <RelationList label="Entradas" items={content.incomingTitles} />
            <RelationList label="Saídas" items={content.outgoingTitles} />

            {content.causalPaths.length > 0 ? (
              <div className={styles.reportSection}>
                <p className={styles.reportSectionLabel}>Caminho causal</p>
                <ul className={styles.reportList}>
                  {content.causalPaths.map((path) => (
                    <li key={path}>{path}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {content.risks.length > 0 ? (
              <div className={styles.reportSection}>
                <p className={styles.reportSectionLabel}>Riscos</p>
                <ul className={styles.reportMarkerList}>
                  {content.risks.map((risk) => (
                    <li key={risk.edgeId}>
                      <MarkerIcon kind="risk" />
                      <div className={styles.reportMarkerCopy}>
                        <p className={styles.reportMarkerRoute}>
                          {risk.sourceTitle} → {risk.targetTitle}
                        </p>
                        <p className={styles.reportMarkerText}>{risk.text}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {content.hypotheses.length > 0 ? (
              <div className={styles.reportSection}>
                <p className={styles.reportSectionLabel}>Hipóteses</p>
                <ul className={styles.reportMarkerList}>
                  {content.hypotheses.map((hypothesis) => (
                    <li key={hypothesis.edgeId}>
                      <MarkerIcon kind="hypothesis" />
                      <div className={styles.reportMarkerCopy}>
                        <p className={styles.reportMarkerRoute}>
                          {hypothesis.sourceTitle} → {hypothesis.targetTitle}
                        </p>
                        <p className={styles.reportMarkerText}>{hypothesis.text}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </>
        )}
      </TdmGlassSurface>
    </motion.aside>
  );
}
