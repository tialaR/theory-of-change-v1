'use client';

import { useMemo, useState, type CSSProperties, type DragEvent } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { TdmButton } from '@/shared/ui/tdm-button/tdm-button';
import buttonStyles from '@/shared/ui/tdm-button/tdm-button.module.sass';
import { TdmSectionIcon } from '../tdm-section-icon/tdm-section-icon';
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
  const contentId = `${id}-content`;

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
      {isOpen ? (
        <div id={contentId} className={styles.canvasOrganizationContent}>
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
        </div>
      ) : null}
    </section>
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
