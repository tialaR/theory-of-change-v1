'use client';

import type { CSSProperties } from 'react';
import { Panel } from '@xyflow/react';
import { AnimatePresence, motion, useReducedMotion, type Transition, type Variants } from 'motion/react';
import { TDM_STAGE_ORDER, type TdmStage } from '../../domain/tdm-stages';
import { getTdmStageTheme } from '../../domain/tdm-theme';
import {
  THEORY_GUIDE_FLOW_STEPS,
  type TheoryGuideContent,
  type TheoryGuidePhase
} from '../../domain/tdm-theory-guide';
import { TdmStageCrystalIcon } from '../stage-crystal-icon/tdm-stage-crystal-icon';
import styles from './tdm-connection-guide.module.sass';

export type TdmConnectionGuideContent = TheoryGuideContent;

export const DEFAULT_CONNECTION_GUIDE: TdmConnectionGuideContent = {
  phase: 'input',
  accentPhase: 'input',
  flowHighlight: 'input',
  title: 'Comece pelos Insumos',
  message: 'Insumos são recursos, pessoas, dados ou condições que tornam a mudança possível.',
  action: 'Crie pelo menos um Insumo para iniciar sua teoria.'
};

type TdmConnectionGuideProps = {
  content: TdmConnectionGuideContent;
};

const GUIDE_EASE = [0.22, 1, 0.36, 1] as const;

const PHASE_ACCENT: Record<TheoryGuidePhase, string> = {
  input: getTdmStageTheme('input').accent,
  activity: getTdmStageTheme('activity').accent,
  output: getTdmStageTheme('output').accent,
  outcome: getTdmStageTheme('outcome').accent,
  connect: 'rgba(167, 139, 250, 0.82)',
  risk: 'rgba(220, 92, 108, 0.82)',
  hypothesis: 'rgba(61, 191, 154, 0.82)',
  contextual: 'rgba(180, 180, 190, 0.72)'
};

function getGuideStateKey(content: TheoryGuideContent): string {
  return `${content.accentPhase}:${content.flowHighlight}:${content.phase}`;
}

function getGuideInsightKey(content: TheoryGuideContent): string {
  return `${getGuideStateKey(content)}:${content.title}:${content.message}:${content.action}`;
}

function useGuideMotion() {
  const prefersReducedMotion = useReducedMotion();

  const insightTransition: Transition = prefersReducedMotion
    ? { duration: 0.2, ease: GUIDE_EASE }
    : { duration: 0.24, ease: GUIDE_EASE };

  const accentTransition: Transition = prefersReducedMotion
    ? { duration: 0.22, ease: GUIDE_EASE }
    : { duration: 0.3, ease: GUIDE_EASE };

  const flowTransition: Transition = prefersReducedMotion
    ? { duration: 0.18, ease: GUIDE_EASE }
    : { duration: 0.22, ease: GUIDE_EASE };

  const insightVariants: Variants = prefersReducedMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { ...insightTransition, staggerChildren: 0.03 } },
        exit: { opacity: 0, transition: insightTransition }
      }
    : {
        initial: { opacity: 0, y: 4 },
        animate: { opacity: 1, y: 0, transition: { ...insightTransition, staggerChildren: 0.045 } },
        exit: { opacity: 0, y: -3, transition: insightTransition }
      };

  const insightItemVariants: Variants = prefersReducedMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: insightTransition },
        exit: { opacity: 0, transition: insightTransition }
      }
    : {
        initial: { opacity: 0, y: 3 },
        animate: { opacity: 1, y: 0, transition: insightTransition },
        exit: { opacity: 0, y: -2, transition: insightTransition }
      };

  const accentIconVariants: Variants = prefersReducedMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: accentTransition },
        exit: { opacity: 0, transition: accentTransition }
      }
    : {
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1, transition: accentTransition },
        exit: { opacity: 0, scale: 0.96, transition: accentTransition }
      };

  const accentRailVariants: Variants = prefersReducedMotion
    ? {
        initial: { opacity: 0.4 },
        animate: { opacity: 1, transition: accentTransition },
        exit: { opacity: 0, transition: accentTransition }
      }
    : {
        initial: { opacity: 0.35, scaleY: 0.88 },
        animate: { opacity: 1, scaleY: 1, transition: accentTransition },
        exit: { opacity: 0, scaleY: 0.94, transition: accentTransition }
      };

  return {
    prefersReducedMotion,
    insightTransition,
    accentTransition,
    flowTransition,
    insightVariants,
    insightItemVariants,
    accentIconVariants,
    accentRailVariants
  };
}

function isStagePhase(phase: TheoryGuidePhase): phase is (typeof TDM_STAGE_ORDER)[number] {
  return TDM_STAGE_ORDER.includes(phase as (typeof TDM_STAGE_ORDER)[number]);
}

