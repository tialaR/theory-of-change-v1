'use client';

import { motion, useReducedMotion } from 'motion/react';
import type { FlowReportContent } from './result-view-utils';
import { TdmGlassSurface } from './tdm-glass-surface';
import styles from './result-view-flow-inspector.module.sass';

const PREMIUM_EASE = [0.22, 1, 0.36, 1] as const;
const MAX_VISIBLE_RELATIONS = 3;

function RelationSection({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) {
    return null;
  }

  const visible = items.slice(0, MAX_VISIBLE_RELATIONS);
  const overflow = items.length - visible.length;

  return (
    <div className={styles.inspectorSection}>
      <p className={styles.inspectorSectionLabel}>{label}</p>
      <ul className={styles.inspectorList}>
        {visible.map((title) => (
          <li key={title}>{title}</li>
        ))}
        {overflow > 0 ? (
          <li className={styles.inspectorOverflow}>+ {overflow} relações</li>
        ) : null}
      </ul>
    </div>
  );
}

function RhIndicators() {
  return (
    <div className={styles.inspectorRh} aria-label="Indicadores de conexão">
      <span className={styles.inspectorRhItem}>
        <span className={[styles.inspectorRhMarker, styles.inspectorRhMarkerRisk].join(' ')}>R</span>
        <span className={styles.inspectorRhCopy}>Risco</span>
      </span>
      <span className={styles.inspectorRhItem}>
        <span className={[styles.inspectorRhMarker, styles.inspectorRhMarkerHypothesis].join(' ')}>H</span>
        <span className={styles.inspectorRhCopy}>Hipótese</span>
      </span>
    </div>
  );
}

export function RhLegendMicro({ className }: { className?: string }) {
  return (
    <div className={[styles.rhMicro, className].filter(Boolean).join(' ')} aria-label="Indicadores de conexão">
      <span className={styles.rhMicroItem} title="R indica risco da relação.">
        <span className={[styles.rhMicroMarker, styles.rhMicroMarkerRisk].join(' ')}>R</span>
        <span className={styles.rhMicroCopy}>Risco</span>
      </span>
      <span className={styles.rhMicroItem} title="H indica hipótese da relação.">
        <span className={[styles.rhMicroMarker, styles.rhMicroMarkerHypothesis].join(' ')}>H</span>
        <span className={styles.rhMicroCopy}>Hipótese</span>
      </span>
    </div>
  );
}

export function ResultViewFlowInspector({
  content,
  compact = false
}: {
  content: FlowReportContent;
  compact?: boolean;
}) {
  const shouldReduceMotion = useReducedMotion();
  const transition = shouldReduceMotion ? { duration: 0.01 } : { duration: 0.28, ease: PREMIUM_EASE };

  const routeLabel =
    content.focusKind === 'edge'
      ? content.nodeTitle
      : content.primaryRelation
        ? `${content.primaryRelation.sourceTitle} → ${content.primaryRelation.targetTitle}`
        : content.nodeTitle;

  const didactic =
    content.primaryRelation?.body?.trim() ||
    content.didacticNote ||
    'Selecione um bloco ou conexão para ler o caminho causal.';

  const hasPathMarkers = content.risks.length > 0 || content.hypotheses.length > 0;

  return (
    <motion.aside
      layout={false}
      className={[styles.inspector, compact ? styles.inspectorCompact : ''].filter(Boolean).join(' ')}
      aria-label="Leitura do fluxo"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={shouldReduceMotion ? undefined : { opacity: 0, y: 2 }}
      transition={transition}
    >
      <TdmGlassSurface
        variant="default"
        stage="neutral"
        className={styles.inspectorGlass}
        contentClassName={styles.inspectorContent}
      >
        <header className={styles.inspectorHeader}>
          <p className={styles.inspectorKicker}>Leitura do fluxo</p>
          <h3 className={styles.inspectorTitle}>{routeLabel}</h3>
          <p className={styles.inspectorDidactic}>{didactic}</p>
        </header>

        {!content.hasConnections ? (
          <p className={styles.inspectorEmpty}>Este bloco ainda não possui conexões.</p>
        ) : (
          <>
            <RelationSection label="Entradas" items={content.incomingTitles} />
            <RelationSection label="Saídas" items={content.outgoingTitles} />

            <div className={styles.inspectorSection}>
              <p className={styles.inspectorSectionLabel}>Indicadores</p>
              <RhIndicators />
              {hasPathMarkers ? (
                <p className={styles.inspectorMarkerNote}>
                  {content.risks.length > 0 ? `${content.risks.length} risco${content.risks.length === 1 ? '' : 's'}` : null}
                  {content.risks.length > 0 && content.hypotheses.length > 0 ? ' · ' : null}
                  {content.hypotheses.length > 0
                    ? `${content.hypotheses.length} hipótese${content.hypotheses.length === 1 ? '' : 's'}`
                    : null}
                  {' no caminho destacado.'}
                </p>
              ) : (
                <p className={styles.inspectorMarkerNote}>Marcadores R e H aparecem nas conexões do fluxo.</p>
              )}
            </div>
          </>
        )}
      </TdmGlassSurface>
    </motion.aside>
  );
}
