import { useMemo, type CSSProperties, type RefObject } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { TdmEdge, TdmNode } from '../../../domain/tdm-types';
import { TDM_STAGE_LABELS, TDM_STAGE_ORDER } from '../../../domain/tdm-stages';
import {
  RESULT_VIEW_TITLE,
  buildTheoryStatusSummary,
  getResultStageAccent,
  type ResultExportFormat
} from '../result-view-utils';
import type { FlowReportContent } from '../result-view-utils.types';
import { ResultViewExportMenu } from '../result-view-export-menu/result-view-export-menu';
import { ResultViewFlowInspector, RhLegendMicro } from '../result-view-flow-inspector';
import { TdmGlassSurface } from '../tdm-glass-surface';
import styles from '../result-view.module.sass';

const PREMIUM_EASE = [0.22, 1, 0.36, 1] as const;
const HERO_ENTRANCE = { duration: 0.42, ease: PREMIUM_EASE };

function BackArrowIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className={styles.backButtonIcon}>
      <path
        d="M10 3.5 5.5 8 10 12.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ResultHeaderStats({ nodes, edges }: { nodes: TdmNode[]; edges: TdmEdge[] }) {
  const status = useMemo(() => buildTheoryStatusSummary(nodes, edges), [nodes, edges]);

  return (
    <div className={styles.statusGlassTray} aria-label="Resumo da teoria">
      <div className={styles.statusGrid}>
        {TDM_STAGE_ORDER.map((stage) => {
          const theme = getResultStageAccent(stage);
          const count = status.stageCounts[stage];

          return (
            <span
              key={stage}
              className={styles.statusStat}
              style={
                {
                  '--stage-accent': theme.accent,
                  '--stage-accent-soft': theme.accentSoft
                } as CSSProperties
              }
            >
              <span className={styles.statusStatValue}>{count}</span>
              <span className={styles.statusStatLabel}>{TDM_STAGE_LABELS[stage]}</span>
            </span>
          );
        })}
        <span className={styles.statusStat}>
          <span className={styles.statusStatValue}>{status.connectionCount}</span>
          <span className={styles.statusStatLabel}>Conexões</span>
        </span>
        {status.riskCount > 0 ? (
          <span className={[styles.statusStat, styles.statusStatMarker].join(' ')}>
            <span className={styles.statusStatValue}>{status.riskCount}</span>
            <span className={styles.statusStatLabel}>Riscos</span>
          </span>
        ) : null}
        {status.hypothesisCount > 0 ? (
          <span className={[styles.statusStat, styles.statusStatHypothesis].join(' ')}>
            <span className={styles.statusStatValue}>{status.hypothesisCount}</span>
            <span className={styles.statusStatLabel}>Hipóteses</span>
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function ResultViewHero({
  nodes,
  edges,
  description,
  backLabel,
  showExportActions,
  exportMenuOpen,
  isExporting,
  isHeroCompact,
  shouldReduceMotion,
  flowInspectorContent,
  flowInspectorSlotRef,
  flowInspectorMobileRef,
  onToggleExportMenu,
  onCloseExportMenu,
  onExport,
  onBack
}: {
  nodes: TdmNode[];
  edges: TdmEdge[];
  description?: string;
  backLabel: string;
  showExportActions: boolean;
  exportMenuOpen: boolean;
  isExporting: boolean;
  isHeroCompact: boolean;
  shouldReduceMotion: boolean | null;
  flowInspectorContent: FlowReportContent | null;
  flowInspectorSlotRef: RefObject<HTMLDivElement | null>;
  flowInspectorMobileRef: RefObject<HTMLDivElement | null>;
  onToggleExportMenu: () => void;
  onCloseExportMenu: () => void;
  onExport: (format: ResultExportFormat) => void;
  onBack: () => void;
}) {
  return (
    <>
      <motion.header
        className={[styles.hero, isHeroCompact ? styles.heroCompact : ''].filter(Boolean).join(' ')}
        data-export-exclude="true"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={shouldReduceMotion ? { duration: 0.01 } : HERO_ENTRANCE}
      >
        <span className={styles.heroRibbon} aria-hidden="true" />

        <div className={styles.heroInner}>
          <div className={styles.heroLeft}>
            <span className={styles.heroEditorialLine} aria-hidden="true" />
            <p className={styles.kicker}>Resultado da Teoria da Mudança</p>
            <div className={styles.heroTitleShell}>
              <h1 className={styles.title}>{RESULT_VIEW_TITLE}</h1>
            </div>
            <div className={styles.heroExpandable}>
              <p className={styles.subtitle}>
                {description?.trim() ||
                  'Leia a lógica da intervenção em etapas, conexões, riscos e hipóteses.'}
              </p>
              <p className={styles.instruction}>
                <span className={styles.instructionDot} aria-hidden="true" />
                Selecione um bloco ou conexão para revelar o caminho causal.
              </p>
              <div className={[styles.heroMetaRow, styles.noPrint].join(' ')}>
                <ResultHeaderStats nodes={nodes} edges={edges} />
              </div>
            </div>
          </div>

          <div className={[styles.heroRight, styles.noPrint].join(' ')}>
            <div className={styles.heroActions}>
              {showExportActions ? (
                <ResultViewExportMenu
                  isOpen={exportMenuOpen}
                  onToggle={onToggleExportMenu}
                  onClose={onCloseExportMenu}
                  onExport={onExport}
                  shouldReduceMotion={shouldReduceMotion}
                  isExporting={isExporting}
                />
              ) : null}
              <TdmGlassSurface
                variant="strong"
                stage="neutral"
                interactive
                className={showExportActions ? styles.backButtonSecondaryGlass : styles.backButtonGlass}
              >
                <button type="button" className={styles.backButtonInner} onClick={onBack}>
                  <BackArrowIcon />
                  <span>{backLabel}</span>
                </button>
              </TdmGlassSurface>
            </div>

            <div className={styles.flowInspectorSlot} ref={flowInspectorSlotRef}>
              <AnimatePresence initial={false}>
                {flowInspectorContent ? (
                  <ResultViewFlowInspector
                    key={flowInspectorContent.edgeId ?? flowInspectorContent.nodeId}
                    content={flowInspectorContent}
                    compact={isHeroCompact}
                  />
                ) : (
                  <motion.div
                    key="rh-micro"
                    initial={false}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={shouldReduceMotion ? { duration: 0.01 } : { duration: 0.18, ease: PREMIUM_EASE }}
                  >
                    <RhLegendMicro className={styles.heroRhMicro} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.header>

      <div
        className={[styles.flowInspectorMobile, styles.noPrint].join(' ')}
        ref={flowInspectorMobileRef}
      >
        <AnimatePresence mode="wait">
          {flowInspectorContent ? (
            <ResultViewFlowInspector
              key={flowInspectorContent.edgeId ?? flowInspectorContent.nodeId}
              content={flowInspectorContent}
            />
          ) : null}
        </AnimatePresence>
      </div>
    </>
  );
}
