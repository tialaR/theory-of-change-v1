import { useMemo, useState, type CSSProperties, type RefObject } from 'react';
import { TdmButton } from '@/shared/ui/tdm-button/tdm-button';
import { TDM_STAGE_ORDER, type TdmStage } from '../../../domain/tdm-stages';
import type { StageCreation } from '../../../utils/stage-creation';
import { V1TheoryProgressHeader } from '../v1-progress-and-stage-action';
import { AdvanceArrowIcon, ConnectLogicIcon, TimelineChevron, TimelineLockIcon } from '../tdm-sidebar-primitives';
import { STAGE_ADVANCE_HINTS, STAGE_CREATION_HINTS, STAGE_GUIDE, STAGE_SINGULAR, THEORY_PROGRESS_ITEM_GOAL } from '../tdm-sidebar.contract';
import styles from '../tdm-sidebar.module.sass';

const STAGE_TONE: Record<TdmStage, { accent: string; border: string }> = {
  input: { accent: '#a78bfa', border: 'rgba(167, 139, 250, 0.34)' },
  activity: { accent: '#60a5fa', border: 'rgba(96, 165, 250, 0.34)' },
  output: { accent: '#f6b35d', border: 'rgba(246, 179, 93, 0.34)' },
  outcome: { accent: '#5ee0b5', border: 'rgba(94, 224, 181, 0.34)' }
};

function getStageStatus(stage: TdmStage, stageCreation: StageCreation, index: number) {
  if (stageCreation === 'ready-to-connect') return 'completed';
  const currentIndex = TDM_STAGE_ORDER.indexOf(stageCreation as TdmStage);
  if (index < currentIndex) return 'completed';
  if (index === currentIndex) return 'current';
  return 'blocked';
}

function getStageLockTooltip(stage: TdmStage) {
  const stageIndex = TDM_STAGE_ORDER.indexOf(stage);
  if (stageIndex <= 0) return 'Esta etapa será liberada após preencher a etapa anterior.';
  return `Conclua ao menos 1 ${STAGE_SINGULAR[TDM_STAGE_ORDER[stageIndex - 1]]} para desbloquear esta etapa.`;
}

function stripStageNumber(title: string) {
  return title.replace(/^\d+\.\s*/, '');
}

