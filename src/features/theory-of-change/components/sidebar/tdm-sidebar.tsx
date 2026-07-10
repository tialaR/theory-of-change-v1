'use client';

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type DragEvent,
  type ReactNode,
  type RefObject
} from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Surface } from '@/shared/ui/surface/surface';
import { TdmButton } from '@/shared/ui/tdm-button/tdm-button';
import buttonStyles from '@/shared/ui/tdm-button/tdm-button.module.sass';
import { TdmAnchoredTooltip } from '@/shared/ui/tooltip/tdm-anchored-tooltip';
import type { TdmNodeDraft } from '../../domain/tdm-types';
import { TDM_STAGE_ORDER, type TdmStage } from '../../domain/tdm-stages';
import { getTdmStageTheme } from '../../domain/tdm-theme';
import type { StageCreation } from '../../utils/stage-creation';
import { TdmBlockFormFields, TdmFormField } from '../form-field/tdm-form-field';
import fieldStyles from '../form-field/tdm-form-field.module.sass';
import { TdmSectionIcon } from '../tdm-section-icon/tdm-section-icon';
import { TheoryHeaderForm, THEORY_DEFAULT_DESCRIPTION } from './theory-header-form';
import { SidebarToggleIcon } from './sidebar-toggle-icon';
import {
  V1BlockFormsPanel,
  V1CanvasOrganizationAccordion,
  V1FinalResultCard,
  V1StageActionSection,
  V1TheoryProgressHeader
} from './v1-preserved-sidebar-sections';
import styles from './tdm-sidebar.module.sass';

export { SidebarToggleIcon };

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
    examples: [
      'escolas acompanham melhor estudantes',
      'professores usam dados',
      'estudantes frequentam mais aulas',
      'gestão toma decisões mais rápidas'
    ]
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

const STAGE_SINGULAR: Record<TdmStage, string> = {
  input: 'insumo',
  activity: 'atividade',
  output: 'produto',
  outcome: 'resultado'
};

const STAGE_ADVANCE_HINTS: Record<TdmStage, string> = {
  input: 'Adicione pelo menos 1 insumo para avançar.',
  activity: 'Adicione pelo menos 1 atividade para avançar.',
  output: 'Adicione pelo menos 1 produto para avançar.',
  outcome: 'Adicione pelo menos 1 resultado para concluir.'
};

const THEORY_PROGRESS_ITEM_GOAL = 10;

function getStageLockTooltip(stage: TdmStage) {
  const stageIndex = TDM_STAGE_ORDER.indexOf(stage);
  if (stageIndex <= 0) {
    return 'Esta etapa será liberada após preencher a etapa anterior.';
  }

  const previousStage = TDM_STAGE_ORDER[stageIndex - 1];
  return `Conclua ao menos 1 ${STAGE_SINGULAR[previousStage]} para desbloquear esta etapa.`;
}

function stripStageNumber(title: string) {
  return title.replace(/^\d+\.\s*/, '');
}

function BlockFormGroupHeader({ label, kind }: { label: string; kind: 'create' | 'edit' }) {
  return (
    <div className={styles.blockFormGroupHeader}>
      <TdmSectionIcon variant={kind === 'create' ? 'createBlock' : 'editBlock'} />
      <p className={styles.blockFormGroupTitle}>{label}</p>
    </div>
  );
}

