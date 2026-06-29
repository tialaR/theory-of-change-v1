import type { TdmEdge, TdmNode } from '../domain/tdm-types';
import { createEdge } from '../utils/create-edge';
import { createNode } from '../utils/create-node';

export interface ExampleTheory {
  title: string;
  nodes: TdmNode[];
  edges: TdmEdge[];
}

const exampleInput = createNode({
  title: 'Equipe técnica',
  stage: 'input',
  description: 'Profissionais disponíveis para coordenar e apoiar a execução.',
  advancedDetails: 'Capacidade instalada para planejar, acompanhar e revisar a política.',
  shortNotes: 'Pessoas para conduzir a política',
  x: 120,
  y: 140
});

const exampleInputTwo = createNode({
  title: 'Orçamento',
  stage: 'input',
  description: 'Recursos financeiros para viabilizar as ações planejadas.',
  advancedDetails: 'Verbas para sustentar a operação, materiais e deslocamentos.',
  shortNotes: 'Recursos financeiros',
  x: 120,
  y: 290
});

const exampleInputThree = createNode({
  title: 'Dados educacionais',
  stage: 'input',
  description: 'Informações sobre frequência, aprendizagem e participação dos estudantes.',
  advancedDetails: 'Base para orientar decisões, priorizar ações e monitorar resultados.',
  shortNotes: 'Base de informação',
  x: 120,
  y: 440
});

const exampleActivity = createNode({
  title: 'Formação de professores',
  stage: 'activity',
  description: 'Encontros para orientar o uso de práticas e materiais.',
  advancedDetails: 'Ações que transformam os recursos em execução prática.',
  shortNotes: 'Encontros formativos',
  x: 460,
  y: 140
});

const exampleActivityTwo = createNode({
  title: 'Acompanhamento nas escolas',
  stage: 'activity',
  description: 'Rotina de apoio técnico para revisar dados e planos de ação.',
  advancedDetails: 'Acompanhamento periódico para ajustar a implementação.',
  shortNotes: 'Apoio técnico',
  x: 460,
  y: 290
});

const exampleOutput = createNode({
  title: 'Oficinas realizadas',
  stage: 'output',
  description: 'Formações concluídas com participação das equipes escolares.',
  advancedDetails: 'Entregas concretas geradas a partir das atividades executadas.',
  shortNotes: 'Formações concluídas',
  x: 800,
  y: 140
});

const exampleOutputTwo = createNode({
  title: 'Planos de ação validados',
  stage: 'output',
  description: 'Planos revisados e aprovados com foco na melhoria da aprendizagem.',
  advancedDetails: 'Documentos pactuados para orientar a execução nas escolas.',
  shortNotes: 'Planos validados',
  x: 800,
  y: 290
});

const exampleOutcome = createNode({
  title: 'Melhoria no acompanhamento',
  stage: 'outcome',
  description: 'Escolas passam a usar dados para acompanhar estudantes com mais regularidade.',
  advancedDetails: 'Mudança esperada na prática de monitoramento e gestão pedagógica.',
  shortNotes: 'Uso mais regular de dados',
  x: 1140,
  y: 140
});

export const exampleTheory: ExampleTheory = {
  title: 'Nova teoria da mudança',
  nodes: [exampleInput, exampleInputTwo, exampleInputThree, exampleActivity, exampleActivityTwo, exampleOutput, exampleOutputTwo, exampleOutcome],
  edges: [
    createEdge({
      source: exampleInput.id,
      target: exampleActivity.id,
      sourceStage: 'input',
      targetStage: 'activity'
    }),
    createEdge({
      source: exampleInputTwo.id,
      target: exampleActivity.id,
      sourceStage: 'input',
      targetStage: 'activity'
    }),
    createEdge({
      source: exampleInputThree.id,
      target: exampleActivityTwo.id,
      sourceStage: 'input',
      targetStage: 'activity'
    }),
    createEdge({
      source: exampleActivity.id,
      target: exampleOutput.id,
      sourceStage: 'activity',
      targetStage: 'output'
    }),
    createEdge({
      source: exampleActivityTwo.id,
      target: exampleOutputTwo.id,
      sourceStage: 'activity',
      targetStage: 'output'
    }),
    createEdge({
      source: exampleOutput.id,
      target: exampleOutcome.id,
      sourceStage: 'output',
      targetStage: 'outcome'
    }),
    createEdge({
      source: exampleOutputTwo.id,
      target: exampleOutcome.id,
      sourceStage: 'output',
      targetStage: 'outcome'
    })
  ]
};
