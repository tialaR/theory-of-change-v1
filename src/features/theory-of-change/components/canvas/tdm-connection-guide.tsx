'use client';

import { useCallback, useState, type CSSProperties } from 'react';
import { Panel } from '@xyflow/react';
import { AnimatePresence, motion, type Transition } from 'motion/react';
import { TDM_STAGE_ORDER, type TdmStage } from '../../domain/tdm-stages';
import { getTdmStageTheme, TDM_THEORY_NEUTRAL } from '../../domain/tdm-theme';
import {
  THEORY_GUIDE_MAIN_TABS,
  type TheoryGuideContent,
  type TheoryGuideStageId
} from '../../domain/tdm-theory-guide';
import styles from './tdm-connection-guide.module.sass';

export type TdmConnectionGuideContent = TheoryGuideContent;

export const DEFAULT_CONNECTION_GUIDE: TdmConnectionGuideContent = {
  phase: 'theory',
  activeStage: 'theory',
  accentPhase: 'theory',
  flowHighlight: 'theory',
  title: 'Teoria da Mudança',
  message: 'Organize como recursos viram ações, ações geram entregas e entregas produzem mudanças.',
  action: 'Comece criando seus Insumos.',
  nextStageLabel: 'Insumos',
  expanded: {
    explanation:
      'Esta ferramenta ajuda a construir uma Teoria da Mudança seguindo a lógica CLEAR/FGV: Insumos → Atividades → Produtos → Resultados.',
    complement:
      'A ideia é tornar visível a coerência da intervenção, suas relações causais, suas hipóteses e os riscos de implementação.',
    nextPreview: 'Comece criando seus Insumos.'
  }
};

type TdmConnectionGuideProps = {
  content: TdmConnectionGuideContent;
  stageCounts: Record<TdmStage, number>;
  isTheoryComplete?: boolean;
  isExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
};

/** Stable SSR/client kicker — responsive shortening is CSS-only. */
const GUIDE_META_LABEL = 'Etapa';

const GUIDE_EXPAND_TRANSITION: Transition = {
  duration: 0.22,
  ease: [0.22, 1, 0.36, 1]
};

const STAGE_COUNTER_LABELS: Record<TdmStage, string> = {
  input: 'Insumos',
  activity: 'Atividades',
  output: 'Produtos',
  outcome: 'Resultados'
};

function getStageLabel(stage: TheoryGuideStageId): string {
  return THEORY_GUIDE_MAIN_TABS.find((tab) => tab.id === stage)?.label ?? 'Teoria';
}

function getNextStagePreviewAccent(label: string | null): string {
  if (!label) {
    return TDM_THEORY_NEUTRAL.muted;
  }

  const stageEntry = THEORY_GUIDE_MAIN_TABS.find((tab) => tab.label === label);

  if (!stageEntry || stageEntry.id === 'theory' || stageEntry.id === 'connect') {
    return TDM_THEORY_NEUTRAL.muted;
  }

  if (stageEntry.id === 'input') {
    return 'rgba(186, 178, 220, 0.72)';
  }

  if (stageEntry.id === 'activity' || stageEntry.id === 'output' || stageEntry.id === 'outcome') {
    return getTdmStageTheme(stageEntry.id).accent;
  }

  return TDM_THEORY_NEUTRAL.muted;
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={[styles.chevronSvg, expanded ? styles.chevronExpanded : ''].filter(Boolean).join(' ')}
      aria-hidden="true"
    >
      <path
        d="M4 6.25 8 10.25l4-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TdmConnectionGuide({
  content,
  stageCounts,
  isTheoryComplete = false,
  isExpanded: isExpandedProp,
  onExpandedChange
}: TdmConnectionGuideProps) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const isExpanded = isExpandedProp ?? internalExpanded;

  const currentStageLabel = getStageLabel(content.activeStage);
  const previewAccent = getNextStagePreviewAccent(content.nextStageLabel);
  const shortHelp =
    content.action?.trim() || content.message?.trim() || 'Crie o próximo bloco para avançar.';

  const setExpanded = useCallback(
    (nextExpanded: boolean) => {
      if (onExpandedChange) {
        onExpandedChange(nextExpanded);
      } else {
        setInternalExpanded(nextExpanded);
      }
    },
    [onExpandedChange]
  );

  const handleToggle = useCallback(() => {
    setExpanded(!isExpanded);
  }, [isExpanded, setExpanded]);

  return (
    <Panel position="top-left" className={styles.panel}>
      <div className={[styles.shell, isExpanded ? styles.shellExpanded : ''].filter(Boolean).join(' ')}>
        <div className={styles.toolbarRow}>
          <div className={styles.guideBlock}>
            <span className={styles.guideLabel}>
              <span className={styles.guideLabelText}>{GUIDE_META_LABEL}</span>
              <span className={styles.guideLabelSuffix} aria-hidden="true">
                {' '}
                atual
              </span>
            </span>
            <span className={styles.stageTitle}>{currentStageLabel}</span>
          </div>

          {content.nextStageLabel ? (
            <>
              <span className={styles.divider} aria-hidden="true" />
              <span
                className={styles.nextStep}
                style={{ '--preview-accent': previewAccent } as CSSProperties}
              >
                Próximo: {content.nextStageLabel}
              </span>
            </>
          ) : null}

          <div className={styles.counters} aria-label="Contadores rápidos">
            {TDM_STAGE_ORDER.map((stage) => (
              <span
                key={stage}
                className={styles.counter}
                style={{ '--counter-accent': getTdmStageTheme(stage).accent } as CSSProperties}
              >
                <span className={styles.counterDot} aria-hidden="true" />
                <span className={styles.counterLabel}>{STAGE_COUNTER_LABELS[stage]}</span>
                <span className={styles.counterValue}>{stageCounts[stage]}</span>
              </span>
            ))}
            <span
              className={[styles.counter, isTheoryComplete ? styles.counterComplete : '']
                .filter(Boolean)
                .join(' ')}
            >
              <span className={styles.counterLabel}>Conexões</span>
              <span className={styles.counterValue}>{isTheoryComplete ? '✓' : '—'}</span>
            </span>
          </div>

          <button
            type="button"
            className={styles.toggleButton}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Recolher guia' : 'Expandir guia'}
            onClick={handleToggle}
          >
            <ChevronIcon expanded={isExpanded} />
          </button>
        </div>

        <AnimatePresence initial={false}>
          {isExpanded ? (
            <motion.div
              key="guide-help"
              className={styles.helpRow}
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={GUIDE_EXPAND_TRANSITION}
            >
              <p className={styles.helpText}>{shortHelp}</p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </Panel>
  );
}