function GuidePhaseIcon({ phase }: { phase: TheoryGuidePhase }) {
  if (isStagePhase(phase)) {
    return <TdmStageCrystalIcon stage={phase} size="xs" animated={false} emphasis="subtle" className={styles.phaseIcon} />;
  }

  if (phase === 'connect' || phase === 'contextual') {
    return (
      <span className={styles.phaseGlyph} aria-hidden="true">
        <svg viewBox="0 0 24 24" className={styles.phaseGlyphSvg}>
          <path d="M5 12h10M13 8l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }

  if (phase === 'risk') {
    return (
      <span className={styles.phaseGlyph} aria-hidden="true">
        <svg viewBox="0 0 24 24" className={styles.phaseGlyphSvg}>
          <path d="M12 4.5 3.5 19h17L12 4.5Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M12 10v4.5M12 17.2h.01" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </span>
    );
  }

  return (
    <span className={styles.phaseGlyph} aria-hidden="true">
      <svg viewBox="0 0 24 24" className={styles.phaseGlyphSvg}>
        <path d="M8 7.5h8M8 12h5.5M8 16.5h7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <rect x="4.5" y="4.5" width="15" height="15" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </span>
  );
}

function GuideMiniFlow({
  flowHighlight,
  flowTransition,
  prefersReducedMotion
}: {
  flowHighlight: TdmStage | 'connect';
  flowTransition: Transition;
  prefersReducedMotion: boolean | null;
}) {
  return (
    <ol className={styles.miniFlow} aria-label="Fluxo da teoria">
      {THEORY_GUIDE_FLOW_STEPS.map((step, index) => {
        const isActive = flowHighlight === step.stage;
        const isConnectPhase = flowHighlight === 'connect';
        const highlightIndex = isConnectPhase ? -1 : TDM_STAGE_ORDER.indexOf(flowHighlight);
        const isPast = !isConnectPhase && TDM_STAGE_ORDER.indexOf(step.stage) < highlightIndex;
        const stepAccent = getTdmStageTheme(step.stage).accent;

        return (
          <li key={step.stage} className={styles.miniFlowItem}>
            {index > 0 ? <span className={styles.miniFlowArrow} aria-hidden="true">→</span> : null}
            <motion.span
              className={[
                styles.miniFlowStep,
                isActive ? styles.miniFlowStepActive : '',
                isPast && !isActive ? styles.miniFlowStepPast : ''
              ]
                .filter(Boolean)
                .join(' ')}
              animate={
                prefersReducedMotion
                  ? { opacity: isActive ? 1 : isPast ? 0.58 : 0.72 }
                  : {
                      opacity: isActive ? 1 : isPast ? 0.58 : 0.72,
                      y: isActive ? 0 : 1
                    }
              }
              transition={flowTransition}
              style={
                isActive
                  ? ({
                      '--mini-flow-accent': stepAccent,
                      color: stepAccent
                    } as CSSProperties)
                  : undefined
              }
            >
              {step.label}
            </motion.span>
          </li>
        );
      })}
    </ol>
  );
}

export function TdmConnectionGuide({ content }: TdmConnectionGuideProps) {
  const accent = PHASE_ACCENT[content.accentPhase] ?? PHASE_ACCENT.contextual;
  const insightKey = getGuideInsightKey(content);
  const {
    prefersReducedMotion,
    insightTransition,
    flowTransition,
    insightVariants,
    insightItemVariants,
    accentIconVariants,
    accentRailVariants
  } = useGuideMotion();

  const shellGlow = prefersReducedMotion
    ? '0 0.5rem 1.5rem rgba(0, 0, 0, 0.32), inset 0 0.0625rem 0 rgba(255, 255, 255, 0.06)'
    : `0 0.5rem 1.5rem rgba(0, 0, 0, 0.32), inset 0 0.0625rem 0 rgba(255, 255, 255, 0.06), 0 0 0.95rem color-mix(in srgb, ${accent} 12%, transparent)`;

  return (
    <Panel position="top-left" className={styles.panel}>
      <motion.div
        className={styles.shell}
        style={{ '--guide-accent': accent } as CSSProperties}
        animate={{ boxShadow: shellGlow }}
        transition={{ duration: prefersReducedMotion ? 0.2 : 0.34, ease: GUIDE_EASE }}
      >
        <div className={styles.accentRailHost} aria-hidden="true">
          <AnimatePresence mode="wait">
            <motion.div
              key={content.accentPhase}
              className={styles.accentRail}
              variants={accentRailVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            />
          </AnimatePresence>
        </div>

        <div className={styles.iconCell}>
          <AnimatePresence mode="wait">
            <motion.div
              key={content.accentPhase}
              className={styles.iconMotion}
              variants={accentIconVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <GuidePhaseIcon phase={content.phase} />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className={styles.copyCell}>
          <AnimatePresence mode="wait">
            <motion.div
              key={insightKey}
              className={styles.copyStack}
              variants={insightVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <motion.p className={styles.title} variants={insightItemVariants}>
                {content.title}
              </motion.p>
              <motion.p className={styles.message} variants={insightItemVariants}>
                {content.message}
              </motion.p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className={styles.actionCell}>
          <AnimatePresence mode="wait">
            {content.action ? (
              <motion.p
                key={`${insightKey}-action`}
                className={styles.action}
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 3 }}
                animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -2 }}
                transition={{
                  ...insightTransition,
                  delay: prefersReducedMotion ? 0.02 : 0.06
                }}
              >
                {content.action}
              </motion.p>
            ) : null}
          </AnimatePresence>
        </div>

        <div className={styles.flowCell}>
          <GuideMiniFlow
            flowHighlight={content.flowHighlight}
            flowTransition={flowTransition}
            prefersReducedMotion={prefersReducedMotion}
          />
        </div>
      </motion.div>
    </Panel>
  );
}
