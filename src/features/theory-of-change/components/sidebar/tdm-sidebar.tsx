'use client';

import { useId, useMemo, useState, type CSSProperties, type DragEvent, type PointerEvent, type ReactNode } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Surface } from '@/shared/ui/surface/surface';
import type { TdmNodeDraft } from '../../domain/tdm-types';
import { TDM_STAGE_ORDER, type TdmStage } from '../../domain/tdm-stages';
import { getTdmStageTheme } from '../../domain/tdm-theme';
import type { StageCreation } from '../../utils/stage-creation';
import styles from './tdm-sidebar.module.sass';

export type ExportFormat = 'pdf' | 'png' | 'jpeg' | 'svg';

export type TdmSidebarContext =
  | { kind: 'none' }
  | {
      kind: 'edge';
      edge: {
        sourceLabel: string;
        targetLabel: string;
        message: string;
        markerType?: 'risk' | 'hypothesis';
        markerText?: string;
        canAddRisk: boolean;
        canAddHypothesis: boolean;
      };
      onAddRisk: () => void;
      onAddHypothesis: () => void;
      onDelete: () => void;
    }
  | {
      kind: 'marker';
      marker: {
        sourceLabel: string;
        targetLabel: string;
        markerText: string;
      };
      onDraftChange: (nextValue: string) => void;
      onSubmit: () => void;
      onDelete: () => void;
    };

export type TdmBlockForms = {
  stage: TdmStage;
  create: {
    draft: TdmNodeDraft;
    errorMessage?: string;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onDraftChange: (nextDraft: TdmNodeDraft) => void;
    onSubmit: () => void;
  };
  edit: {
    draft: TdmNodeDraft;
    errorMessage?: string;
    isOpen: boolean;
    selectedStage: TdmStage | null;
    onOpenChange: (open: boolean) => void;
    onDraftChange: (nextDraft: TdmNodeDraft) => void;
    onSubmit: () => void;
    onDuplicate: () => void;
    onDelete: () => void;
  };
};

const STAGE_GUIDE: Record<
  TdmStage,
  {
    title: string;
    summary: string;
    technical: string;
    examples: string[];
  }
> = {
  input: {
    title: '1. Insumos',
    summary: 'Recursos necessários para a política acontecer.',
    technical:
      'Insumos são recursos, capacidades e condições de partida. Eles não são ações. São aquilo que permite que as atividades aconteçam.',
    examples: ['equipe técnica', 'orçamento', 'dados educacionais', 'materiais', 'tecnologia', 'parcerias']
  },
  activity: {
    title: '2. Atividades',
    summary: 'Ações realizadas com os insumos.',
    technical:
      'Atividades são o que a política faz com os recursos disponíveis. Normalmente começam com verbos de ação, como formar, acompanhar, aplicar, distribuir ou monitorar.',
    examples: ['formar professores', 'aplicar diagnóstico', 'acompanhar escolas', 'distribuir materiais', 'monitorar frequência']
  },
  output: {
    title: '3. Produtos',
    summary: 'Entregas concretas geradas pelas atividades.',
    technical:
      'Produtos são entregas observáveis e contáveis. Eles mostram o que foi produzido diretamente pelas atividades, antes de medir mudança.',
    examples: ['oficinas realizadas', 'relatórios emitidos', 'planos validados', 'materiais entregues', 'estudantes atendidos']
  },
  outcome: {
    title: '4. Resultados',
    summary: 'Mudanças esperadas após as entregas.',
    technical:
      'Resultados são mudanças em comportamento, prática, capacidade ou condição. Eles mostram o que deve melhorar depois que produtos foram entregues.',
    examples: ['escolas acompanham melhor estudantes', 'professores usam dados', 'estudantes frequentam mais aulas', 'gestão toma decisões mais rápidas']
  }
};

