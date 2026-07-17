import {
  CONNECTION_CONDITION_BY_TRANSITION,
  type ConnectionTransitionKey
} from '@/features/theory-of-change/domain/tdm-connection-rules';
import { TDM_STAGE_ORDER, type TdmStage } from '@/features/theory-of-change/domain/tdm-stages';
import type { NarrativeGraph } from './theory-narrative.graph';
import type {
  TheoryNarrativeFlowchartTransition,
  TheoryNarrativeFlowchartViewModel,
  TheoryNarrativeMode
} from './theory-narrative.types';

const STAGE_COPY: Record<TdmStage, { title: string; subtitle: string }> = {
  input: { title: 'INSUMOS', subtitle: 'Recursos mobilizados' },
  activity: { title: 'ATIVIDADES', subtitle: 'Ações realizadas' },
  output: { title: 'PRODUTOS', subtitle: 'Entregas geradas' },
  outcome: { title: 'RESULTADOS', subtitle: 'Mudanças esperadas' }
};

const STRUCTURAL_TRANSITIONS: Array<{
  id: string;
  key: ConnectionTransitionKey;
  sourceStage: TdmStage;
  targetStage: TdmStage;
}> = [
  { id: 'input-activity', key: 'input->activity', sourceStage: 'input', targetStage: 'activity' },
  { id: 'activity-output', key: 'activity->output', sourceStage: 'activity', targetStage: 'output' },
  { id: 'output-outcome', key: 'output->outcome', sourceStage: 'output', targetStage: 'outcome' }
];

function compactMarkerLabel(kind: 'risk' | 'hypothesis', count: number): string | null {
  if (count <= 0) {
    return null;
  }
  const glyph = kind === 'risk' ? 'R' : 'H';
  return count === 1 ? glyph : `${glyph} ${count}`;
}

function countConditionsForTransition(
  graph: NarrativeGraph,
  sourceStage: TdmStage,
  targetStage: TdmStage,
  kind: 'risk' | 'hypothesis'
): number {
  let count = 0;
  graph.edges.forEach((edge) => {
    const edgeSource = edge.sourceStage ?? graph.nodes.get(edge.sourceId)?.stage;
    const edgeTarget = edge.targetStage ?? graph.nodes.get(edge.targetId)?.stage;
    if (edgeSource !== sourceStage || edgeTarget !== targetStage) {
      return;
    }
    count += kind === 'risk' ? edge.risks.length : edge.hypotheses.length;
  });
  return count;
}

function buildAltText(mode: TheoryNarrativeMode, riskCount: number, hypothesisCount: number): string {
  const riskPhrase =
    riskCount === 1
      ? '1 risco nas conexões entre insumos e atividades e entre atividades e produtos'
      : `${riskCount} riscos nas conexões entre insumos e atividades e entre atividades e produtos`;
  const hypothesisPhrase =
    hypothesisCount === 1
      ? '1 hipótese na conexão entre produtos e resultados'
      : `${hypothesisCount} hipóteses na conexão entre produtos e resultados`;

  if (mode === 'scoped') {
    return `Fluxograma do fluxo selecionado da teoria da mudança com quatro etapas: insumos, atividades, produtos e resultados. Há ${riskPhrase}, e ${hypothesisPhrase}.`;
  }

  return `Fluxograma da teoria da mudança com quatro etapas: insumos, atividades, produtos e resultados. Há ${riskPhrase}, e ${hypothesisPhrase}.`;
}

/**
 * Structural flowchart ViewModel — exclusive matrix from
 * docs/tdm-clear-interpreter-standard-v2.1.md
 */
export function buildTheoryNarrativeFlowchart(
  graph: NarrativeGraph,
  mode: TheoryNarrativeMode
): TheoryNarrativeFlowchartViewModel {
  const transitions: TheoryNarrativeFlowchartTransition[] = STRUCTURAL_TRANSITIONS.map((item) => {
    const conditionKind = CONNECTION_CONDITION_BY_TRANSITION[item.key];
    const count = countConditionsForTransition(graph, item.sourceStage, item.targetStage, conditionKind);
    return {
      id: item.id,
      sourceStage: item.sourceStage,
      targetStage: item.targetStage,
      conditionKind,
      structuralLabel: conditionKind === 'risk' ? 'RISCO' : 'HIPÓTESE',
      compactLabel: compactMarkerLabel(conditionKind, count),
      count
    };
  });

  const riskCount = transitions
    .filter((transition) => transition.conditionKind === 'risk')
    .reduce((sum, transition) => sum + transition.count, 0);
  const hypothesisCount = transitions
    .filter((transition) => transition.conditionKind === 'hypothesis')
    .reduce((sum, transition) => sum + transition.count, 0);

  return {
    figureTitle:
      mode === 'scoped'
        ? 'Figura 1 – Encadeamento simplificado do fluxo selecionado'
        : 'Figura 1 – Encadeamento simplificado da teoria da mudança',
    caption: 'Visão estrutural. O conteúdo integral permanece na narrativa documental.',
    sourceNote:
      'Fonte: elaboração própria com base nos dados da teoria e na estrutura metodológica do FGV EESP CLEAR.',
    altText: buildAltText(mode, riskCount, hypothesisCount),
    stages: TDM_STAGE_ORDER.map((stage) => ({
      stage,
      title: STAGE_COPY[stage].title,
      subtitle: STAGE_COPY[stage].subtitle
    })),
    transitions
  };
}
