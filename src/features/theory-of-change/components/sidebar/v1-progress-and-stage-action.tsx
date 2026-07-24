'use client';

import type { CSSProperties, DragEvent } from 'react';
import { TdmSectionIcon } from '../tdm-section-icon/tdm-section-icon';
import type { TdmStage } from '../../domain/tdm-stages';
import type { StageCreation } from '../../utils/stage-creation';
import styles from './tdm-sidebar.module.sass';
import { CANVAS_DS_STAGE } from './v1-preserved-sidebar-sections';

const STAGE_ACTION_PROMPTS: Record<StageCreation, string> = {
  input: 'Crie insumos.',
  activity: 'Crie atividades.',
  output: 'Crie produtos.',
  outcome: 'Crie resultados.',
  'ready-to-connect': 'Crie as conexões entre as etapas.'
};

function createProgressStyle(accent: string, percent: number) {
  return {
    '--stage-accent': accent,
    '--theory-progress': `${percent}%`
  } as CSSProperties;
}

function createStageActionStyle(stageCreation: StageCreation) {
  if (stageCreation === 'ready-to-connect') return undefined;
  const selectedStageTheme = CANVAS_DS_STAGE[stageCreation];
  return {
    '--stage-accent': selectedStageTheme.accent,
    '--stage-border': selectedStageTheme.border,
    '--stage-soft': selectedStageTheme.soft
  } as CSSProperties;
}

export function V1TheoryProgressHeader({
  percent,
  accent
}: {
  percent: number;
  accent: string;
  stageTitle: string;
  stageInstruction: string;
}) {
  return (
    <div className={styles.progressHeader} style={createProgressStyle(accent, percent)}>
      <div className={[styles.progressHeaderTitleRow, styles.blockFormGroupHeader].filter(Boolean).join(' ')}>
        <TdmSectionIcon variant="organization" />
        <p className={[styles.progressHeaderKicker, styles.blockFormGroupTitle].filter(Boolean).join(' ')}>
          ETAPAS DA TEORIA
        </p>
      </div>
      <p className={styles.progressCompactLine}>
        <span className={styles.progressCompactPercent}>{percent}% completo</span>
      </p>
      <div className={styles.theoryProgressTrack} aria-hidden="true">
        <span className={styles.theoryProgressFill} />
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
  const canUseStageActions = stageCreation !== 'ready-to-connect';
  const dragStage = stageCreation === 'ready-to-connect' ? undefined : stageCreation;
  const actionPrompt = STAGE_ACTION_PROMPTS[stageCreation];

  return (
    <section
      className={[styles.card, styles.stageActionCard].join(' ')}
      style={createStageActionStyle(stageCreation)}
    >
      <p className={styles.sectionKicker}>AGORA</p>
      <p className={styles.sectionText}>{actionPrompt}</p>
      {canUseStageActions && dragStage ? (
        <div className={styles.stageActionInnerPanel}>
          <button
            type="button"
            className={styles.dragCard}
            draggable
            aria-label={actionLabel ?? 'Adicionar bloco'}
            onDragStart={(event) => onStageDragStart?.(event, dragStage)}
          >
            <span className={styles.dragSheet} aria-hidden="true">
              <span className={styles.dragSheetShine} />
              <span className={styles.dragSheetLine} data-len="title" />
              <span className={styles.dragSheetLine} data-len="lg" />
              <span className={styles.dragSheetLine} data-len="md" />
              <span className={styles.dragSheetLine} data-len="sm" />
            </span>
          </button>
          <p className={styles.dragSheetLegend}>Clique, arraste e solte.</p>
        </div>
      ) : null}
    </section>
  );
}