const STAGE_CREATION_HINTS: Record<StageCreation, { title: string; description: string; help: string }> = {
  input: {
    title: '1. Insumos',
    description: 'Liste os recursos que tornam a política possível.',
    help: 'Pense em equipe, orçamento, dados, materiais, tecnologia, parcerias ou tempo disponível.'
  },
  activity: {
    title: '2. Atividades',
    description: 'Descreva o que será feito usando esses recursos.',
    help: 'Use verbos de ação: formar, acompanhar, distribuir, aplicar, monitorar, orientar.'
  },
  output: {
    title: '3. Produtos',
    description: 'Registre as entregas concretas geradas pelas atividades.',
    help: 'Produtos são coisas que podem ser contadas: oficinas realizadas, relatórios emitidos, materiais entregues.'
  },
  outcome: {
    title: '4. Resultados',
    description: 'Descreva a mudança esperada depois das entregas.',
    help: 'Resultados mostram o que muda no público, na prática ou na gestão.'
  },
  'ready-to-connect': {
    title: '5. Conectar a lógica',
    description: 'Agora conecte os blocos da esquerda para a direita para mostrar como a mudança acontece.',
    help: 'Ligue insumos com atividades, atividades com produtos e produtos com resultados.'
  }
};

const STAGE_CREATE_LABELS: Record<TdmStage, string> = {
  input: 'Criar novo insumo',
  activity: 'Criar nova atividade',
  output: 'Criar novo produto',
  outcome: 'Criar novo resultado'
};

const STAGE_EDIT_LABELS: Record<TdmStage, string> = {
  input: 'Editar insumo selecionado',
  activity: 'Editar atividade selecionada',
  output: 'Editar produto selecionado',
  outcome: 'Editar resultado selecionado'
};

const FIELD_PLACEHOLDERS = {
  title: 'Nome do bloco',
  description: 'Descreva rapidamente este bloco.',
  advancedDetails: 'Detalhes complementares do bloco.',
  shortNotes: 'Notas de apoio para leitura rápida.'
} as const;

const FIELD_CLEAR_LABELS: Record<keyof TdmNodeDraft, string> = {
  title: 'Limpar título',
  description: 'Limpar descrição breve',
  advancedDetails: 'Limpar detalhes avançados',
  shortNotes: 'Limpar notas curtas'
};

