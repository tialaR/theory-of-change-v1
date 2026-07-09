'use client';

import { useId, useMemo, useState, type CSSProperties, type DragEvent, type ReactNode } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { TdmButton } from '@/shared/ui/tdm-button/tdm-button';
import buttonStyles from '@/shared/ui/tdm-button/tdm-button.module.sass';
import { TdmSectionIcon } from '../tdm-section-icon/tdm-section-icon';
import { FinalResultDecorLayer, FinalResultGlassSculpture } from './final-result-glass-sculpture';
import { TDM_STAGE_ORDER, type TdmStage } from '../../domain/tdm-stages';
import { getTdmStageTheme } from '../../domain/tdm-theme';
import type { StageCreation } from '../../utils/stage-creation';
import styles from './tdm-sidebar.module.sass';

const PREVIEW_MAX_BLOCKS = 5;
const PREMIUM_EASE = [0.22, 1, 0.36, 1] as const;

const STAGE_PREVIEW_CLASS: Record<TdmStage, string> = {
  input: styles.previewInput,
  activity: styles.previewActivity,
  output: styles.previewOutput,
  outcome: styles.previewOutcome
};

function StageDragIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" focusable="false" className={styles.dragGlyph}>
      <rect x="5" y="13" width="12" height="12" rx="2.5" />
      <rect x="14" y="5" width="13" height="13" rx="2.5" className={styles.dragGhost} />
      <path d="M14 16 25 27" />
      <path d="m18.5 26.5 6.5.5-.5-6.5" />
    </svg>
  );
}

