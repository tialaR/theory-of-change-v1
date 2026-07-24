export type GuideStageTone =
  | 'neutral'
  | 'input'
  | 'activity'
  | 'output'
  | 'outcome'
  | 'connection';

export type GuideStep = {
  number: string;
  title: string;
  description: string;
  recommendation: string;
  example: string;
  tone: GuideStageTone;
};

export const GUIDE_STEPS: readonly GuideStep[] = [
  {
    number: 'Passo 0',
    title: 'Fundamentos da Teoria de Mudança',
    description:
      'Entenda a lógica CLEAR/FGV para construir uma Teoria de Mudança: insumos → atividades → produtos → resultados.',
    recommendation:
      'Use esta etapa para compreender a coerência causal, as hipóteses e os riscos antes de preencher os cartões.',
    example: 'Insumos sustentam atividades, atividades geram produtos, produtos viabilizam resultados.',
    tone: 'neutral'
  },
  {
    number: 'Passo 1',
    title: 'Insumos',
    description: 'Liste recursos e capacidades necessários para viabilizar a política.',
    recommendation:
      'Escreva como recursos ou capacidades em forma nominal: equipe formada, orçamento anual, parceria com municípios.',
    example: 'Equipe técnica, orçamento, dados educacionais.',
    tone: 'input'
  },
  {
    number: 'Passo 2',
    title: 'Atividades',
    description: 'Descreva o que a política faz com os insumos.',
    recommendation: 'Comece com verbos de ação: realizar, oferecer, implantar, acompanhar.',
    example: 'Formar professores, acompanhar escolas, revisar planos de ação.',
    tone: 'activity'
  },
  {
    number: 'Passo 3',
    title: 'Produtos',
    description: 'Registre as entregas diretas geradas pelas atividades.',
    recommendation: 'Produtos devem ser observáveis ou quantificáveis.',
    example: 'Oficinas realizadas, planos validados, relatórios emitidos.',
    tone: 'output'
  },
  {
    number: 'Passo 4',
    title: 'Resultados',
    description: 'Descreva mudanças de curto prazo nos públicos-alvo.',
    recommendation: 'Resultados indicam mudança de comportamento, atitude ou condição.',
    example: 'Escolas passam a usar dados com mais regularidade.',
    tone: 'outcome'
  },
  {
    number: 'Passo 5',
    title: 'Conexões causais',
    description:
      'Clique em um cartão de origem e depois em um cartão do estágio seguinte para criar uma relação causal.',
    recommendation: 'Conexões só acontecem entre fases consecutivas.',
    example: 'Insumos → Atividades → Produtos → Resultados.',
    tone: 'connection'
  },
  {
    number: 'Passo 6',
    title: 'Riscos e hipóteses',
    description: 'Use riscos e hipóteses para qualificar as conexões da teoria.',
    recommendation:
      'Riscos aparecem entre insumos, atividades e produtos. Hipóteses aparecem entre produtos e resultados.',
    example: 'Risco: baixa adesão das escolas. Hipótese: produtos entregues geram mudança observável.',
    tone: 'connection'
  },
  {
    number: 'Passo 7',
    title: 'Leitura final',
    description: 'Visualize a teoria completa após conectar as etapas.',
    recommendation:
      'Clique nos cards para destacar relações e revisar riscos, hipóteses e coerência causal.',
    example: 'A leitura final mostra quais elementos sustentam cada resultado.',
    tone: 'neutral'
  }
] as const;