function AccordionChevron({
  isOpen,
  className,
  accentWhenOpen = false
}: {
  isOpen: boolean;
  className?: string;
  accentWhenOpen?: boolean;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={[
        styles.sidebarAccordionChevron,
        isOpen ? styles.sidebarAccordionChevronOpen : '',
        accentWhenOpen && isOpen ? styles.sidebarAccordionChevronAccent : '',
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

function TimelineChevron({
  isOpen,
  isActive = false,
  isBlocked = false
}: {
  isOpen: boolean;
  isActive?: boolean;
  isBlocked?: boolean;
}) {
  return (
    <span
      className={[
        styles.timelineChevronButton,
        isOpen ? styles.timelineChevronOpen : '',
        isActive && !isBlocked ? styles.timelineChevronActive : '',
        isBlocked ? styles.timelineChevronBlocked : ''
      ]
        .filter(Boolean)
        .join(' ')}
      aria-hidden="true"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className={styles.timelineChevronIcon} fill="none">
        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function TimelineLockIcon({
  tooltip,
  boundaryRef
}: {
  tooltip: string;
  boundaryRef?: RefObject<HTMLElement | null>;
}) {
  return (
    <TdmAnchoredTooltip content={tooltip} boundaryRef={boundaryRef}>
      <span className={styles.stageLockIcon} aria-label={tooltip} tabIndex={0} role="button">
        <svg aria-hidden="true" viewBox="0 0 16 16" className={styles.stageLockSvg} fill="none">
          <rect x="3.25" y="7" width="9.5" height="6.75" rx="1.25" stroke="currentColor" strokeWidth="1.25" />
          <path
            d="M5.25 7V5.25a2.75 2.75 0 0 1 5.5 0V7"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
        </svg>
      </span>
    </TdmAnchoredTooltip>
  );
}

function DuplicateIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className={buttonStyles.icon}>
      <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.35" />
      <path d="M10.5 5.5V4a1.5 1.5 0 0 0-1.5-1.5H4A1.5 1.5 0 0 0 2.5 4v5A1.5 1.5 0 0 0 4 10.5h1.5" fill="none" stroke="currentColor" strokeWidth="1.35" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className={buttonStyles.icon}>
      <path d="M3.5 4.5h9M6 4.5V3.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1M6.5 7v4M9.5 7v4" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
      <path d="M4.5 4.5l.5 7.5a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1l.5-7.5" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BackArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className={buttonStyles.icon}>
      <path d="M10 3.5 5.5 8 10 12.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const QUICK_SHORTCUT_SPRING = { type: 'spring' as const, stiffness: 260, damping: 22 };

function ExamplesPreviewIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className={styles.quickShortcutBtnIcon} fill="none">
      <path
        d="M4.5 6.5 10 3.75 15.5 6.5v7L10 16.25 4.5 13.5v-7Z"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinejoin="round"
      />
      <path d="M10 3.75v12.5M4.5 6.5 10 9.25 15.5 6.5" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" opacity="0.45" />
    </svg>
  );
}

function LibraryIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className={styles.quickShortcutBtnIcon} fill="none">
      <path
        d="M4.25 4.5h4.5a1 1 0 0 1 1 1v10.25H5.25a1 1 0 0 0-1 1V5.5a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="M9.75 5.5h4.5a1 1 0 0 1 1 1v10.25h-4.5a1 1 0 0 0-1-1V5.5Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M6.25 7.75h1.5M12.75 7.75h1.5M6.25 10.25h1.5M12.75 10.25h1.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity="0.45" />
    </svg>
  );
}

function ModelsGridIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className={styles.quickShortcutBtnIcon} fill="none">
      <rect x="4" y="4" width="5.25" height="5.25" rx="1.25" stroke="currentColor" strokeWidth="1.3" />
      <rect x="10.75" y="4" width="5.25" height="5.25" rx="1.25" stroke="currentColor" strokeWidth="1.3" />
      <rect x="4" y="10.75" width="5.25" height="5.25" rx="1.25" stroke="currentColor" strokeWidth="1.3" />
      <rect x="10.75" y="10.75" width="5.25" height="5.25" rx="1.25" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function GuidesDocIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className={styles.quickShortcutBtnIcon} fill="none">
      <path
        d="M6 3.75h5.5L15.25 7.5v8.75a.75.75 0 0 1-.75.75H6a1.25 1.25 0 0 1-1.25-1.25V5a1.25 1.25 0 0 1 1.25-1.25Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M11.5 3.75V7.5h3.75" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" opacity="0.45" />
      <path d="M7.5 10.25h5M7.5 12.75h5M7.5 15.25h3.25" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity="0.45" />
    </svg>
  );
}

function QuickShortcutButton({
  onClick,
  icon,
  label,
  shouldReduceMotion
}: {
  onClick: () => void;
  icon: ReactNode;
  label: string;
  shouldReduceMotion: boolean;
}) {
  return (
    <motion.button
      type="button"
      className={styles.quickShortcutBtn}
      onClick={onClick}
      whileHover={shouldReduceMotion ? undefined : { y: -2, scale: 1.008 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.988 }}
      transition={QUICK_SHORTCUT_SPRING}
    >
      {icon}
      <span className={styles.quickShortcutBtnLabel}>{label}</span>
    </motion.button>
  );
}