function AccordionChevron({ isOpen, className }: { isOpen: boolean; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={[
        styles.sidebarAccordionChevron,
        isOpen ? styles.sidebarAccordionChevronOpen : '',
        className
      ]
        .filter(Boolean)
        .join(' ')}
      fill="none"
    >
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ColumnsAlignIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={buttonStyles.icon} fill="none">
      <rect x="6" y="5" width="20" height="22" rx="6" stroke="currentColor" strokeWidth="2.2" />
      <path d="M12 10V22" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M16 10V22" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M20 10V22" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function CanvasAlignmentPreview({ stageCounts }: { stageCounts: Record<TdmStage, number> }) {
  const shouldReduceMotion = useReducedMotion();

  const columns = useMemo(
    () =>
      TDM_STAGE_ORDER.map((stage) => ({
        stage,
        count: stageCounts[stage],
        theme: getTdmStageTheme(stage)
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
            style={{ '--stage-accent': column.theme.accent } as CSSProperties}
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
                              boxShadow: `0 0.4rem 0.85rem color-mix(in srgb, ${column.theme.accent} 28%, transparent)`
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
                      style={{ '--stage-accent': column.theme.accent } as CSSProperties}
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
  const [isOpen, setIsOpen] = useState(true);
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
              Organize o canvas automaticamente. Alinhe os blocos por etapa para visualizar a teoria com mais clareza.
            </p>
            <div className={styles.canvasOrgPreviewShell}>
              <p className={styles.canvasOrgPreviewLabel}>Prévia do alinhamento</p>
              <CanvasAlignmentPreview stageCounts={stageCounts} />
            </div>
            <TdmButton variant="secondary" fullWidth icon={<ColumnsAlignIcon />} onClick={() => onOrganize?.()}>
              Centralizar colunas
            </TdmButton>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

export function V1BlockFormsPanel({ stage, children }: { stage: TdmStage; children: ReactNode }) {
  const theme = getTdmStageTheme(stage);

  return (
    <section
      className={styles.blockFormsPanel}
      style={
        {
          '--stage-accent': theme.accent,
          '--stage-border': theme.border,
          '--stage-soft': theme.accentSoft
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

function FinalResultCtaArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className={buttonStyles.icon}>
      <path
        d="M4.5 11.5 11.5 4.5M11.5 4.5H6.25M11.5 4.5V9.75"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FinalResultHelperIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className={styles.finalResultHelperIcon}>
      <circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M8 7.1v3.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="8" cy="5.15" r="0.55" fill="currentColor" />
    </svg>
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
      aria-label="Resultado final"
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
              <p className={styles.finalResultKicker}>Resultado final</p>
              <h3 className={styles.finalResultHeadline}>
                <span className={styles.finalResultHeadlineLead}>Sua teoria</span>
                <span className={styles.finalResultHeadlineAccent}>ganha forma</span>
              </h3>
              <span className={styles.finalResultHairline} aria-hidden="true" />
              <p className={styles.finalResultLead}>
                A síntese visual de cada etapa reunida em uma visão completa.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.finalResultFooter}>
        <TdmButton
          variant={canViewTdmResult ? 'primary' : 'secondary'}
          fullWidth
          className={styles.finalResultCta}
          onClick={onViewResult}
          icon={<FinalResultCtaArrowIcon />}
          iconPosition="right"
        >
          Visualizar teoria completa
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

function TheoryProgressOrbitalSculpture() {
  const uid = useId().replace(/:/g, '');

  return (
    <div className={styles.progressOrbitalSculpture} aria-hidden="true">
      <span className={styles.progressOrbitalNucleusGlow} />
      <span className={styles.progressOrbitalSmoke} />
      <span className={styles.progressOrbitalAmbient} />
      <span className={styles.progressOrbitalHazeEmit} />
      <svg
        className={styles.progressOrbitalSvg}
        viewBox="0 0 220 150"
        preserveAspectRatio="xMinYMid slice"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <radialGradient
            id={`tpo-core-${uid}`}
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(72 74) scale(38)"
          >
            <stop stopColor="rgba(252, 252, 255, 0.42)" />
            <stop offset="0.28" stopColor="rgba(236, 238, 244, 0.28)" />
            <stop offset="0.55" stopColor="rgba(168, 170, 176, 0.14)" />
            <stop offset="0.82" stopColor="rgba(68, 70, 76, 0.1)" />
            <stop offset="1" stopColor="rgba(12, 13, 16, 0.52)" />
          </radialGradient>
          <radialGradient
            id={`tpo-halo-${uid}`}
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(72 74) scale(88 62)"
          >
            <stop stopColor="rgba(236, 238, 244, 0.2)" />
            <stop offset="0.42" stopColor="rgba(196, 198, 204, 0.08)" />
            <stop offset="0.72" stopColor="rgba(120, 122, 128, 0.04)" />
            <stop offset="1" stopColor="rgba(214, 216, 222, 0)" />
          </radialGradient>
          <linearGradient id={`tpo-orbit-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(236, 238, 244, 0.28)" />
            <stop offset="50%" stopColor="rgba(196, 198, 204, 0.12)" />
            <stop offset="100%" stopColor="rgba(120, 122, 128, 0.04)" />
          </linearGradient>
          <linearGradient id={`tpo-haze-${uid}`} x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="rgba(236, 238, 244, 0.18)" />
            <stop offset="38%" stopColor="rgba(196, 198, 204, 0.1)" />
            <stop offset="72%" stopColor="rgba(148, 150, 156, 0.04)" />
            <stop offset="100%" stopColor="rgba(214, 216, 222, 0)" />
          </linearGradient>
          <filter id={`tpo-blur-soft-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
          <filter id={`tpo-blur-haze-${uid}`} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
          <filter id={`tpo-blur-progressive-${uid}`} x="-20%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0" result="sharp" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blurred" />
            <feMerge>
              <feMergeNode in="blurred" />
              <feMergeNode in="sharp" />
            </feMerge>
          </filter>
        </defs>

        <ellipse
          cx="108"
          cy="74"
          rx="92"
          ry="48"
          fill={`url(#tpo-haze-${uid})`}
          filter={`url(#tpo-blur-haze-${uid})`}
          opacity="0.72"
          className={styles.progressOrbitalHazeField}
        />

        <ellipse cx="72" cy="74" rx="72" ry="50" fill={`url(#tpo-halo-${uid})`} className={styles.progressOrbitalHalo} />

        <g className={styles.progressOrbitalRingOuter}>
          <ellipse cx="72" cy="76" rx="58" ry="24" stroke={`url(#tpo-orbit-${uid})`} strokeWidth="0.7" opacity="0.95" />
          <ellipse
            cx="108"
            cy="72"
            rx="78"
            ry="18"
            stroke="rgba(214, 216, 222, 0.14)"
            strokeWidth="0.5"
            transform="rotate(-6 108 72)"
          />
        </g>
        <g className={styles.progressOrbitalRingMid}>
          <ellipse
            cx="72"
            cy="74"
            rx="46"
            ry="32"
            stroke="rgba(236, 238, 244, 0.22)"
            strokeWidth="0.58"
            transform="rotate(-22 72 74)"
          />
          <ellipse
            cx="96"
            cy="78"
            rx="62"
            ry="14"
            stroke="rgba(168, 170, 176, 0.09)"
            strokeWidth="0.38"
            transform="rotate(8 96 78)"
            strokeDasharray="2.5 3"
          />
        </g>
        <g className={styles.progressOrbitalRingInner}>
          <ellipse
            cx="72"
            cy="74"
            rx="32"
            ry="18"
            stroke="rgba(236, 238, 244, 0.16)"
            strokeWidth="0.45"
            transform="rotate(16 72 74)"
            strokeDasharray="2 2.8"
          />
        </g>
        <g className={styles.progressOrbitalRingFine}>
          <ellipse
            cx="72"
            cy="74"
            rx="24"
            ry="12"
            stroke="rgba(168, 170, 176, 0.12)"
            strokeWidth="0.35"
            transform="rotate(-38 72 74)"
          />
        </g>

        <circle cx="72" cy="74" r="22" fill={`url(#tpo-core-${uid})`} filter={`url(#tpo-blur-soft-${uid})`} opacity="0.38" />
        <circle cx="72" cy="74" r="21" fill={`url(#tpo-core-${uid})`} />
        <circle cx="72" cy="74" r="21" stroke="rgba(252, 252, 255, 0.26)" strokeWidth="0.55" />
        <path
          d="M60 62 C66 56, 78 58, 82 66 C86 74, 82 84, 72 86"
          stroke="rgba(252, 252, 255, 0.34)"
          strokeWidth="0.65"
          strokeLinecap="round"
        />
        <ellipse cx="64" cy="66" rx="5" ry="2.8" fill="rgba(252, 252, 255, 0.18)" transform="rotate(-16 64 66)" />

        <circle cx="128" cy="58" r="1.8" fill="rgba(236, 238, 244, 0.52)" className={styles.progressOrbitalSatellite} />
        <circle cx="38" cy="88" r="1.4" fill="rgba(196, 198, 204, 0.42)" className={styles.progressOrbitalSatelliteAlt} />
        <circle cx="104" cy="98" r="1.1" fill="rgba(214, 216, 222, 0.34)" />
        <circle cx="54" cy="48" r="1" fill="rgba(236, 238, 244, 0.3)" />
        <circle cx="118" cy="86" r="0.85" fill="rgba(168, 170, 176, 0.28)" />
        <circle cx="148" cy="72" r="0.7" fill="rgba(148, 150, 156, 0.22)" />
        <circle cx="162" cy="64" r="0.55" fill="rgba(196, 198, 204, 0.16)" />

        <path
          d="M12 52 C 38 32, 72 44, 108 28 S 168 18, 204 38"
          stroke="rgba(168, 170, 176, 0.11)"
          strokeWidth="0.4"
        />
        <path
          d="M6 104 C 34 84, 68 108, 102 90 S 158 78, 198 94"
          stroke="rgba(196, 198, 204, 0.08)"
          strokeWidth="0.36"
        />
        <line x1="28" y1="58" x2="52" y2="48" stroke="rgba(214, 216, 222, 0.12)" strokeWidth="0.32" />
        <line x1="112" y1="42" x2="138" y2="52" stroke="rgba(168, 170, 176, 0.1)" strokeWidth="0.3" />
        <line x1="68" y1="118" x2="92" y2="110" stroke="rgba(196, 198, 204, 0.07)" strokeWidth="0.28" />
      </svg>
    </div>
  );
}

function TheoryProgressRing({ percent, accent }: { percent: number; accent: string }) {
  const radius = 17;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className={styles.progressRingWrap} style={{ '--stage-accent': accent } as CSSProperties}>
      <svg className={styles.progressRing} viewBox="0 0 48 48" aria-hidden="true">
        <circle className={styles.progressRingTrackOuter} cx="24" cy="24" r="21" />
        <circle className={styles.progressRingTrack} cx="24" cy="24" r={radius} />
        <circle
          className={styles.progressRingFill}
          cx="24"
          cy="24"
          r={radius}
          stroke={accent}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
    </div>
  );
}

export function V1TheoryProgressHeader({
  percent,
  accent,
  stageTitle
}: {
  percent: number;
  accent: string;
  stageTitle: string;
  stageInstruction: string;
}) {
  return (
    <div className={styles.progressHeader}>
      <p className={styles.progressHeaderKicker}>Progresso da teoria</p>
      <div className={styles.progressHeaderCleanCard} style={{ '--stage-accent': accent } as CSSProperties}>
        <TheoryProgressRing percent={percent} accent={accent} />
        <div className={styles.progressHeaderCleanCopy}>
          <p className={styles.progressPercent}>{percent}%</p>
          <p className={styles.progressOverviewLabel}>{stageTitle}</p>
        </div>
      </div>
    </div>
  );
}

export function V1StageActionSection({
  stageCreation,
  actionLabel,
  onStageDragStart
}: {
  stageCreation: StageCreation;
  actionLabel?: string;
  onStageDragStart?: (event: DragEvent<HTMLElement>, stage: TdmStage) => void;
}) {
  const selectedStageTheme = stageCreation === 'ready-to-connect' ? null : getTdmStageTheme(stageCreation);
  const canUseStageActions = stageCreation !== 'ready-to-connect';
  const dragStage = stageCreation === 'ready-to-connect' ? undefined : stageCreation;

  return (
    <section
      className={[styles.card, styles.stageActionCard].join(' ')}
      style={
        selectedStageTheme
          ? ({
              '--stage-accent': selectedStageTheme.accent,
              '--stage-border': selectedStageTheme.border,
              '--stage-soft': selectedStageTheme.accentSoft
            } as CSSProperties)
          : undefined
      }
    >
      <p className={styles.sectionKicker}>Ações da etapa</p>
      {canUseStageActions && dragStage ? (
        <>
          <p className={styles.sectionText}>
            Crie um novo bloco arrastando esse card para o canvas e solte-o na posição desejada. Personalize o conteúdo
            clicando no card ou através do formulário logo abaixo.
          </p>
          <div className={styles.stageActionInnerPanel}>
            <button
              type="button"
              className={styles.dragCard}
              draggable
              onDragStart={(event) => onStageDragStart?.(event, dragStage)}
            >
              <span className={styles.dragIcon}>
                <StageDragIcon />
              </span>
              <span>
                <strong>{actionLabel ?? 'Adicionar bloco'}</strong>
                <small>Arraste, solte e crie.</small>
              </span>
            </button>
          </div>
        </>
      ) : (
        <div className={styles.stageActionInnerPanel}>
          <p className={styles.sectionHint}>Quando uma etapa estiver ativa, este bloco vira o facilitador para criar novos itens.</p>
        </div>
      )}
    </section>
  );
}
