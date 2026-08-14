import type { TdmNodeDraft } from '../../domain/tdm-types';
import type { TdmStage } from '../../domain/tdm-stages';
import type { StageCreation } from '../../utils/stage-creation';

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
        markerType: 'risk' | 'hypothesis';
        /** Persisted marker text on the edge — not the live draft. */
        isEditingExisting: boolean;
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

export const STAGE_GUIDE: Record<
  TdmStage,
  {
    title: string;
    summary: string;
    technical: string;
    examples: string[];
  }
> = {
  input: {
    title: '1. Insumo',
    summary: 'O que precisa estar disponível?',
    technical: 'Insumos são recursos que precisam existir antes da ação começar.',
    examples: ['equipe', 'orçamento', 'dados', 'parceiros']
  },
  activity: {
    title: '2. Atividade',
    summary: 'O que será feito com os recursos disponíveis?',
    technical: 'Atividades são ações realizadas usando os insumos.',
    examples: ['oficinas', 'capacitações', 'atendimento', 'articulação']
  },
  output: {
    title: '3. Produto',
    summary: 'O que será entregue?',
    technical: 'Produtos são entregas concretas geradas pelas atividades.',
    examples: ['relatórios', 'materiais', 'serviços', 'pessoas atendidas']
  },
  outcome: {
    title: '4. Resultado',
    summary: 'O que muda para o público ou território?',
    technical: 'Resultados são mudanças esperadas após as entregas.',
    examples: ['acesso', 'renda', 'risco', 'aprendizagem', 'capacidade']
  }
};

export const STAGE_CREATION_HINTS: Record<StageCreation, { title: string; description: string; help: string }> = {
  input: {
    title: '1. Insumo',
    description: 'Liste os recursos que tornam a política possível.',
    help: 'Equipe, orçamento, dados, materiais, parcerias.'
  },
  activity: {
    title: '2. Atividade',
    description: 'Descreva o que será feito com esses recursos.',
    help: 'Use verbos de ação: formar, acompanhar, distribuir.'
  },
  output: {
    title: '3. Produto',
    description: 'Registre as entregas concretas das atividades.',
    help: 'Coisas contáveis: oficinas, relatórios, materiais.'
  },
  outcome: {
    title: '4. Resultado',
    description: 'Descreva a mudança esperada depois das entregas.',
    help: 'O que muda no público, na prática ou na gestão.'
  },
  'ready-to-connect': {
    title: '5. Conectar a lógica',
    description: 'Conecte os blocos da esquerda para a direita.',
    help: 'Ligue insumos → atividades → produtos → resultados.'
  }
};

export const STAGE_CREATE_LABELS: Record<TdmStage, string> = {
  input: 'Criar novo insumo',
  activity: 'Criar nova atividade',
  output: 'Criar novo produto',
  outcome: 'Criar novo resultado'
};

export const STAGE_EDIT_LABELS: Record<TdmStage, string> = {
  input: 'Editar insumo selecionado',
  activity: 'Editar atividade selecionada',
  output: 'Editar produto selecionado',
  outcome: 'Editar resultado selecionado'
};

export const STAGE_SINGULAR: Record<TdmStage, string> = {
  input: 'insumo',
  activity: 'atividade',
  output: 'produto',
  outcome: 'resultado'
};

export const STAGE_ADVANCE_HINTS: Record<TdmStage, string> = {
  input: 'Adicione pelo menos 1 insumo para avançar.',
  activity: 'Adicione pelo menos 1 atividade para avançar.',
  output: 'Adicione pelo menos 1 produto para avançar.',
  outcome: 'Adicione pelo menos 1 resultado para concluir.'
};

export const THEORY_PROGRESS_ITEM_GOAL = 10;

