'use client';

import { useCallback, useEffect, useState, type CSSProperties, type ReactElement } from 'react';
import { Panel } from '@xyflow/react';
import { AnimatePresence, motion, useReducedMotion, type Transition } from 'motion/react';
import { TDM_STAGE_ORDER, type TdmStage } from '../../domain/tdm-stages';
import { getTdmStageTheme, TDM_JOURNEY_GRADIENT, TDM_THEORY_NEUTRAL } from '../../domain/tdm-theme';
import {
  getTheoryGuideStageContent,
  THEORY_GUIDE_MAIN_TABS,
  THEORY_GUIDE_QUALIFIER_STEPS,
  THEORY_GUIDE_TIMELINE_STEPS,
  type TheoryGuideContent,
  type TheoryGuideExpandedContent,
  type TheoryGuidePhase,
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

const GUIDE_EASE = [0.22, 1, 0.36, 1] as const;

const CONNECT_NEUTRAL = 'rgba(148, 163, 184, 0.78)';
const REVIEW_ACCENT = 'rgba(148, 163, 184, 0.82)';
const VISUALIZE_ACCENT = 'rgba(91, 196, 168, 0.82)';
const INPUT_PREVIEW_ACCENT = 'rgba(139, 124, 255, 0.52)';

const PHASE_ACCENT: Record<TheoryGuidePhase, string> = {
  theory: TDM_THEORY_NEUTRAL.accent,
  input: getTdmStageTheme('input').accent,
  activity: getTdmStageTheme('activity').accent,
  output: getTdmStageTheme('output').accent,
  outcome: getTdmStageTheme('outcome').accent,
  connect: CONNECT_NEUTRAL,
  risk: 'rgba(220, 92, 108, 0.82)',
  hypothesis: 'rgba(61, 191, 154, 0.82)',
  review: REVIEW_ACCENT,
  visualize: VISUALIZE_ACCENT,
  contextual: CONNECT_NEUTRAL
};

type ControlStripTabId = (typeof THEORY_GUIDE_MAIN_TABS)[number]['id'];

const PRIMARY_GUIDE_TABS = THEORY_GUIDE_MAIN_TABS.filter((tab) =>
  ['theory', 'input', 'activity', 'output', 'outcome'].includes(tab.id)
);

function getNextStagePreviewAccent(label: string | null): string {
  if (!label) {
    return TDM_THEORY_NEUTRAL.muted;
  }

  const stageEntry = THEORY_GUIDE_MAIN_TABS.find((tab) => tab.label === label);

  if (!stageEntry || stageEntry.id === 'theory' || stageEntry.id === 'connect') {
    return TDM_THEORY_NEUTRAL.muted;
  }

  if (stageEntry.id === 'input') {
    return INPUT_PREVIEW_ACCENT;
  }

  if (stageEntry.id === 'activity' || stageEntry.id === 'output' || stageEntry.id === 'outcome') {
    return getTdmStageTheme(stageEntry.id).accent;
  }

  return TDM_THEORY_NEUTRAL.muted;
}

function getStageAccent(stage: TheoryGuideStageId): string {
  if (stage === 'theory') {
    return TDM_THEORY_NEUTRAL.accent;
  }

  if (stage === 'connect') {
    return CONNECT_NEUTRAL;
  }

  if (stage === 'review') {
    return REVIEW_ACCENT;
  }

  if (stage === 'visualize') {
    return VISUALIZE_ACCENT;
  }

  return getTdmStageTheme(stage).accent;
}

function getGuideInsightKey(content: TheoryGuideContent): string {
  return `${content.activeStage}:${content.accentPhase}:${content.flowHighlight}:${content.phase}:${content.title}:${content.message}:${content.action}`;
}

function hasExpandedTips(expanded: TheoryGuideExpandedContent): boolean {
  return Boolean(expanded.writingTip || expanded.avoid || expanded.examples || expanded.tips?.length || expanded.rule);
}

function GuideStepGlyph({ phase }: { phase: TheoryGuidePhase }) {
  const glyphs: Record<TheoryGuidePhase, ReactElement> = {
    theory: (
      <svg viewBox="0 0 16 16" className={styles.stepGlyphSvg} aria-hidden="true">
        <circle cx="8" cy="8" r="5.25" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <path d="M8 4.5V8l2.25 1.5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="8" cy="8" r="0.75" fill="currentColor" />
      </svg>
    ),
    input: (
      <svg viewBox="0 0 16 16" className={styles.stepGlyphSvg} aria-hidden="true">
        <path d="M2.5 11.5 8 3.5l5.5 8H2.5Z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M5.5 11.5h5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
    activity: (
      <svg viewBox="0 0 16 16" className={styles.stepGlyphSvg} aria-hidden="true">
        <path d="M9.25 2.5 4.75 9h3.25L6.75 13.5 11.25 7H8L9.25 2.5Z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
    ),
    output: (
      <svg viewBox="0 0 16 16" className={styles.stepGlyphSvg} aria-hidden="true">
        <path d="M3.5 5.5h9v7.5a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1V5.5Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <path d="M5.5 5.5V4.25a1.25 1.25 0 0 1 1.25-1.25h2.5A1.25 1.25 0 0 1 10.5 4.25V5.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <path d="M6.5 9l1.25 1.25L9.75 8" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    outcome: (
      <svg viewBox="0 0 16 16" className={styles.stepGlyphSvg} aria-hidden="true">
        <circle cx="8" cy="8" r="4.75" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="8" cy="8" r="1.35" fill="currentColor" />
        <path d="M8 2.5V4M8 12v1.5M2.5 8H4M12 8h1.5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
    connect: (
      <svg viewBox="0 0 16 16" className={styles.stepGlyphSvg} aria-hidden="true">
        <path d="M3 8h7M8.5 5.5 11 8l-2.5 2.5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    risk: (
      <svg viewBox="0 0 16 16" className={styles.stepGlyphSvg} aria-hidden="true">
        <path d="M8 3 2.75 12.5h10.5L8 3Z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M8 7v2.75M8 11.25h.01" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
    hypothesis: (
      <svg viewBox="0 0 16 16" className={styles.stepGlyphSvg} aria-hidden="true">
        <rect x="3.5" y="3" width="9" height="10" rx="1.25" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <path d="M5.5 6.5h5M5.5 9h3.5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
    review: (
      <svg viewBox="0 0 16 16" className={styles.stepGlyphSvg} aria-hidden="true">
        <path d="M4 8.5 6.75 11 12 5.5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="8" cy="8" r="5.25" fill="none" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
    visualize: (
      <svg viewBox="0 0 16 16" className={styles.stepGlyphSvg} aria-hidden="true">
        <rect x="3" y="4.5" width="10" height="7" rx="1" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <path d="M5.5 12.5h5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="8" cy="8" r="1.1" fill="currentColor" />
      </svg>
    ),
    contextual: (
      <svg viewBox="0 0 16 16" className={styles.stepGlyphSvg} aria-hidden="true">
        <path d="M3 8h7M8.5 5.5 11 8l-2.5 2.5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  };

  return <span className={styles.stepGlyph}>{glyphs[phase]}</span>;
}

function TabGlyph({ tabId }: { tabId: ControlStripTabId }) {
  const phase = tabId === 'connect' ? 'connect' : tabId;
  return <GuideStepGlyph phase={phase} />;
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={[styles.chevronSvg, expanded ? styles.chevronExpanded : ''].filter(Boolean).join(' ')}
      aria-hidden="true"
    >
      <path d="M4 6.25 8 10.25l4-4" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GuideTipsAccordion({
  expanded,
  prefersReducedMotion
}: {
  expanded: TheoryGuideExpandedContent;
  prefersReducedMotion: boolean | null;
}) {
  const [isTipsOpen, setIsTipsOpen] = useState(false);

  if (!hasExpandedTips(expanded)) {
    return null;
  }

  const tipsTransition: Transition = prefersReducedMotion
    ? { duration: 0.18, ease: GUIDE_EASE }
    : { duration: 0.24, ease: GUIDE_EASE };

  return (
    <div className={styles.tipsSection}>
      <button
        type="button"
        className={styles.tipsToggle}
        aria-expanded={isTipsOpen}
        onClick={() => setIsTipsOpen((current) => !current)}
      >
        <span>Ver dicas</span>
        <ChevronIcon expanded={isTipsOpen} />
      </button>

      <AnimatePresence initial={false}>
        {isTipsOpen ? (
          <motion.div
            key="guide-tips"
            className={styles.tipsPanel}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, height: 'auto' }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={tipsTransition}
          >
            {expanded.rule ? (
              <div className={styles.tipChip}>
                <span className={styles.tipChipLabel}>Regra</span>
                <span className={styles.tipChipText}>{expanded.rule}</span>
              </div>
            ) : null}

            {expanded.writingTip ? (
              <div className={styles.tipChip}>
                <span className={styles.tipChipLabel}>Como escrever</span>
                <span className={styles.tipChipText}>{expanded.writingTip}</span>
              </div>
            ) : null}

            {expanded.examples ? (
              <div className={styles.tipChip}>
                <span className={styles.tipChipLabel}>Exemplos</span>
                <span className={styles.tipChipText}>{expanded.examples}</span>
              </div>
            ) : null}

            {expanded.avoid ? (
              <div className={styles.tipChip}>
                <span className={styles.tipChipLabel}>Evite</span>
                <span className={styles.tipChipText}>{expanded.avoid}</span>
              </div>
            ) : null}

            {expanded.tips?.length ? (
              <div className={styles.tipChipRow}>
                {expanded.tips.map((tip) => (
                  <span key={tip} className={styles.tipChipSmall}>
                    {tip}
                  </span>
                ))}
              </div>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function TheoryTimeline({
  activeStage,
  expandedStage,
  accentPhase,
  isTheoryComplete,
  prefersReducedMotion
}: {
  activeStage: TheoryGuideStageId;
  expandedStage: TheoryGuideStageId;
  accentPhase: TheoryGuidePhase;
  isTheoryComplete: boolean;
  prefersReducedMotion: boolean | null;
}) {
  const expandedIndex = THEORY_GUIDE_TIMELINE_STEPS.findIndex((step) => step.id === expandedStage);
  const workflowIndex = THEORY_GUIDE_TIMELINE_STEPS.findIndex((step) => step.id === activeStage);
  const progressIndex = Math.max(expandedIndex, workflowIndex);
  const isJourneyComplete = isTheoryComplete && activeStage === 'connect';
  const timelineTransition: Transition = prefersReducedMotion
    ? { duration: 0.2, ease: GUIDE_EASE }
    : { duration: 0.38, ease: GUIDE_EASE };

  return (
    <div className={styles.timelineSection}>
      <div className={styles.timeline} role="list" aria-label="Jornada da teoria da mudança">
        <div className={styles.timelineTrack} aria-hidden="true">
          <motion.span
            className={[
              styles.timelineProgress,
              isJourneyComplete ? styles.timelineProgressComplete : ''
            ]
              .filter(Boolean)
              .join(' ')}
            initial={false}
            animate={{
              width: isJourneyComplete
                ? '100%'
                : `${Math.max(0, (progressIndex / (THEORY_GUIDE_TIMELINE_STEPS.length - 1)) * 100)}%`
            }}
            transition={timelineTransition}
            style={
              isJourneyComplete
                ? undefined
                : ({ '--timeline-accent': getStageAccent(expandedStage) } as CSSProperties)
            }
          />
        </div>

        {THEORY_GUIDE_TIMELINE_STEPS.map((step, index) => {
          const isExpandedFocus = step.id === expandedStage;
          const isWorkflowActive = step.id === activeStage;
          const isPast = index < progressIndex;
          const isConnectComplete = isJourneyComplete && step.id === 'connect';
          const accent = isConnectComplete ? getTdmStageTheme('outcome').accent : getStageAccent(step.id);

          return (
            <div
              key={step.id}
              className={[
                styles.timelineStep,
                isExpandedFocus ? styles.timelineStepFocus : '',
                isWorkflowActive ? styles.timelineStepWorkflow : '',
                isPast ? styles.timelineStepPast : '',
                isConnectComplete ? styles.timelineStepJourneyComplete : ''
              ]
                .filter(Boolean)
                .join(' ')}
              role="listitem"
              style={{ '--step-accent': accent } as CSSProperties}
            >
              {isExpandedFocus ? (
                <motion.span
                  layoutId="theory-guide-timeline-ring"
                  className={styles.timelineRing}
                  transition={timelineTransition}
                />
              ) : null}
              <span className={styles.timelineDot} />
              <span className={styles.timelineLabel}>{step.label}</span>
            </div>
          );
        })}
      </div>

      <div className={styles.qualifierRow} role="list" aria-label="Qualificadores de conexão">
        {THEORY_GUIDE_QUALIFIER_STEPS.map((qualifier) => {
          const isActive = accentPhase === qualifier.id;

          return (
            <div
              key={qualifier.id}
              className={[styles.qualifierChip, isActive ? styles.qualifierChipActive : ''].filter(Boolean).join(' ')}
              role="listitem"
              style={{ '--qualifier-accent': PHASE_ACCENT[qualifier.id] } as CSSProperties}
            >
              <span className={styles.qualifierIcon}>
                <GuideStepGlyph phase={qualifier.id} />
              </span>
              <span className={styles.qualifierCopy}>
                <span className={styles.qualifierLabel}>{qualifier.label}</span>
                <span className={styles.qualifierConnection}>{qualifier.connection}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ControlStripTabs({
  workflowStage,
  helpStage,
  accentPhase,
  stageCounts,
  isTheoryComplete,
  prefersReducedMotion,
  onTabSelect
}: {
  workflowStage: TheoryGuideStageId;
  helpStage: TheoryGuideStageId;
  accentPhase: TheoryGuidePhase;
  stageCounts: Record<TdmStage, number>;
  isTheoryComplete: boolean;
  prefersReducedMotion: boolean | null;
  onTabSelect: (tabId: ControlStripTabId) => void;
}) {
  const totalCards = TDM_STAGE_ORDER.reduce((sum, stage) => sum + stageCounts[stage], 0);
  const tabTransition: Transition = prefersReducedMotion
    ? { duration: 0.18, ease: GUIDE_EASE }
    : { duration: 0.24, ease: GUIDE_EASE };
  const isContextualPhase = accentPhase === 'risk' || accentPhase === 'hypothesis' || accentPhase === 'review' || accentPhase === 'visualize';

  return (
    <div className={styles.tabStrip} role="tablist" aria-label="Etapas da teoria">
      {PRIMARY_GUIDE_TABS.map((tab) => {
        const isWorkflowActive = workflowStage === tab.id && !isContextualPhase;
        const isHelpActive = helpStage === tab.id;
        const isCompleted =
          tab.id === 'theory'
            ? totalCards > 0
            : tab.id === 'connect'
              ? isTheoryComplete
              : tab.id in stageCounts
                ? stageCounts[tab.id as TdmStage] > 0
                : false;
        const isConnectJourneyComplete = isTheoryComplete && tab.id === 'connect';
        const tabAccent = getStageAccent(tab.id);

        return (
          <button
            key={tab.id}
            type="button"
            className={[
              styles.tab,
              isWorkflowActive ? styles.tabWorkflowActive : '',
              tab.id === 'theory' && isWorkflowActive ? styles.tabTheoryActive : '',
              isHelpActive ? styles.tabHelpActive : '',
              isCompleted && !isWorkflowActive ? styles.tabCompleted : '',
              isConnectJourneyComplete && isWorkflowActive ? styles.tabJourneyComplete : ''
            ]
              .filter(Boolean)
              .join(' ')}
            role="tab"
            aria-selected={isWorkflowActive}
            aria-label={`Ver orientação de ${tab.label}`}
            style={{ '--tab-accent': tabAccent } as CSSProperties}
            onClick={() => onTabSelect(tab.id)}
          >
            {isWorkflowActive ? (
              <motion.span
                layoutId="theory-control-strip-indicator"
                className={styles.tabIndicator}
                transition={tabTransition}
              />
            ) : null}
            <span className={styles.tabIcon}>
              <TabGlyph tabId={tab.id} />
            </span>
            <span className={styles.tabLabel}>{tab.label}</span>
            {isCompleted ? <span className={styles.tabDone} aria-hidden="true" /> : null}
          </button>
        );
      })}
    </div>
  );
}

export function TdmConnectionGuide({
  content,
  stageCounts,
  isTheoryComplete = false,
  isExpanded: isExpandedProp,
  onExpandedChange
}: TdmConnectionGuideProps) {
  const workflowStage = content.activeStage;
  const isJourneyComplete = isTheoryComplete && workflowStage === 'connect';
  const isTheoryPhase = content.accentPhase === 'theory';
  const previewAccent = getNextStagePreviewAccent(content.nextStageLabel);
  const accent = isJourneyComplete ? getTdmStageTheme('outcome').accent : (PHASE_ACCENT[content.accentPhase] ?? PHASE_ACCENT.contextual);
  const insightKey = getGuideInsightKey(content);
  const prefersReducedMotion = useReducedMotion();
  const [internalExpanded, setInternalExpanded] = useState(false);
  const isExpanded = isExpandedProp ?? internalExpanded;
  const [helpStage, setHelpStage] = useState<TheoryGuideStageId>(workflowStage);

  useEffect(() => {
    setHelpStage(workflowStage);
  }, [workflowStage]);

  const expandedContent = getTheoryGuideStageContent(helpStage, stageCounts);
  const expandedAccent = getStageAccent(helpStage);

  const textTransition: Transition = prefersReducedMotion
    ? { duration: 0.18, ease: GUIDE_EASE }
    : { duration: 0.22, ease: GUIDE_EASE };

  const expandTransition: Transition = prefersReducedMotion
    ? { duration: 0.2, ease: GUIDE_EASE }
    : { duration: 0.28, ease: GUIDE_EASE };

  const shellGlow = prefersReducedMotion
    ? '0 0.35rem 1.1rem rgba(0, 0, 0, 0.34), inset 0 0.0625rem 0 rgba(255, 255, 255, 0.05)'
    : isJourneyComplete
      ? '0 0.35rem 1.1rem rgba(0, 0, 0, 0.34), inset 0 0.0625rem 0 rgba(255, 255, 255, 0.05), 0 0 0.85rem rgba(73, 179, 255, 0.08), 0 0 0.55rem rgba(55, 200, 147, 0.06)'
      : isTheoryPhase
        ? '0 0.35rem 1.1rem rgba(0, 0, 0, 0.34), inset 0 0.0625rem 0 rgba(255, 255, 255, 0.05), 0 0 0.75rem rgba(250, 250, 250, 0.06)'
        : `0 0.35rem 1.1rem rgba(0, 0, 0, 0.34), inset 0 0.0625rem 0 rgba(255, 255, 255, 0.05), 0 0 0.75rem color-mix(in srgb, ${accent} 10%, transparent)`;

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

  const toggleExpanded = useCallback(() => {
    const nextExpanded = !isExpanded;

    if (!nextExpanded) {
      setHelpStage(workflowStage);
    }

    setExpanded(nextExpanded);
  }, [isExpanded, setExpanded, workflowStage]);

  const handleTabSelect = useCallback(
    (tabId: ControlStripTabId) => {
      setHelpStage(tabId);
      setExpanded(true);
    },
    [setExpanded]
  );

  return (
    <Panel position="top-left" className={styles.panel}>
      <motion.div
        className={[
          styles.shell,
          isTheoryPhase ? styles.shellTheory : '',
          isJourneyComplete ? styles.shellJourneyComplete : ''
        ]
          .filter(Boolean)
          .join(' ')}
        style={
          isJourneyComplete
            ? ({ '--journey-gradient': TDM_JOURNEY_GRADIENT } as CSSProperties)
            : ({ '--strip-accent': accent } as CSSProperties)
        }
        animate={{ boxShadow: shellGlow }}
        transition={{ duration: prefersReducedMotion ? 0.2 : 0.3, ease: GUIDE_EASE }}
      >
        <div className={styles.strip}>
          <div className={styles.leftZone}>
            <AnimatePresence mode="wait">
              <motion.span
                key={isJourneyComplete ? 'journey-complete' : content.accentPhase}
                className={[styles.accentDot, isJourneyComplete ? styles.accentDotJourney : ''].filter(Boolean).join(' ')}
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
                animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.85 }}
                transition={textTransition}
                style={isJourneyComplete ? undefined : ({ '--strip-accent': accent } as CSSProperties)}
                aria-hidden="true"
              />
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.span
                key={isJourneyComplete ? 'journey-complete-icon' : content.accentPhase}
                className={[styles.leftIcon, isJourneyComplete ? styles.leftIconJourney : ''].filter(Boolean).join(' ')}
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 2 }}
                animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -2 }}
                transition={textTransition}
                style={isJourneyComplete ? undefined : ({ '--strip-accent': accent } as CSSProperties)}
              >
                <GuideStepGlyph phase={content.accentPhase} />
              </motion.span>
            </AnimatePresence>

            <div className={styles.leftCopy}>
              <AnimatePresence mode="wait">
                <motion.p
                  key={`${content.accentPhase}-title`}
                  className={styles.leftTitle}
                  initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 3 }}
                  animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -2 }}
                  transition={textTransition}
                >
                  {content.title}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

          <div className={styles.centerZone}>
            <AnimatePresence mode="wait">
              <motion.div
                key={insightKey}
                className={styles.centerCopy}
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
                animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -3 }}
                transition={textTransition}
              >
                <p className={styles.centerMessage}>{content.message}</p>
                {content.action ? <p className={styles.centerAction}>{content.action}</p> : null}
              </motion.div>
            </AnimatePresence>
          </div>

          {content.nextStageLabel ? (
            <div
              className={styles.previewZone}
              aria-label={`Próxima etapa: ${content.nextStageLabel}`}
              style={{ '--preview-accent': previewAccent } as CSSProperties}
            >
              <span className={styles.previewLabel}>Próximo</span>
              <span className={styles.previewValue}>{content.nextStageLabel}</span>
            </div>
          ) : (
            <div className={styles.previewZonePlaceholder} aria-hidden="true" />
          )}

          <div className={styles.actionsZone}>
            <button
              type="button"
              className={styles.expandButton}
              aria-expanded={isExpanded}
              aria-label={isExpanded ? 'Recolher orientação detalhada' : 'Expandir orientação detalhada'}
              onClick={toggleExpanded}
            >
              <ChevronIcon expanded={isExpanded} />
            </button>
          </div>

          <div className={styles.tabStripRow}>
            <ControlStripTabs
              workflowStage={workflowStage}
              helpStage={helpStage}
              accentPhase={content.accentPhase}
              stageCounts={stageCounts}
              isTheoryComplete={isTheoryComplete}
              prefersReducedMotion={prefersReducedMotion}
              onTabSelect={handleTabSelect}
            />
          </div>
        </div>

        <AnimatePresence initial={false}>
          {isExpanded ? (
            <motion.div
              key="guide-expanded"
              className={styles.expanded}
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
              animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, height: 'auto' }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
              transition={expandTransition}
              style={{ '--expanded-accent': expandedAccent } as CSSProperties}
            >
              <TheoryTimeline
                activeStage={workflowStage}
                expandedStage={helpStage}
                accentPhase={content.accentPhase}
                isTheoryComplete={isTheoryComplete}
                prefersReducedMotion={prefersReducedMotion}
              />

              <div className={styles.expandedBody}>
                <div className={styles.expandedMain}>
                  <h3 className={styles.expandedTitle}>{expandedContent.title}</h3>
                  <p className={styles.expandedExplanation}>{expandedContent.expanded.explanation}</p>
                  {expandedContent.expanded.complement ? (
                    <p className={styles.expandedComplement}>{expandedContent.expanded.complement}</p>
                  ) : null}
                  <GuideTipsAccordion expanded={expandedContent.expanded} prefersReducedMotion={prefersReducedMotion} />
                </div>

                <p className={styles.expandedNext}>{expandedContent.expanded.nextPreview}</p>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </Panel>
  );
}
