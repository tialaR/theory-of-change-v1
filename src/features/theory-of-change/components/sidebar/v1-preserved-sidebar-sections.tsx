'use client';

import { useId, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { TdmButton } from '@/shared/ui/tdm-button/tdm-button';
import { TdmSectionIcon } from '../tdm-section-icon/tdm-section-icon';
import { FinalResultDecorLayer, FinalResultGlassSculpture } from './final-result-glass-sculpture';
import { TDM_STAGE_ORDER, type TdmStage } from '../../domain/tdm-stages';
import styles from './tdm-sidebar.module.sass';
import { AccordionChevron, ColumnsAlignIcon, FinalResultCtaArrowIcon, FinalResultHelperIcon } from './v1-preserved-sidebar-icons';

const PREVIEW_MAX_BLOCKS = 5;
/** Local visual stage accents for canvas inspector (DS V1, not domain theme). */
export const CANVAS_DS_STAGE: Record<
  TdmStage,
  { accent: string; soft: string; border: string; fieldRgb: string }
> = {
  input: {
    accent: '#a78bfa',
    soft: 'rgba(167, 139, 250, 0.18)',
    border: 'rgba(167, 139, 250, 0.34)',
    fieldRgb: '167, 139, 250'
  },
  activity: {
    accent: '#60a5fa',
    soft: 'rgba(96, 165, 250, 0.16)',
    border: 'rgba(96, 165, 250, 0.34)',
    fieldRgb: '96, 165, 250'
  },
  output: {
    accent: '#f6b35d',
    soft: 'rgba(246, 179, 93, 0.16)',
    border: 'rgba(246, 179, 93, 0.34)',
    fieldRgb: '246, 179, 93'
  },
  outcome: {
    accent: '#5ee0b5',
    soft: 'rgba(94, 224, 181, 0.16)',
    border: 'rgba(94, 224, 181, 0.34)',
    fieldRgb: '94, 224, 181'
  }
};

const PREMIUM_EASE = [0.22, 1, 0.36, 1] as const;

const STAGE_PREVIEW_CLASS: Record<TdmStage, string> = {
  input: styles.previewInput,
  activity: styles.previewActivity,
  output: styles.previewOutput,
  outcome: styles.previewOutcome
};

function CanvasAlignmentPreview({ stageCounts }: { stageCounts: Record<TdmStage, number> }) {
  const shouldReduceMotion = useReducedMotion();

  const columns = useMemo(
    () =>
      TDM_STAGE_ORDER.map((stage) => ({
        stage,
        count: stageCounts[stage],
        accent: CANVAS_DS_STAGE[stage].accent
      })),
    [stageCounts]
  );

  const containerTransition = shouldReduceMotion ? { duration: 0.01 } : { duration: 0.24, ease: PREMIUM_EASE };

  const blockTransition = (index: number) =>
    shouldReduceMotion ? { duration: 0.01 } : { duration: 0.22, delay: index * 0.025, ease: PREMIUM_EASE };

  const blockInitial = shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 6, scale: 0.96 };
  const blockAnimate = shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 };
  const blockExit = shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.96 };

  return (
    <motion.div
      className={styles.alignmentPreview}
      aria-label="Prévia do alinhamento por etapas"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={containerTransition}
      whileHover={shouldReduceMotion ? undefined : { scale: 1.008 }}
    >
      {columns.map((column) => {
        const visibleCount = Math.min(column.count, PREVIEW_MAX_BLOCKS);
        const overflow = column.count > PREVIEW_MAX_BLOCKS ? column.count - PREVIEW_MAX_BLOCKS : 0;

        return (
          <motion.div
            key={column.stage}
            layout
            className={[styles.alignmentPreviewColumn, STAGE_PREVIEW_CLASS[column.stage]].join(' ')}
            style={{ '--stage-accent': column.accent } as CSSProperties}
          >
            {column.count === 0 ? (
              <span className={styles.alignmentPreviewBlockEmpty} aria-hidden="true" />
            ) : (
              <>
                <AnimatePresence initial={false}>
                  {Array.from({ length: visibleCount }).map((_, index) => (
                    <motion.span
                      key={`${column.stage}-${index}`}
                      layout
                      className={styles.alignmentPreviewBlock}
                      initial={blockInitial}
                      animate={blockAnimate}
                      exit={blockExit}
                      transition={blockTransition(index)}
                      whileHover={
                        shouldReduceMotion
                          ? undefined
                          : {
                              y: -1,
                              scale: 1.03,
                              boxShadow: `0 0.4rem 0.85rem color-mix(in srgb, ${column.accent} 28%, transparent)`
                            }
                      }
                      aria-hidden="true"
                    />
                  ))}
                </AnimatePresence>
                <AnimatePresence initial={false}>
                  {overflow > 0 ? (
                    <motion.span
                      key={`${column.stage}-overflow-${overflow}`}
                      className={styles.alignmentPreviewOverflow}
                      style={{ '--stage-accent': column.accent } as CSSProperties}
                      initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
                      transition={shouldReduceMotion ? { duration: 0.01 } : { duration: 0.18, ease: PREMIUM_EASE }}
                      aria-hidden="true"
                    >
                      +{overflow}
                    </motion.span>
                  ) : null}
                </AnimatePresence>
              </>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
}

export function V1CanvasOrganizationAccordion({
  id,
  stageCounts,
  onOrganize
}: {
  id: string;
  stageCounts: Record<TdmStage, number>;
  onOrganize?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const contentId = `${id}-content`;
  const accordionTransition = shouldReduceMotion
    ? { duration: 0.01 }
    : { duration: 0.3, ease: PREMIUM_EASE };

  return (
    <section className={[styles.card, styles.canvasOrganizationCard].join(' ')}>
      <button
        type="button"
        className={styles.canvasOrganizationHeader}
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className={styles.canvasOrganizationTitleRow}>
          <TdmSectionIcon variant="organization" />
          <span className={styles.canvasOrganizationTitle}>Organização do canvas</span>
        </span>
        <AccordionChevron isOpen={isOpen} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            key={contentId}
            id={contentId}
            className={styles.canvasOrganizationContent}
            initial={shouldReduceMotion ? false : { height: 0, opacity: 0, y: -4 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0, height: 0 } : { height: 0, opacity: 0, y: -3 }}
            transition={accordionTransition}
            style={{ overflow: 'hidden' }}
          >
            <p className={styles.canvasOrganizationText}>
              Alinhe os blocos por etapa para ler a teoria com mais clareza.
            </p>
            <div className={styles.canvasOrgPreviewShell}>
              <p className={styles.canvasOrgPreviewLabel}>Prévia do alinhamento</p>
              <CanvasAlignmentPreview stageCounts={stageCounts} />
            </div>
            <TdmButton
              variant="secondary"
              tone="neutral"
              fullWidth
              icon={<ColumnsAlignIcon />}
              onClick={() => onOrganize?.()}
            >
              Centralizar colunas
            </TdmButton>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

export function V1BlockFormsPanel({ stage, children }: { stage: TdmStage; children: ReactNode }) {
  const stageTone = CANVAS_DS_STAGE[stage];

  return (
    <section
      className={styles.blockFormsPanel}
      style={
        {
          '--stage-accent': stageTone.accent,
          '--stage-border': stageTone.border,
          '--stage-soft': stageTone.soft,
          '--tdm-stage-field-rgb': stageTone.fieldRgb,
          '--tdm-field-use-mask-border': 1,
          '--tdm-field-accent': 'var(--stage-accent)',
          '--tdm-field-accent-rest': 'color-mix(in srgb, var(--stage-accent) 34%, transparent)'
        } as CSSProperties
      }
    >
      {children}
    </section>
  );
}

function FinalResultLiquidGlassMaterial() {
  const uid = useId().replace(/:/g, '');

  return (
    <>
      <svg
        className={styles.finalResultPanelGlassSvg}
        viewBox="0 0 200 120"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <filter id={`frlg-blur-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <filter id={`frlg-noise-${uid}`} x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.78" numOctaves="4" stitchTiles="stitch" result="noise" />
            <feColorMatrix type="saturate" values="0" in="noise" result="mono" />
            <feComponentTransfer in="mono" result="grain">
              <feFuncA type="linear" slope="0.07" />
            </feComponentTransfer>
          </filter>
          <filter id={`frlg-displace-${uid}`} x="-8%" y="-8%" width="116%" height="116%">
            <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="2" seed="8" result="warp" />
            <feDisplacementMap in="SourceGraphic" in2="warp" scale="3" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <linearGradient id={`frlg-surface-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.16)" />
            <stop offset="22%" stopColor="rgba(255, 255, 255, 0.05)" />
            <stop offset="52%" stopColor="rgba(255, 255, 255, 0.01)" />
            <stop offset="78%" stopColor="rgba(255, 255, 255, 0.03)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.08)" />
          </linearGradient>
          <linearGradient id={`frlg-rim-top-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.04)" />
            <stop offset="18%" stopColor="rgba(255, 255, 255, 0.28)" />
            <stop offset="50%" stopColor="rgba(255, 255, 255, 0.38)" />
            <stop offset="82%" stopColor="rgba(255, 255, 255, 0.28)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.04)" />
          </linearGradient>
          <linearGradient id={`frlg-rim-left-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.34)" />
            <stop offset="8%" stopColor="rgba(255, 255, 255, 0.14)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.02)" />
          </linearGradient>
          <radialGradient id={`frlg-highlight-${uid}`} cx="42%" cy="0%" r="92%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.22)" />
            <stop offset="38%" stopColor="rgba(255, 255, 255, 0.06)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
          </radialGradient>
          <radialGradient id={`frlg-caustic-${uid}`} cx="78%" cy="72%" r="48%">
            <stop offset="0%" stopColor="rgba(236, 238, 244, 0.1)" />
            <stop offset="100%" stopColor="rgba(236, 238, 244, 0)" />
          </radialGradient>
        </defs>

        <rect width="200" height="120" fill={`url(#frlg-surface-${uid})`} opacity="0.88" filter={`url(#frlg-displace-${uid})`} />
        <rect width="200" height="120" fill={`url(#frlg-highlight-${uid})`} />
        <rect width="200" height="120" fill={`url(#frlg-caustic-${uid})`} opacity="0.72" />
        <rect x="0.5" y="0.5" width="199" height="0.75" fill={`url(#frlg-rim-top-${uid})`} />
        <rect x="0.5" y="0.5" width="0.75" height="119" fill={`url(#frlg-rim-left-${uid})`} />
      </svg>
      <span className={styles.finalResultPanelGlassBackdrop} aria-hidden="true" />
      <span className={styles.finalResultPanelGlassGrain} aria-hidden="true" />
      <span className={styles.finalResultPanelGlassRefraction} aria-hidden="true" />
      <span className={styles.finalResultPanelGlassDepth} aria-hidden="true" />
      <span className={styles.finalResultPanelGlassRimLeft} aria-hidden="true" />
      <span className={styles.finalResultPanelGlassRimTop} aria-hidden="true" />
    </>
  );
}

export function V1FinalResultCard({
  canViewTdmResult,
  resultAvailabilityMessage,
  onViewResult
}: {
  canViewTdmResult: boolean;
  resultAvailabilityMessage: string;
  onViewResult: () => void;
}) {
  return (
    <section
      className={[
        styles.card,
        styles.resultCard,
        canViewTdmResult ? styles.resultCardReady : styles.resultCardBlocked
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label="Resultado da sua teoria"
    >
      <span className={styles.finalResultAccent} aria-hidden="true" />
      <span className={styles.finalResultGlassVeil} aria-hidden="true" />
      <span className={styles.finalResultGlassHighlight} aria-hidden="true" />
      <span className={styles.finalResultGlassSpecular} aria-hidden="true" />
      <span className={styles.finalResultGlassEdge} aria-hidden="true" />
      <span className={styles.finalResultGlassNoise} aria-hidden="true" />
      <span className={styles.finalResultGlassHaze} aria-hidden="true" />
      <span className={styles.finalResultHazeCore} aria-hidden="true" />
      <span className={styles.finalResultHazeBand} aria-hidden="true" />
      <span className={styles.finalResultHazeSpread} aria-hidden="true" />

      <div className={styles.finalResultScene}>
        <div className={styles.finalResultAtmosphere}>
          <FinalResultDecorLayer />
        </div>
        <div className={styles.finalResultComposition}>
          <div className={styles.finalResultSculptureZone}>
            <FinalResultGlassSculpture />
          </div>
          <div className={styles.finalResultGlassPanel}>
            <FinalResultLiquidGlassMaterial />
            <span className={styles.finalResultPanelVeil} aria-hidden="true" />
            <span className={styles.finalResultPanelSpecular} aria-hidden="true" />
            <span className={styles.finalResultPanelEdge} aria-hidden="true" />
            <div className={styles.finalResultEditorial}>
              <div className={[styles.finalResultHeadline, styles.blockFormGroupHeader].filter(Boolean).join(' ')}>
                <TdmSectionIcon variant="alignColumns" />
                <div className={styles.finalResultCopy}>
                  <h3 className={styles.blockFormGroupTitle}>Resultado da sua teoria</h3>
                  <p className={styles.finalResultLead}>
                    Revise etapas, conexões, riscos e hipóteses.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.finalResultFooter}>
        <TdmButton
          variant="secondary"
          tone="neutral"
          fullWidth
          className={styles.finalResultCta}
          onClick={onViewResult}
          icon={<FinalResultCtaArrowIcon />}
          iconPosition="right"
        >
          Visualizar resultado
        </TdmButton>
        {!canViewTdmResult ? (
          <p className={styles.finalResultHelper}>
            <span className={styles.finalResultHelperIconWrap}>
              <FinalResultHelperIcon />
            </span>
            <span>{resultAvailabilityMessage}</span>
          </p>
        ) : null}
      </div>
    </section>
  );
}