export function SidebarToggleIcon({
  direction,
  className
}: {
  direction: 'left' | 'right';
  className?: string;
}) {
  const gradientId = `sidebarToggleGradient-${direction}`;

  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      className={[styles.sidebarToggleSvg, className].filter(Boolean).join(' ')}
      fill="none"
    >
      <rect
        x="4"
        y="4"
        width="56"
        height="56"
        rx="16"
        fill={`url(#${gradientId})`}
        stroke="rgba(196, 181, 253, 0.22)"
        strokeWidth="1.5"
      />
      {direction === 'right' ? (
        <>
          <path d="M38 4V60" stroke="rgba(255,255,255,0.18)" strokeWidth="3" />
          <path
            d="M27 22L37 32L27 42"
            stroke="rgba(255,255,255,0.92)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      ) : (
        <>
          <path d="M22 4V60" stroke="rgba(255,255,255,0.18)" strokeWidth="3" />
          <path
            d="M38 22L28 32L38 42"
            stroke="rgba(255,255,255,0.92)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
      <defs>
        <linearGradient id={gradientId} x1="32" y1="4" x2="32" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2a2638" />
          <stop offset="1" stopColor="#151821" />
        </linearGradient>
      </defs>
    </svg>
  );
}

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

function AccordionChevron({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className={[styles.sidebarAccordionChevron, isOpen ? styles.sidebarAccordionChevronOpen : ''].join(' ')}
    >
      <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ClearFieldButton({ ariaLabel, onClear }: { ariaLabel: string; onClear: () => void }) {
  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <button
      type="button"
      className={styles.clearFieldButton}
      aria-label={ariaLabel}
      onPointerDown={handlePointerDown}
      onClick={(event) => {
        event.stopPropagation();
        onClear();
      }}
    >
      <svg aria-hidden="true" viewBox="0 0 12 12">
        <path d="M3 3l6 6M9 3 3 9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </button>
  );
}

function DuplicateIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className={styles.actionButtonIcon}>
      <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.35" />
      <path d="M10.5 5.5V4a1.5 1.5 0 0 0-1.5-1.5H4A1.5 1.5 0 0 0 2.5 4v5A1.5 1.5 0 0 0 4 10.5h1.5" fill="none" stroke="currentColor" strokeWidth="1.35" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className={styles.actionButtonIcon}>
      <path d="M3.5 4.5h9M6 4.5V3.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1M6.5 7v4M9.5 7v4" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
      <path d="M4.5 4.5l.5 7.5a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1l.5-7.5" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ColumnsAlignIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={styles.canvasOrganizationButtonIcon} fill="none">
      <rect x="6" y="5" width="20" height="22" rx="6" stroke="currentColor" strokeWidth="2.2" />
      <path d="M12 10V22" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M16 10V22" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M20 10V22" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

const PREVIEW_MAX_BLOCKS = 5;

const STAGE_PREVIEW_CLASS: Record<TdmStage, string> = {
  input: styles.previewInput,
  activity: styles.previewActivity,
  output: styles.previewOutput,
  outcome: styles.previewOutcome
};

const PREMIUM_EASE = [0.22, 1, 0.36, 1] as const;

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

  const containerTransition = shouldReduceMotion
    ? { duration: 0.01 }
    : { duration: 0.24, ease: PREMIUM_EASE };

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
                          : { y: -1, scale: 1.03, boxShadow: `0 0.4rem 0.85rem color-mix(in srgb, ${column.theme.accent} 28%, transparent)` }
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

function CanvasOrganizationAccordion({
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
        <span className={styles.canvasOrganizationTitle}>Organização do canvas</span>
        <AccordionChevron isOpen={isOpen} />
      </button>
      {isOpen ? (
        <div id={contentId} className={styles.canvasOrganizationContent}>
          <p className={styles.canvasOrganizationText}>
            Organize o canvas automaticamente. Alinhe os blocos por etapa para visualizar a teoria com mais clareza.
          </p>
          <CanvasAlignmentPreview stageCounts={stageCounts} />
          <button
            type="button"
            className={styles.canvasOrganizationButton}
            aria-label="Centralizar colunas do canvas"
            onClick={() => onOrganize?.()}
          >
            <ColumnsAlignIcon />
            <span>Centralizar colunas</span>
          </button>
        </div>
      ) : null}
    </section>
  );
}

function SidebarAccordion({
  id,
  title,
  isOpen,
  onToggle,
  stage,
  children
}: {
  id: string;
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  stage: TdmStage;
  children: ReactNode;
}) {
  const theme = getTdmStageTheme(stage);
  const contentId = `${id}-content`;

  return (
    <div
      className={styles.sidebarAccordion}
      style={
        {
          '--stage-accent': theme.accent,
          '--stage-accent-soft': theme.accentSoft,
          '--stage-border': theme.border
        } as CSSProperties
      }
    >
      <button
        type="button"
        className={styles.sidebarAccordionHeader}
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={onToggle}
      >
        <span className={styles.sidebarAccordionTitle}>{title}</span>
        <AccordionChevron isOpen={isOpen} />
      </button>
      <div
        id={contentId}
        className={[styles.sidebarAccordionPanel, isOpen ? styles.sidebarAccordionPanelOpen : ''].join(' ')}
        aria-hidden={!isOpen}
      >
        <div className={styles.sidebarAccordionContent}>{children}</div>
      </div>
    </div>
  );
}

function BlockFormFields({
  draft,
  onDraftChange
}: {
  draft: TdmNodeDraft;
  onDraftChange: (nextDraft: TdmNodeDraft) => void;
}) {
  const updateField = (field: keyof TdmNodeDraft, value: string) => {
    onDraftChange({ ...draft, [field]: value });
  };

  const clearField = (field: keyof TdmNodeDraft) => {
    onDraftChange({ ...draft, [field]: '' });
  };

  return (
    <>
      <label className={styles.field}>
        <span>Título</span>
        <div className={styles.fieldControl}>
          <input
            type="text"
            value={draft.title}
            placeholder={FIELD_PLACEHOLDERS.title}
            onChange={(event) => updateField('title', event.target.value)}
          />
          {draft.title ? <ClearFieldButton ariaLabel={FIELD_CLEAR_LABELS.title} onClear={() => clearField('title')} /> : null}
        </div>
      </label>
      <label className={styles.field}>
        <span>Descrição breve</span>
        <div className={styles.fieldControl}>
          <textarea
            rows={3}
            value={draft.description}
            placeholder={FIELD_PLACEHOLDERS.description}
            onChange={(event) => updateField('description', event.target.value)}
          />
          {draft.description ? (
            <ClearFieldButton ariaLabel={FIELD_CLEAR_LABELS.description} onClear={() => clearField('description')} />
          ) : null}
        </div>
      </label>
      <label className={styles.field}>
        <span>Detalhes avançados</span>
        <div className={styles.fieldControl}>
          <textarea
            rows={3}
            value={draft.advancedDetails}
            placeholder={FIELD_PLACEHOLDERS.advancedDetails}
            onChange={(event) => updateField('advancedDetails', event.target.value)}
          />
          {draft.advancedDetails ? (
            <ClearFieldButton ariaLabel={FIELD_CLEAR_LABELS.advancedDetails} onClear={() => clearField('advancedDetails')} />
          ) : null}
        </div>
      </label>
      <label className={styles.field}>
        <span>Notas curtas</span>
        <div className={styles.fieldControl}>
          <input
            type="text"
            value={draft.shortNotes}
            placeholder={FIELD_PLACEHOLDERS.shortNotes}
            onChange={(event) => updateField('shortNotes', event.target.value)}
          />
          {draft.shortNotes ? (
            <ClearFieldButton ariaLabel={FIELD_CLEAR_LABELS.shortNotes} onClear={() => clearField('shortNotes')} />
          ) : null}
        </div>
      </label>
    </>
  );
}

function CreateBlockForm({
  stage,
  draft,
  errorMessage,
  onDraftChange,
  onSubmit
}: {
  stage: TdmStage;
  draft: TdmNodeDraft;
  errorMessage?: string;
  onDraftChange: (nextDraft: TdmNodeDraft) => void;
  onSubmit: () => void;
}) {
  return (
    <div className={styles.sidebarForm}>
      {errorMessage ? <p className={styles.errorMessage}>{errorMessage}</p> : null}
      <BlockFormFields draft={draft} onDraftChange={onDraftChange} />
      <button type="button" className={styles.primaryStageButton} onClick={onSubmit}>
        {STAGE_CREATE_LABELS[stage]}
      </button>
    </div>
  );
}

function EditBlockForm({
  draft,
  errorMessage,
  hasSelection,
  onDraftChange,
  onSubmit,
  onDuplicate,
  onDelete
}: {
  draft: TdmNodeDraft;
  errorMessage?: string;
  hasSelection: boolean;
  onDraftChange: (nextDraft: TdmNodeDraft) => void;
  onSubmit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  return (
    <div className={styles.sidebarForm}>
      {!hasSelection ? (
        <p className={styles.sectionHint}>Selecione um bloco no canvas para editar.</p>
      ) : (
        <>
          {errorMessage ? <p className={styles.errorMessage}>{errorMessage}</p> : null}
          <BlockFormFields draft={draft} onDraftChange={onDraftChange} />
          <button type="button" className={styles.primaryStageButton} onClick={onSubmit}>
            Salvar alterações
          </button>
          <div className={styles.editSecondaryActions}>
            <button type="button" className={styles.secondaryActionButton} onClick={onDuplicate}>
              <span>Duplicar</span>
              <DuplicateIcon />
            </button>
            <button type="button" className={styles.dangerActionButton} onClick={onDelete}>
              <span>Deletar</span>
              <TrashIcon />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function getStageStatus(stage: TdmStage, stageCreation: StageCreation, index: number) {
  if (stageCreation === 'ready-to-connect') return 'completed';
  const currentIndex = TDM_STAGE_ORDER.indexOf(stageCreation as TdmStage);
  if (index < currentIndex) return 'completed';
  if (index === currentIndex) return 'current';
  return 'blocked';
}

export function TdmSidebar({
  isOpen,
  onToggle,
  theoryName,
  onTheoryNameChange,
  stageCreation,
  stageCounts,
  insightMessage,
  actionLabel,
  onOrganize,
  advanceLabel,
  onAdvance,
  canAdvance,
  canViewTdmResult,
  resultAvailabilityMessage,
  onLoadExample,
  onPreviewExample,
  canRestoreTheory,
  onRestoreTheory,
  onViewResult,
  context,
  blockForms,
  onStageDragStart
}: {
  isOpen: boolean;
  onToggle: () => void;
  theoryName: string;
  onTheoryNameChange: (nextValue: string) => void;
  stageCreation: StageCreation;
  stageCounts: Record<TdmStage, number>;
  insightMessage?: string;
  actionLabel?: string;
  onOrganize?: () => void;
  advanceLabel?: string;
  onAdvance?: () => void;
  canAdvance?: boolean;
  canViewTdmResult: boolean;
  resultAvailabilityMessage: string;
  onLoadExample: () => void;
  onPreviewExample: () => void;
  canRestoreTheory: boolean;
  onRestoreTheory: () => void;
  onViewResult: () => void;
  context: TdmSidebarContext;
  blockForms?: TdmBlockForms | null;
  onStageDragStart?: (event: DragEvent<HTMLElement>, stage: TdmStage) => void;
}) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [draftName, setDraftName] = useState(theoryName);
  const [openStage, setOpenStage] = useState<TdmStage>(stageCreation === 'ready-to-connect' ? 'outcome' : stageCreation);
  const createAccordionId = useId();
  const editAccordionId = useId();
  const canvasOrganizationAccordionId = useId();

  const commitTheoryName = () => {
    const nextName = draftName.trim() || theoryName;
    if (nextName !== theoryName) onTheoryNameChange(nextName);
    setIsEditingName(false);
  };

  const cancelTheoryName = () => {
    setDraftName(theoryName);
    setIsEditingName(false);
  };

  const currentGuide = STAGE_CREATION_HINTS[stageCreation];
  const selectedStageTheme = stageCreation === 'ready-to-connect' ? null : getTdmStageTheme(stageCreation);
  const canUseStageActions = stageCreation !== 'ready-to-connect';
  const dragStage = stageCreation === 'ready-to-connect' ? undefined : stageCreation;

  const handleCreateAccordionToggle = () => {
    if (!blockForms) return;
    const nextOpen = !blockForms.create.isOpen;
    blockForms.create.onOpenChange(nextOpen);
  };

  const handleEditAccordionToggle = () => {
    if (!blockForms) return;
    const nextOpen = !blockForms.edit.isOpen;
    blockForms.edit.onOpenChange(nextOpen);
  };

  const editStage = blockForms?.edit.selectedStage ?? blockForms?.stage ?? 'input';
  const editAccordionTitle = STAGE_EDIT_LABELS[editStage];

  return (
    <aside className={[styles.sidebar, isOpen ? styles.open : styles.closed].join(' ')}>
      <Surface className={styles.surface}>
        <header className={styles.header}>
          <div className={styles.headerCopy}>
            <p className={styles.kicker}>Teoria da mudança</p>
            <div className={styles.titleRow}>
              {isEditingName ? (
                <input
                  aria-label="Nome da teoria"
                  className={styles.titleInput}
                  type="text"
                  value={draftName}
                  placeholder="Nova teoria da mudança"
                  onChange={(event) => setDraftName(event.target.value)}
                  onBlur={commitTheoryName}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      commitTheoryName();
                    }
                    if (event.key === 'Escape') {
                      event.preventDefault();
                      cancelTheoryName();
                    }
                  }}
                  autoFocus
                />
              ) : (
                <button
                  type="button"
                  className={styles.titleButton}
                  onClick={() => {
                    setDraftName(theoryName);
                    setIsEditingName(true);
                  }}
                  aria-label="Editar nome da teoria"
                  title="Editar nome da teoria"
                >
                  <h2 className={styles.title}>{theoryName}</h2>
                  <span className={styles.titleAction}>Editar nome</span>
                </button>
              )}
            </div>
            <p className={styles.headerDescription}>Construa a cadeia em ordem e conecte os blocos quando a base estiver pronta.</p>
          </div>
        </header>

        <div className={styles.content}>
          <section className={[styles.card, styles.progressCard].join(' ')}>
            <p className={styles.sectionKicker}>Progresso da teoria</p>
            <h3 className={styles.sectionTitle}>{currentGuide.title}</h3>
            <p className={styles.sectionText}>{currentGuide.description}</p>
            <div className={styles.timeline} aria-label="Progresso da teoria">
              {TDM_STAGE_ORDER.map((stage, index) => {
                const guide = STAGE_GUIDE[stage];
                const theme = getTdmStageTheme(stage);
                const status = getStageStatus(stage, stageCreation, index);

                return (
                  <details
                    key={stage}
                    open={openStage === stage || stageCreation === stage}
                    className={[styles.stageAccordion, styles[`stage${status}`] as string].join(' ')}
                    style={
                      {
                        '--stage-accent': theme.accent,
                        '--stage-border': theme.border
                      } as CSSProperties
                    }
                    onToggle={(event) => {
                      if (event.currentTarget.open) setOpenStage(stage);
                    }}
                  >
                    <summary className={styles.stageSummary}>
                      <span className={styles.stageDot}>{status === 'completed' ? '✓' : index + 1}</span>
                      <span>
                        <strong>{guide.title}</strong>
                        <small>{guide.summary}</small>
                      </span>
                      <span className={styles.stageCount}>{stageCounts[stage]}</span>
                    </summary>
                    <div className={styles.stageBody}>
                      <p>{guide.technical}</p>
                      <ul>
                        {guide.examples.map((example) => (
                          <li key={example}>{example}</li>
                        ))}
                      </ul>
                    </div>
                  </details>
                );
              })}
            </div>
            <button type="button" className={styles.primaryAction} disabled={!canAdvance} onClick={onAdvance}>
              {advanceLabel ?? 'Avançar para próxima etapa'}
            </button>
            {!canAdvance ? <p className={styles.sectionHint}>A etapa atual precisa de pelo menos 1 bloco para avançar.</p> : null}
          </section>

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
                <p className={styles.sectionText}>Crie um novo bloco da etapa atual. Arraste este card para o canvas e solte-o na posição desejada. Personalize o conteúdo clicando no botão de editar do card ou através do formulário editar na sidebar.</p>
                <button
                  type="button"
                  className={styles.dragCard}
                  draggable
                  onDragStart={(event) => onStageDragStart?.(event, dragStage)}
                >
                  <span className={styles.dragIcon}><StageDragIcon /></span>
                  <span>
                    <strong>{actionLabel ?? 'Adicionar bloco'}</strong>
                    <small>Arraste, solte para criar este bloco.</small>
                  </span>
                </button>
              </>
            ) : (
              <p className={styles.sectionHint}>Quando uma etapa estiver ativa, este bloco vira o facilitador para criar novos itens.</p>
            )}
          </section>

          <CanvasOrganizationAccordion
            id={canvasOrganizationAccordionId}
            stageCounts={stageCounts}
            onOrganize={onOrganize}
          />

          {blockForms ? (
            <section className={[styles.card, styles.blockFormsCard].join(' ')}>
              <SidebarAccordion
                id={createAccordionId}
                title={STAGE_CREATE_LABELS[blockForms.stage]}
                isOpen={blockForms.create.isOpen}
                onToggle={handleCreateAccordionToggle}
                stage={blockForms.stage}
              >
                <CreateBlockForm
                  stage={blockForms.stage}
                  draft={blockForms.create.draft}
                  errorMessage={blockForms.create.errorMessage}
                  onDraftChange={blockForms.create.onDraftChange}
                  onSubmit={blockForms.create.onSubmit}
                />
              </SidebarAccordion>

              <SidebarAccordion
                id={editAccordionId}
                title={editAccordionTitle}
                isOpen={blockForms.edit.isOpen}
                onToggle={handleEditAccordionToggle}
                stage={editStage}
              >
                <EditBlockForm
                  draft={blockForms.edit.draft}
                  errorMessage={blockForms.edit.errorMessage}
                  hasSelection={blockForms.edit.selectedStage !== null}
                  onDraftChange={blockForms.edit.onDraftChange}
                  onSubmit={blockForms.edit.onSubmit}
                  onDuplicate={blockForms.edit.onDuplicate}
                  onDelete={blockForms.edit.onDelete}
                />
              </SidebarAccordion>
            </section>
          ) : null}

          {context.kind === 'edge' || context.kind === 'marker' ? (
            <section className={styles.card}>
              <p className={styles.sectionKicker}>{context.kind === 'edge' ? 'Editar conexão' : 'Editar marcador'}</p>

              {context.kind === 'edge' ? (
                <div className={styles.edgeDetails}>
                  <p className={styles.detailLabel}>Origem</p>
                  <p className={styles.detailValue}>{context.edge.sourceLabel}</p>
                  <p className={styles.detailLabel}>Destino</p>
                  <p className={styles.detailValue}>{context.edge.targetLabel}</p>
                  <p className={styles.detailLabel}>Status</p>
                  <p className={styles.detailValue}>{context.edge.message}</p>
                  {context.edge.markerType ? (
                    <>
                      <p className={styles.detailLabel}>Marcador</p>
                      <p className={styles.detailValue}>{context.edge.markerText ?? context.edge.markerType}</p>
                    </>
                  ) : null}
                  <div className={styles.contextActions}>
                    {context.edge.canAddRisk ? (
                      <button type="button" className={styles.secondaryAction} onClick={context.onAddRisk}>
                        Adicionar risco
                      </button>
                    ) : null}
                    {context.edge.canAddHypothesis ? (
                      <button type="button" className={styles.secondaryAction} onClick={context.onAddHypothesis}>
                        Adicionar hipótese
                      </button>
                    ) : null}
                    <button type="button" className={styles.secondaryAction} onClick={context.onDelete}>
                      Excluir conexão
                    </button>
                  </div>
                </div>
              ) : null}

              {context.kind === 'marker' ? (
                <MarkerBlock
                  sourceLabel={context.marker.sourceLabel}
                  targetLabel={context.marker.targetLabel}
                  markerText={context.marker.markerText}
                  onDraftChange={context.onDraftChange}
                  onSubmit={context.onSubmit}
                  onDelete={context.onDelete}
                />
              ) : null}
            </section>
          ) : null}

          <section className={styles.card}>
            <p className={styles.sectionKicker}>Aprender com exemplo</p>
            <p className={styles.sectionText}>Veja uma teoria pronta sem perder seu trabalho ou substitua o canvas com confirmação.</p>
            <div className={styles.exampleActions}>
              <button type="button" className={styles.secondaryAction} onClick={onPreviewExample}>
                Visualizar exemplo
              </button>
              <button type="button" className={styles.secondaryAction} onClick={onLoadExample}>
                Carregar exemplo
              </button>
              {canRestoreTheory ? (
                <button type="button" className={styles.secondaryAction} onClick={onRestoreTheory}>
                  Voltar para minha teoria
                </button>
              ) : null}
            </div>
          </section>

          <section className={styles.card}>
            <p className={styles.sectionKicker}>Resultado final</p>
            {canViewTdmResult ? (
              <>
                <p className={styles.sectionText}>Sua teoria está pronta para ser visualizada.</p>
                <button type="button" className={styles.primaryAction} onClick={onViewResult}>
                  Visualizar resultado
                </button>
              </>
            ) : (
              <p className={styles.sectionHint}>{resultAvailabilityMessage}</p>
            )}
          </section>

          <section className={styles.card}>
            <p className={styles.sectionKicker}>Mensagem do fluxo</p>
            <p className={styles.sectionText}>{insightMessage}</p>
          </section>
        </div>
      </Surface>
    </aside>
  );
}

function MarkerBlock({
  sourceLabel,
  targetLabel,
  markerText,
  onDraftChange,
  onSubmit,
  onDelete
}: {
  sourceLabel: string;
  targetLabel: string;
  markerText: string;
  onDraftChange: (nextValue: string) => void;
  onSubmit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className={styles.markerBlock}>
      <p className={styles.detailLabel}>Conexão marcada</p>
      <p className={styles.detailValue}>
        {sourceLabel} → {targetLabel}
      </p>
      <label className={styles.field}>
        <span>Texto do marcador</span>
        <div className={styles.fieldControl}>
          <input type="text" value={markerText} onChange={(event) => onDraftChange(event.target.value)} placeholder="Risco ou hipótese" />
          {markerText ? (
            <ClearFieldButton ariaLabel="Limpar texto do marcador" onClear={() => onDraftChange('')} />
          ) : null}
        </div>
      </label>
      <div className={styles.contextActions}>
        <button type="button" className={styles.primaryAction} onClick={onSubmit}>
          Salvar marcador
        </button>
        <button type="button" className={styles.secondaryAction} onClick={onDelete}>
          Excluir marcador
        </button>
      </div>
    </div>
  );
}
