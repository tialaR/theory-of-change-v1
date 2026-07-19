'use client';

import {
  memo,
  useCallback,
  useId,
  useMemo,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent
} from 'react';
import { Panel } from '@xyflow/react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { TdmButton } from '@/shared/ui/tdm-button/tdm-button';
import { TdmIconButton } from '@/shared/ui/tdm-icon-button/tdm-icon-button';
import { TdmAnchoredTooltip } from '@/shared/ui/tooltip/tdm-anchored-tooltip';
import { TDM_STAGE_LABELS, TDM_STAGE_ORDER, type TdmStage } from '../../../domain/tdm-stages';
import { TDM_STAGE_THEME, TDM_THEORY_NEUTRAL } from '../../../domain/tdm-theme';
import {
  type TheoryGuideContent,
  type TheoryGuideStageId
} from '../../../domain/tdm-theory-guide';
import styles from './tdm-canvas-process-dock.module.sass';

export type TdmCanvasProcessDockContent = TheoryGuideContent;

type StageRowStatus = 'complete' | 'current' | 'pending';

type StageRow = {
  id: string;
  label: string;
  value: string;
  accent: string;
  status: StageRowStatus;
};

type TdmCanvasProcessDockProps = {
  content: TdmCanvasProcessDockContent;
  stageCounts: Record<TdmStage, number>;
  isTheoryComplete?: boolean;
  isExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  onViewResult?: () => void;
};

const TOTAL_STEPS = 5;
const SILVER_ACCENT = TDM_THEORY_NEUTRAL.accent;

/** Plural labels for closed-dock tooltip. Singular stays on canvas cards / row labels. */
const STAGE_PLURAL_LABELS: Record<TdmStage, string> = {
  input: 'Insumos',
  activity: 'Atividades',
  output: 'Produtos',
  outcome: 'Resultados'
};

function getStageDisplayLabel(stage: TheoryGuideStageId): string {
  if (stage === 'connect' || stage === 'review') {
    return 'Conexões';
  }

  if (stage === 'visualize') {
    return 'Visualizar';
  }

  if (stage === 'theory') {
    return 'Teoria';
  }

  return STAGE_PLURAL_LABELS[stage] ?? 'Teoria';
}

function getActiveStageAccent(stage: TheoryGuideStageId): string {
  if (stage === 'input' || stage === 'activity' || stage === 'output' || stage === 'outcome') {
    return TDM_STAGE_THEME[stage].accent;
  }

  return SILVER_ACCENT;
}

function isConnectionsStage(stage: TheoryGuideStageId): boolean {
  return stage === 'connect' || stage === 'review' || stage === 'visualize';
}

