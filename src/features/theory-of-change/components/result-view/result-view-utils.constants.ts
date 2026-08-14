import type { TdmConnectionKind } from '../../domain/tdm-types';
import type { TdmStage } from '../../domain/tdm-stages';
import type { ExportFormatOption, ResultBridgeConfig } from './result-view-utils.types';



export const EXPORT_FORMAT_OPTIONS: ExportFormatOption[] = [
  {
    id: 'pdf',
    label: 'PDF',
    description: 'Documento do Intérprete (estruturado).',
    available: true
  },
  {
    id: 'png',
    label: 'PNG',
    description: 'Imagem em alta qualidade do fluxo.',
    available: true
  },
  {
    id: 'jpeg',
    label: 'JPEG',
    description: 'Imagem leve para anexos e apresentações.',
    available: false,
    unavailableNote: 'Em breve — não disponível'
  },
  {
    id: 'svg',
    label: 'SVG',
    description: 'Versão vetorial do fluxo.',
    available: true
  },
  {
    id: 'word',
    label: 'Word',
    description: 'Documento editável do Intérprete (.docx).',
    available: true
  }
];

/** Stage accents for Result view — clear identity without carnival */
export const RESULT_STAGE_ACCENTS: Record<
  TdmStage,
  { accent: string; accentSoft: string; border: string; glow: string }
> = {
  input: {
    accent: 'var(--tdm-stage-input)',
    accentSoft: 'var(--tdm-stage-input-soft)',
    border: 'var(--tdm-stage-input-border)',
    glow: 'var(--tdm-stage-input-glow)'
  },
  activity: {
    accent: 'var(--tdm-stage-activity)',
    accentSoft: 'var(--tdm-stage-activity-soft)',
    border: 'var(--tdm-stage-activity-border)',
    glow: 'var(--tdm-stage-activity-glow)'
  },
  output: {
    accent: 'var(--tdm-stage-output)',
    accentSoft: 'var(--tdm-stage-output-soft)',
    border: 'var(--tdm-stage-output-border)',
    glow: 'var(--tdm-stage-output-glow)'
  },
  outcome: {
    accent: 'var(--tdm-stage-outcome)',
    accentSoft: 'var(--tdm-stage-outcome-soft)',
    border: 'var(--tdm-stage-outcome-border)',
    glow: 'var(--tdm-stage-outcome-glow)'
  }
};

export const RESULT_STAGE_CLASS_NAMES: Record<TdmStage, string> = {
  input: 'stageInsumos',
  activity: 'stageAtividades',
  output: 'stageProdutos',
  outcome: 'stageResultados'
};

export const RESULT_BRIDGE_ACCENTS = {
  risk: {
    accent: 'var(--tdm-bridge-risk)',
    glow: 'var(--tdm-bridge-risk-glow)'
  },
  hypothesis: {
    accent: 'var(--tdm-bridge-hypothesis)',
    glow: 'var(--tdm-bridge-hypothesis-glow)'
  }
} as const;

export const HERO_COMPACT_SCROLL_THRESHOLD = 12;

export const RESULT_VIEW_TITLE = 'Sua Teoria da Mudança';

export function getResultStageAccent(stage: TdmStage) {
  return RESULT_STAGE_ACCENTS[stage];
}

export function getResultStageClassName(stage: TdmStage): string {
  return RESULT_STAGE_CLASS_NAMES[stage];
}

export const RESULT_FLOW_BRIDGES: ResultBridgeConfig[] = [
  {
    id: 'input-activity',
    connectionKind: 'input-activity',
    markerKind: 'risk',
    sourceStage: 'input',
    targetStage: 'activity'
  },
  {
    id: 'activity-output',
    connectionKind: 'activity-output',
    markerKind: 'risk',
    sourceStage: 'activity',
    targetStage: 'output'
  },
  {
    id: 'output-outcome',
    connectionKind: 'output-outcome',
    markerKind: 'hypothesis',
    sourceStage: 'output',
    targetStage: 'outcome'
  }
];

