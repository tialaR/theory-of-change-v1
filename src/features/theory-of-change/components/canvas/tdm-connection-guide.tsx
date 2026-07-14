'use client';

import { useCallback, useState, type CSSProperties } from 'react';
import { Panel } from '@xyflow/react';
import { TDM_STAGE_ORDER, type TdmStage } from '../../domain/tdm-stages';
import { TDM_THEORY_NEUTRAL } from '../../domain/tdm-theme';
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

/** Local visual accents for Stage Plate (module DS — not domain theme). */
const STAGE_ACCENTS: Record<TdmStage, string> = {
  input: '#a78bfa',
  activity: '#60a5fa',
  output: '#f6b35d',
  outcome: '#5ee0b5'
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

function getActiveStageAccent(stage: TheoryGuideStageId): string {
  if (stage === 'input') return STAGE_ACCENTS.input;
  if (stage === 'activity') return STAGE_ACCENTS.activity;
  if (stage === 'output') return STAGE_ACCENTS.output;
  if (stage === 'outcome') return STAGE_ACCENTS.outcome;
  return TDM_THEORY_NEUTRAL.muted;
}

function getNextStagePreviewAccent(label: string | null): string {
  if (!label) {
    return TDM_THEORY_NEUTRAL.muted;
  }

  const stageEntry = THEORY_GUIDE_MAIN_TABS.find((tab) => tab.label === label);

  if (!stageEntry || stageEntry.id === 'theory' || stageEntry.id === 'connect') {
    return TDM_THEORY_NEUTRAL.muted;
  }

  return getActiveStageAccent(stageEntry.id);
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
  const stageAccent = getActiveStageAccent(content.activeStage);
  const previewAccent = getNextStagePreviewAccent(content.nextStageLabel);
  const shortHelp =
    content.action?.trim() || content.message?.trim() || 'Crie o próximo bloco para avançar.';
  const compactCounts = TDM_STAGE_ORDER.map((stage) => stageCounts[stage]).join(' / ');

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
      <div
        className={[styles.shell, isExpanded ? styles.shellExpanded : ''].filter(Boolean).join(' ')}
        style={{ '--stage-accent': stageAccent } as CSSProperties}
      >
        <div className={styles.compactRow}>
          <span className={styles.stageDot} aria-hidden="true" />
          <span className={styles.stageTitle}>{currentStageLabel}</span>
          <span className={styles.compactDivider} aria-hidden="true">
            ·
          </span>
          <span className={styles.compactCounts} aria-label="Contadores rápidos">
            {compactCounts}
          </span>
          <span className={styles.compactDivider} aria-hidden="true">
            ·
          </span>
          <span
            className={[styles.compactConnections, isTheoryComplete ? styles.compactConnectionsReady : '']
              .filter(Boolean)
              .join(' ')}
            aria-label="Conexões"
          >
            Conexões
          </span>

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

        <div className={styles.expandedBlock} data-open={isExpanded ? 'true' : undefined}>
          <div className={styles.expandedInner}>
            <div className={styles.expandedMeta}>
              {content.nextStageLabel ? (
                <span
                  className={styles.nextStep}
                  style={{ '--preview-accent': previewAccent } as CSSProperties}
                >
                  <span className={styles.nextStepPrefix}>Próximo</span>
                  {content.nextStageLabel}
                </span>
              ) : null}

              <div className={styles.counters} aria-label="Contadores por etapa">
                {TDM_STAGE_ORDER.map((stage) => (
                  <span
                    key={stage}
                    className={styles.counter}
                    style={{ '--counter-accent': STAGE_ACCENTS[stage] } as CSSProperties}
                  >
                    <span className={styles.counterDot} aria-hidden="true" />
                    <span className={styles.counterLabel}>{STAGE_COUNTER_LABELS[stage]}</span>
                    <span className={styles.counterValue}>{stageCounts[stage]}</span>
                  </span>
                ))}
              </div>

              <span
                className={[styles.connectionsChip, isTheoryComplete ? styles.connectionsChipComplete : '']
                  .filter(Boolean)
                  .join(' ')}
                aria-label="Conexões"
              >
                <span className={styles.counterLabel}>Conexões</span>
                <span className={styles.counterValue}>{isTheoryComplete ? '✓' : '—'}</span>
              </span>
            </div>

            <p className={styles.helpText}>{shortHelp}</p>
          </div>
        </div>
      </div>
    </Panel>
  );
}