function ProcessGlyph() {
  return (
    <svg viewBox="0 0 16 16" className={styles.icon} aria-hidden="true">
      <path
        d="M4 3.75h8a1 1 0 0 1 1 1v8.5L8 11.25 3 13.25V4.75a1 1 0 0 1 1-1Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.55"
        strokeLinejoin="round"
      />
      <path
        d="M6.25 6.5h3.5M6.25 8.75h2.25"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.55"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseGlyph() {
  return (
    <svg viewBox="0 0 16 16" className={styles.closeIcon} aria-hidden="true">
      <path
        d="M4.5 4.5 11.5 11.5M11.5 4.5 4.5 11.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TdmCanvasProcessDockComponent({
  content,
  stageCounts,
  isTheoryComplete = false,
  isExpanded: isExpandedProp,
  onExpandedChange,
  onViewResult
}: TdmCanvasProcessDockProps) {
  const panelId = useId();
  const prefersReducedMotion = useReducedMotion();
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = isExpandedProp ?? internalOpen;

  const currentStageLabel = getStageDisplayLabel(content.activeStage);
  const stageAccent = getActiveStageAccent(content.activeStage);

  const completedSteps = useMemo(() => {
    const stageDone = TDM_STAGE_ORDER.reduce(
      (total, stage) => total + (stageCounts[stage] > 0 ? 1 : 0),
      0
    );
    return stageDone + (isTheoryComplete ? 1 : 0);
  }, [isTheoryComplete, stageCounts]);

  const stageRows = useMemo<StageRow[]>(() => {
    const rows: StageRow[] = TDM_STAGE_ORDER.map((stage) => {
      const count = stageCounts[stage];
      const isCurrent = content.activeStage === stage;

      return {
        id: stage,
        label: TDM_STAGE_LABELS[stage],
        value: String(count),
        accent: TDM_STAGE_THEME[stage].accent,
        status: isCurrent ? 'current' : count > 0 ? 'complete' : 'pending'
      };
    });

    const connectionsCurrent = isConnectionsStage(content.activeStage);
    rows.push({
      id: 'connections',
      label: 'Conexões',
      value: isTheoryComplete ? '✓' : '—',
      accent: SILVER_ACCENT,
      status: isTheoryComplete
        ? connectionsCurrent
          ? 'current'
          : 'complete'
        : connectionsCurrent
          ? 'current'
          : 'pending'
    });

    return rows;
  }, [content.activeStage, isTheoryComplete, stageCounts]);

  const setOpen = useCallback(
    (nextOpen: boolean) => {
      if (onExpandedChange) {
        onExpandedChange(nextOpen);
      } else {
        setInternalOpen(nextOpen);
      }
    },
    [onExpandedChange]
  );

  const handleToggle = useCallback(() => {
    setOpen(!isOpen);
  }, [isOpen, setOpen]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const handleViewResult = useCallback(() => {
    onViewResult?.();
  }, [onViewResult]);

  const handleShellPointerDown = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    event.stopPropagation();
  }, []);

  const handleTriggerKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        event.stopPropagation();
        handleToggle();
      }
    },
    [handleToggle]
  );

  const layoutTransition = prefersReducedMotion
    ? { duration: 0 }
    : {
        type: 'spring' as const,
        stiffness: 420,
        damping: 34,
        mass: 0.72
      };

  const contentTransition = prefersReducedMotion
    ? { duration: 0.08 }
    : { duration: 0.16, ease: [0.22, 1, 0.36, 1] as const };

  const shellStyle = {
    borderRadius: isOpen ? '1rem' : '0.5rem',
    '--stage-accent': stageAccent
  } as CSSProperties;

  const handleShellWheel = useCallback((event: WheelEvent<HTMLElement>) => {
    event.stopPropagation();
  }, []);

  const closedTrigger = (
    <motion.button
      type="button"
      layout
      layoutId="tdm-canvas-process-dock-shell"
      id={panelId}
      className={[styles.shell, styles.shellClosed, styles.trigger, 'nodrag', 'nopan', 'nowheel'].join(' ')}
      style={shellStyle}
      transition={{ layout: layoutTransition }}
      aria-expanded={false}
      aria-controls={panelId}
      aria-label={`Abrir progresso da teoria. Etapa atual: ${currentStageLabel}.`}
      whileHover={
        prefersReducedMotion
          ? undefined
          : {
              y: -1,
              transition: { duration: 0.14, ease: [0.22, 1, 0.36, 1] }
            }
      }
      whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
      onClick={handleToggle}
      onKeyDown={handleTriggerKeyDown}
      onPointerDown={handleShellPointerDown}
      onWheel={handleShellWheel}
    >
      <ProcessGlyph />
      <span
        className={styles.stageDot}
        style={{ '--stage-accent': stageAccent } as CSSProperties}
        aria-hidden="true"
      />
    </motion.button>
  );

  return (
    <Panel position="top-left" className={styles.panel}>
      <AnimatePresence initial={false} mode="popLayout">
        {isOpen ? (
          <motion.section
            key="expanded-shell"
            layout
            layoutId="tdm-canvas-process-dock-shell"
            id={panelId}
            className={[styles.shell, styles.shellOpen, 'nodrag', 'nopan', 'nowheel'].join(' ')}
            style={shellStyle}
            transition={{ layout: layoutTransition }}
            onPointerDown={handleShellPointerDown}
            onWheel={handleShellWheel}
          >
            <motion.div
              className={styles.expanded}
              layout="position"
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
              animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -3 }}
              transition={contentTransition}
            >
              <motion.header className={styles.header} layout="position">
                <TdmIconButton
                  aria-label="Fechar progresso da teoria"
                  aria-expanded={true}
                  aria-controls={panelId}
                  variant="ghost"
                  size="sm"
                  className={styles.headerIconButton}
                  onClick={handleClose}
                >
                  <ProcessGlyph />
                </TdmIconButton>
                <h2 className={styles.title}>Teoria da mudança</h2>
                <TdmIconButton
                  aria-label="Fechar progresso da teoria"
                  variant="ghost"
                  size="sm"
                  className={styles.closeButton}
                  onClick={handleClose}
                >
                  <CloseGlyph />
                </TdmIconButton>
              </motion.header>

              <motion.div className={styles.summary} layout="position">
                <p className={styles.summaryCount}>
                  {completedSteps} de {TOTAL_STEPS} etapas concluídas
                </p>
                {content.nextStageLabel ? (
                  <p className={styles.nextLine}>
                    <span className={styles.nextPrefix}>Próxima</span>
                    <span className={styles.nextValue}>{content.nextStageLabel}</span>
                  </p>
                ) : null}
              </motion.div>

              <motion.div className={styles.progressTrack} aria-hidden="true" layout="position">
                {stageRows.map((row) => (
                  <span
                    key={row.id}
                    className={[
                      styles.progressSegment,
                      row.status === 'complete' ? styles.progressComplete : '',
                      row.status === 'current' ? styles.progressCurrent : '',
                      row.status === 'pending' ? styles.progressPending : ''
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    style={{ '--segment-accent': row.accent } as CSSProperties}
                  />
                ))}
              </motion.div>

              <ul className={styles.stageList} aria-label="Progresso por etapa">
                {stageRows.map((row) => (
                  <motion.li key={row.id} className={styles.stageRow} layout="position">
                    <span
                      className={styles.rowDot}
                      style={{ '--row-accent': row.accent } as CSSProperties}
                      aria-hidden="true"
                    />
                    <span className={styles.rowLabel}>{row.label}</span>
                    <span className={styles.rowValue}>{row.value}</span>
                  </motion.li>
                ))}
              </ul>

              {onViewResult ? (
                <TdmButton
                  variant="tertiary"
                  className={styles.viewAction}
                  disabled={!isTheoryComplete}
                  trailingIcon={<span aria-hidden="true">→</span>}
                  onClick={handleViewResult}
                >
                  Visualizar teoria
                </TdmButton>
              ) : null}
            </motion.div>
          </motion.section>
        ) : (
          <div key="compact" className={styles.compactHost}>
            <TdmAnchoredTooltip content={currentStageLabel} preferredPlacements={['bottom', 'right']}>
              {closedTrigger}
            </TdmAnchoredTooltip>
          </div>
        )}
      </AnimatePresence>
    </Panel>
  );
}

export const TdmCanvasProcessDock = memo(TdmCanvasProcessDockComponent);