function QuickShortcutsCard({
  onViewExampleCanvas,
  onViewExampleResult,
  canRestoreTheory,
  onRestoreTheory
}: {
  onViewExampleCanvas: () => void;
  onViewExampleResult: () => void;
  canRestoreTheory: boolean;
  onRestoreTheory: () => void;
}) {
  const shouldReduceMotion = useReducedMotion();

  const handleQuickLibraryClick = useCallback(() => {
    // Reservado para futura navegação à biblioteca.
  }, []);

  const handleQuickModelsClick = useCallback(() => {
    // Reservado para futura navegação aos modelos.
  }, []);

  return (
    <section className={[styles.card, styles.quickShortcutsCard].join(' ')}>
      <div className={styles.quickShortcutsHeader}>
        <div className={styles.quickShortcutsTitleRow}>
          <TdmSectionIcon variant="quickShortcuts" />
          <p className={styles.quickShortcutsTitle}>Atalhos rápidos</p>
        </div>
      </div>
      <div className={styles.quickShortcutsGrid}>
        <QuickShortcutButton
          onClick={onViewExampleCanvas}
          icon={<ExamplesPreviewIcon />}
          label="Exemplos"
          shouldReduceMotion={shouldReduceMotion ?? false}
        />
        <QuickShortcutButton
          onClick={handleQuickLibraryClick}
          icon={<LibraryIcon />}
          label="Biblioteca"
          shouldReduceMotion={shouldReduceMotion ?? false}
        />
        <QuickShortcutButton
          onClick={handleQuickModelsClick}
          icon={<ModelsGridIcon />}
          label="Modelos"
          shouldReduceMotion={shouldReduceMotion ?? false}
        />
        <QuickShortcutButton
          onClick={onViewExampleResult}
          icon={<GuidesDocIcon />}
          label="Guias"
          shouldReduceMotion={shouldReduceMotion ?? false}
        />
      </div>
      {canRestoreTheory ? (
        <TdmButton
          variant="ghost"
          fullWidth
          icon={<BackArrowIcon />}
          iconPosition="left"
          className={styles.sidebarCtaSpaced}
          onClick={onRestoreTheory}
        >
          Voltar para minha teoria
        </TdmButton>
      ) : null}
    </section>
  );
}

function AdvanceArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className={buttonStyles.icon}>
      <path
        d="M3.5 8h9M9 4.5 12.5 8 9 11.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SidebarAccordion({
  id,
  title,
  isOpen,
  onToggle,
  stage,
  variant = 'default',
  children
}: {
  id: string;
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  stage: TdmStage;
  variant?: 'default' | 'block';
  children: ReactNode;
}) {
  const theme = getTdmStageTheme(stage);
  const contentId = `${id}-content`;

  return (
    <div
      className={[
        styles.sidebarAccordion,
        variant === 'block' ? styles.blockSidebarAccordion : '',
        isOpen ? styles.sidebarAccordionOpen : ''
      ]
        .filter(Boolean)
        .join(' ')}
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
        className={[styles.sidebarAccordionHeader, variant === 'block' ? styles.blockAccordionHeader : ''].join(' ')}
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
    <div className={fieldStyles.form}>
      {errorMessage ? <p className={fieldStyles.errorMessage}>{errorMessage}</p> : null}
      <TdmBlockFormFields draft={draft} onDraftChange={onDraftChange} />
      <TdmButton variant="primary" fullWidth onClick={onSubmit}>
        {STAGE_CREATE_LABELS[stage]}
      </TdmButton>
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
    <div className={fieldStyles.form}>
      {!hasSelection ? (
        <p className={styles.sectionHint}>Selecione um bloco no canvas para editar.</p>
      ) : (
        <>
          {errorMessage ? <p className={fieldStyles.errorMessage}>{errorMessage}</p> : null}
          <TdmBlockFormFields draft={draft} onDraftChange={onDraftChange} />
          <TdmButton variant="primary" fullWidth onClick={onSubmit}>
            Salvar alterações
          </TdmButton>
          <div className={styles.sidebarCtaRow}>
            <TdmButton variant="secondary" fullWidth icon={<DuplicateIcon />} onClick={onDuplicate}>
              Duplicar
            </TdmButton>
            <TdmButton variant="danger" fullWidth icon={<TrashIcon />} onClick={onDelete}>
              Deletar
            </TdmButton>
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
  actionLabel,
  onOrganize,
  advanceLabel,
  onAdvance,
  canAdvance,
  canViewTdmResult,
  resultAvailabilityMessage,
  onViewExampleCanvas,
  onViewExampleResult,
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
  actionLabel?: string;
  onOrganize?: () => void;
  advanceLabel?: string;
  onAdvance?: () => void;
  canAdvance?: boolean;
  canViewTdmResult: boolean;
  resultAvailabilityMessage: string;
  onViewExampleCanvas: () => void;
  onViewExampleResult: () => void;
  canRestoreTheory: boolean;
  onRestoreTheory: () => void;
  onViewResult: () => void;
  context: TdmSidebarContext;
  blockForms?: TdmBlockForms | null;
  onStageDragStart?: (event: DragEvent<HTMLElement>, stage: TdmStage) => void;
}) {
  const shouldReduceMotion = useReducedMotion();
  const [theoryDescription, setTheoryDescription] = useState(THEORY_DEFAULT_DESCRIPTION);
  const [openStage, setOpenStage] = useState<TdmStage>(stageCreation === 'ready-to-connect' ? 'outcome' : stageCreation);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const heroFormShellRef = useRef<HTMLDivElement | null>(null);
  const scrollRafRef = useRef<number | null>(null);
  const isHeroCompactRef = useRef(false);
  const [isSidebarScrolled, setIsSidebarScrolled] = useState(false);
  const [isHeroCompact, setIsHeroCompact] = useState(false);
  const createAccordionId = useId();
  const editAccordionId = useId();
  const canvasOrganizationAccordionId = useId();

  useEffect(() => {
    const contentElement = contentRef.current;
    if (!contentElement) return;

    const updateHeroScrollState = () => {
      const scrollTop = contentElement.scrollTop;
      setIsSidebarScrolled(scrollTop > 8);

      const shouldCompact = isHeroCompactRef.current ? scrollTop > 12 : scrollTop > 48;

      if (shouldCompact !== isHeroCompactRef.current) {
        if (
          shouldCompact &&
          typeof document !== 'undefined' &&
          heroFormShellRef.current?.contains(document.activeElement)
        ) {
          (document.activeElement as HTMLElement | null)?.blur();
        }

        isHeroCompactRef.current = shouldCompact;
        setIsHeroCompact(shouldCompact);
      }
    };

    const handleScroll = () => {
      if (scrollRafRef.current !== null) return;
      scrollRafRef.current = window.requestAnimationFrame(() => {
        scrollRafRef.current = null;
        updateHeroScrollState();
      });
    };

    updateHeroScrollState();
    contentElement.addEventListener('scroll', handleScroll, { passive: true });
    heroFormShellRef.current?.addEventListener('focusin', updateHeroScrollState);
    heroFormShellRef.current?.addEventListener('focusout', updateHeroScrollState);

    return () => {
      contentElement.removeEventListener('scroll', handleScroll);
      heroFormShellRef.current?.removeEventListener('focusin', updateHeroScrollState);
      heroFormShellRef.current?.removeEventListener('focusout', updateHeroScrollState);
      if (scrollRafRef.current !== null) {
        window.cancelAnimationFrame(scrollRafRef.current);
        scrollRafRef.current = null;
      }
    };
  }, []);

  const currentGuide = STAGE_CREATION_HINTS[stageCreation];
  const totalRegisteredItems = useMemo(
    () => TDM_STAGE_ORDER.reduce((sum, stage) => sum + stageCounts[stage], 0),
    [stageCounts]
  );

  const theoryProgressPercent = useMemo(() => {
    if (stageCreation === 'ready-to-connect') return 100;
    return Math.min(100, Math.round((totalRegisteredItems / THEORY_PROGRESS_ITEM_GOAL) * 100));
  }, [stageCreation, totalRegisteredItems]);

  const progressStage: TdmStage = stageCreation === 'ready-to-connect' ? 'outcome' : stageCreation;
  const progressAccent = getTdmStageTheme(progressStage).accent;

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
        <header className={[styles.header, isSidebarScrolled ? styles.headerScrolled : ''].filter(Boolean).join(' ')}>
          <div className={styles.headerCopy}>
            <section
              className={[styles.heroCard, isHeroCompact ? styles.heroCardCollapsed : ''].filter(Boolean).join(' ')}
              aria-label="Hero da teoria da mudança"
            >
              <span className={styles.heroGlowTop} aria-hidden="true" />
              <span className={styles.heroGlowBottom} aria-hidden="true" />
              <span className={styles.heroSpecular} aria-hidden="true" />
              <div className={styles.heroContent}>
                <div className={styles.heroLead}>
                  <h1 className={styles.heroTitle}>Construtor de Teoria da Mudança</h1>
                  <p className={styles.heroDescription}>
                    Um espaço guiado para mapear impacto, alinhar estratégias e criar resultados significativos.
                  </p>
                </div>
                <div
                  ref={heroFormShellRef}
                  className={[styles.heroFormShell, isHeroCompact ? styles.heroFormShellCollapsed : '']
                    .filter(Boolean)
                    .join(' ')}
                  aria-hidden={isHeroCompact}
                >
                  <TheoryHeaderForm
                    theoryName={theoryName}
                    theoryDescription={theoryDescription}
                    onTheoryNameChange={onTheoryNameChange}
                    onTheoryDescriptionChange={setTheoryDescription}
                    onHideSidebar={onToggle}
                  />
                </div>
              </div>
              <div className={styles.heroSculptureWrap} aria-hidden="true">
              </div>
            </section>
          </div>
        </header>

        <div ref={contentRef} className={styles.content}>
          <section
            className={[styles.card, styles.progressCard].join(' ')}
            style={{ '--stage-accent': progressAccent } as CSSProperties}
          >
            <V1TheoryProgressHeader
              percent={theoryProgressPercent}
              accent={progressAccent}
              stageTitle={currentGuide.title}
              stageInstruction={currentGuide.description}
            />
            <div className={styles.timeline} aria-label="Progresso da teoria">
              {TDM_STAGE_ORDER.map((stage, index) => {
                const guide = STAGE_GUIDE[stage];
                const theme = getTdmStageTheme(stage);
                const status = getStageStatus(stage, stageCreation, index);
                const isCurrentStage = stageCreation !== 'ready-to-connect' && stageCreation === stage;
                const isStageExpanded = openStage === stage || isCurrentStage;
                const lockTooltip = status === 'blocked' ? getStageLockTooltip(stage) : '';
                const isTopSegmentLit = status === 'completed' || status === 'current';
                const isBottomSegmentLit = status === 'completed';

                return (
                  <details
                    key={stage}
                    open={isStageExpanded}
                    className={[
                      styles.stageAccordion,
                      styles[`stage${status}`] as string,
                      index === 0 ? styles.stageFirst : '',
                      index === TDM_STAGE_ORDER.length - 1 ? styles.stageLast : '',
                      isStageExpanded ? styles.stageExpanded : ''
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    style={
                      {
                        '--stage-accent': theme.accent,
                        '--stage-border': theme.border
                      } as CSSProperties
                    }
                    onToggle={(event) => {
                      if (event.currentTarget.open) {
                        setOpenStage(stage);
                        return;
                      }

                      if (isCurrentStage) {
                        setOpenStage(stage);
                        return;
                      }

                      if (openStage === stage) {
                        setOpenStage(stageCreation !== 'ready-to-connect' ? stageCreation : 'outcome');
                      }
                    }}
                  >
                    <summary className={styles.stageSummary}>
                      <span className={styles.stageColorBar} aria-hidden="true" />
                      <span className={styles.stageProgressColumn} aria-hidden="true">
                        <span
                          className={[
                            styles.stageProgressSegment,
                            styles.stageProgressSegmentTop,
                            isTopSegmentLit ? styles.stageProgressSegmentLit : ''
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        />
                        <span className={styles.stageDot}>{status === 'completed' ? '✓' : index + 1}</span>
                        <span
                          className={[
                            styles.stageProgressSegment,
                            styles.stageProgressSegmentBottom,
                            isBottomSegmentLit ? styles.stageProgressSegmentLit : ''
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        />
                      </span>
                      <span className={styles.stageSummaryCopy}>
                        <strong>{stripStageNumber(guide.title)}</strong>
                        <small>{guide.summary}</small>
                      </span>
                      <span className={styles.stageCountBadge}>{stageCounts[stage]}</span>
                      {status === 'blocked' ? (
                        <TimelineLockIcon tooltip={lockTooltip} boundaryRef={contentRef} />
                      ) : null}
                      <TimelineChevron
                        isOpen={isStageExpanded}
                        isActive={status === 'current' || isStageExpanded}
                        isBlocked={status === 'blocked'}
                      />
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
            <TdmButton
              variant="primary"
              fullWidth
              className={styles.workflowAdvanceButton}
              disabled={!canAdvance}
              onClick={onAdvance}
              icon={<AdvanceArrowIcon />}
              iconPosition="right"
            >
              {advanceLabel ?? 'Avançar para próxima etapa'}
            </TdmButton>
            {!canAdvance && stageCreation !== 'ready-to-connect' ? (
              <p className={styles.contextualHint} style={{ '--stage-accent': progressAccent } as CSSProperties}>
                <span className={styles.contextualHintIcon} aria-hidden="true">
                  ⓘ
                </span>
                {STAGE_ADVANCE_HINTS[stageCreation]}
              </p>
            ) : null}
          </section>

          <V1StageActionSection
            stageCreation={stageCreation}
            actionLabel={actionLabel}
            onStageDragStart={onStageDragStart}
          />

          <V1CanvasOrganizationAccordion
            id={canvasOrganizationAccordionId}
            stageCounts={stageCounts}
            onOrganize={onOrganize}
          />

          {blockForms ? (
            <V1BlockFormsPanel stage={blockForms.stage}>
              <div className={styles.blockFormGroup}>
                <BlockFormGroupHeader label="Criar bloco" kind="create" />
                <SidebarAccordion
                  id={createAccordionId}
                  title={STAGE_CREATE_LABELS[blockForms.stage]}
                  isOpen={blockForms.create.isOpen}
                  onToggle={handleCreateAccordionToggle}
                  stage={blockForms.stage}
                  variant="block"
                >
                  <CreateBlockForm
                    stage={blockForms.stage}
                    draft={blockForms.create.draft}
                    errorMessage={blockForms.create.errorMessage}
                    onDraftChange={blockForms.create.onDraftChange}
                    onSubmit={blockForms.create.onSubmit}
                  />
                </SidebarAccordion>
              </div>

              <div className={styles.blockFormGroup}>
                <BlockFormGroupHeader label="Editar bloco" kind="edit" />
                <SidebarAccordion
                  id={editAccordionId}
                  title={editAccordionTitle}
                  isOpen={blockForms.edit.isOpen}
                  onToggle={handleEditAccordionToggle}
                  stage={editStage}
                  variant="block"
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
              </div>
            </V1BlockFormsPanel>
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
                      <TdmButton variant="secondary" onClick={context.onAddRisk}>
                        Adicionar risco
                      </TdmButton>
                    ) : null}
                    {context.edge.canAddHypothesis ? (
                      <TdmButton variant="secondary" onClick={context.onAddHypothesis}>
                        Adicionar hipótese
                      </TdmButton>
                    ) : null}
                    <TdmButton variant="danger" onClick={context.onDelete}>
                      Excluir conexão
                    </TdmButton>
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

          <QuickShortcutsCard
            onViewExampleCanvas={onViewExampleCanvas}
            onViewExampleResult={onViewExampleResult}
            canRestoreTheory={canRestoreTheory}
            onRestoreTheory={onRestoreTheory}
          />

          <V1FinalResultCard
            canViewTdmResult={canViewTdmResult}
            resultAvailabilityMessage={resultAvailabilityMessage}
            onViewResult={onViewResult}
          />
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
      <TdmFormField
        label="Texto do marcador"
        value={markerText}
        placeholder="Risco ou hipótese"
        clearAriaLabel="Limpar texto do marcador"
        onChange={onDraftChange}
        onClear={() => onDraftChange('')}
      />
      <div className={styles.contextActions}>
        <TdmButton variant="primary" onClick={onSubmit}>
          Salvar marcador
        </TdmButton>
        <TdmButton variant="danger" onClick={onDelete}>
          Excluir marcador
        </TdmButton>
      </div>
    </div>
  );
}