export function TdmSidebarProgress({
  stageCreation,
  stageCounts,
  advanceLabel,
  canAdvance,
  onAdvance,
  boundaryRef
}: {
  stageCreation: StageCreation;
  stageCounts: Record<TdmStage, number>;
  advanceLabel?: string;
  canAdvance?: boolean;
  onAdvance?: () => void;
  boundaryRef: RefObject<HTMLDivElement | null>;
}) {
  const [openStage, setOpenStage] = useState<TdmStage | 'ready-to-connect'>(stageCreation);
  const currentGuide = STAGE_CREATION_HINTS[stageCreation];
  const totalItems = useMemo(() => TDM_STAGE_ORDER.reduce((sum, stage) => sum + stageCounts[stage], 0), [stageCounts]);
  const percent = stageCreation === 'ready-to-connect' ? 100 : Math.min(100, Math.round((totalItems / THEORY_PROGRESS_ITEM_GOAL) * 100));
  const accent = stageCreation === 'ready-to-connect' ? 'rgba(232, 234, 240, 0.92)' : STAGE_TONE[stageCreation].accent;

  return (
    <section className={[styles.card, styles.progressCard].join(' ')} style={{ '--stage-accent': accent } as CSSProperties}>
      <V1TheoryProgressHeader percent={percent} accent={accent} stageTitle={currentGuide.title} stageInstruction={currentGuide.description} />
      <div className={styles.timeline} aria-label="Progresso da teoria">
        {TDM_STAGE_ORDER.map((stage, index) => {
          const guide = STAGE_GUIDE[stage];
          const tone = STAGE_TONE[stage];
          const status = getStageStatus(stage, stageCreation, index);
          const isCurrent = stageCreation !== 'ready-to-connect' && stageCreation === stage;
          const isExpanded = openStage === stage || isCurrent;
          return (
            <details
              key={stage}
              open={isExpanded}
              className={[styles.stageAccordion, styles[`stage${status}`] as string, index === 0 ? styles.stageFirst : '', isExpanded ? styles.stageExpanded : ''].filter(Boolean).join(' ')}
              style={{ '--stage-accent': tone.accent, '--stage-border': tone.border } as CSSProperties}
              onToggle={(event) => {
                if (event.currentTarget.open || isCurrent) setOpenStage(stage);
                else if (openStage === stage) setOpenStage(stageCreation);
              }}
            >
              <summary className={styles.stageSummary}>
                <span className={styles.stageColorBar} aria-hidden="true" />
                <span className={styles.stageProgressColumn} aria-hidden="true">
                  <span className={[styles.stageProgressSegment, styles.stageProgressSegmentTop, status !== 'blocked' ? styles.stageProgressSegmentLit : ''].filter(Boolean).join(' ')} />
                  <span className={styles.stageDot}>{status === 'completed' ? '✓' : index + 1}</span>
                  <span className={[styles.stageProgressSegment, styles.stageProgressSegmentBottom, status === 'completed' ? styles.stageProgressSegmentLit : ''].filter(Boolean).join(' ')} />
                </span>
                <span className={styles.stageSummaryCopy}><strong>{stripStageNumber(guide.title)}</strong><small>{guide.summary}</small></span>
                <span className={styles.stageCountBadge}>{stageCounts[stage]}</span>
                {status === 'blocked' ? <TimelineLockIcon tooltip={getStageLockTooltip(stage)} boundaryRef={boundaryRef} /> : null}
                <TimelineChevron isOpen={isExpanded} isActive={status === 'current' || isExpanded} isBlocked={status === 'blocked'} />
              </summary>
              <div className={styles.stageBody}><ul>{guide.examples.map((example) => <li key={example}>{example}</li>)}</ul></div>
            </details>
          );
        })}
        <details
          open={openStage === 'ready-to-connect' || stageCreation === 'ready-to-connect'}
          className={[styles.stageAccordion, styles.stageConnectLogic, styles[stageCreation === 'ready-to-connect' ? 'stagecurrent' : 'stageblocked'] as string, styles.stageLast, openStage === 'ready-to-connect' ? styles.stageExpanded : ''].filter(Boolean).join(' ')}
          style={{ '--stage-accent': 'rgba(232, 234, 240, 0.92)', '--stage-border': 'rgba(210, 214, 224, 0.28)' } as CSSProperties}
          onToggle={(event) => event.currentTarget.open && setOpenStage('ready-to-connect')}
        >
          <summary className={styles.stageSummary}>
            <span className={styles.stageColorBar} aria-hidden="true" />
            <span className={styles.stageProgressColumn} aria-hidden="true"><span className={[styles.stageProgressSegment, styles.stageProgressSegmentTop, stageCreation === 'ready-to-connect' ? styles.stageProgressSegmentLit : ''].filter(Boolean).join(' ')} /><span className={styles.stageDot}>5</span><span className={[styles.stageProgressSegment, styles.stageProgressSegmentBottom].join(' ')} /></span>
            <span className={styles.stageSummaryCopy}><strong>Conectar lógica</strong><small>Conecte etapas, riscos e hipóteses.</small></span>
            <span className={styles.stageConnectIcon} aria-hidden="true"><ConnectLogicIcon /></span>
            {stageCreation !== 'ready-to-connect' ? <TimelineLockIcon tooltip="Conclua ao menos 1 resultado para desbloquear esta etapa." boundaryRef={boundaryRef} /> : null}
            <TimelineChevron isOpen={openStage === 'ready-to-connect'} isActive={stageCreation === 'ready-to-connect' || openStage === 'ready-to-connect'} isBlocked={stageCreation !== 'ready-to-connect'} />
          </summary>
          <div className={styles.stageBody}><p>{STAGE_CREATION_HINTS['ready-to-connect'].help}</p></div>
        </details>
      </div>
      <TdmButton variant="primary" tone="neutral" fullWidth className={styles.workflowAdvanceButton} disabled={!canAdvance} onClick={onAdvance} icon={<AdvanceArrowIcon />} iconPosition="right">
        {advanceLabel ?? 'Avançar para próxima etapa'}
      </TdmButton>
      {!canAdvance && stageCreation !== 'ready-to-connect' ? <p className={styles.contextualHint} style={{ '--stage-accent': accent } as CSSProperties}><span className={styles.contextualHintIcon} aria-hidden="true">ⓘ</span>{STAGE_ADVANCE_HINTS[stageCreation]}</p> : null}
    </section>
  );
}
