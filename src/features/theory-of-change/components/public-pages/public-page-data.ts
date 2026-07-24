import { TDM_STAGE_DESCRIPTIONS } from '../../domain/tdm-stages';

export const GUIDE_STEPS = [
  {
    number: 'Passo 1',
    title: 'Entenda a mudança',
    text: 'Nomeie o problema e o resultado desejado antes de preencher o fluxo.',
    visual: 'Problema → resultado'
  },
  {
    number: 'Passo 2',
    title: 'Levante insumos',
    text: TDM_STAGE_DESCRIPTIONS.input,
    visual: 'Equipe, orçamento, dados'
  },
  {
    number: 'Passo 3',
    title: 'Organize atividades',
    text: TDM_STAGE_DESCRIPTIONS.activity,
    visual: 'Formação e acompanhamento'
  },
  {
    number: 'Passo 4',
    title: 'Defina produtos',
    text: TDM_STAGE_DESCRIPTIONS.output,
    visual: 'Oficinas e planos'
  },
  {
    number: 'Passo 5',
    title: 'Descreva resultados',
    text: TDM_STAGE_DESCRIPTIONS.outcome,
    visual: 'Mudança observável'
  },
  {
    number: 'Passo 6',
    title: 'Conecte relações',
    text: 'Marque riscos e hipóteses nas setas que sustentam a lógica causal.',
    visual: 'R / H nas conexões'
  },
  {
    number: 'Passo 7',
    title: 'Leia a teoria final',
    text: 'Revise o fluxo completo e compartilhe a narrativa com a equipe.',
    visual: 'Relatório visual'
  }
];

export const FLOW_CONTEXT_CARDS = [
  {
    number: '01',
    title: 'Insumos iniciam o caminho',
    text: 'Recursos e capacidades entram primeiro para sustentar as ações da intervenção.'
  },
  {
    number: '02',
    title: 'Atividades transformam recursos',
    text: 'As ações organizam o uso dos insumos e aproximam a teoria dos produtos.'
  },
  {
    number: '03',
    title: 'Produtos registram entregas',
    text: 'As entregas concretas mostram o que foi realizado antes dos resultados.'
  },
  {
    number: '04',
    title: 'Resultados fecham a leitura',
    text: 'As mudanças esperadas aparecem como efeito do caminho construído pelas etapas.'
  }
] as const;

export const HOME_FEATURES = [
  {
    number: '01',
    title: 'Organizar etapas',
    description: 'Agrupe insumos, atividades, produtos e resultados em sequência legível.'
  },
  {
    number: '02',
    title: 'Evidenciar relações',
    description: 'Mostre conexões, riscos e hipóteses que sustentam o fluxo.'
  },
  {
    number: '03',
    title: 'Apresentar decisão',
    description: 'Transforme a teoria em relatório visual, não em documento seco.'
  }
] as const;

export const REFERENCE_CARDS = [
  {
    title: 'Design',
    description: 'Experiência dark, header fino, hero editorial, grade sutil e cards com presença.',
    href: '/docs/visual-experience-guidelines.md'
  },
  {
    title: 'Arquitetura Frontend',
    description: 'Rotas públicas isoladas do canvas, DS independente e feature scoped.',
    href: '/docs/frontend-architecture-guidelines.md'
  },
  {
    title: 'Teoria da Mudança',
    description: 'Etapas, conexões, riscos e hipóteses como núcleo da lógica de negócio.',
    href: '/guia-de-aprendizado'
  },
  {
    title: 'Inspirações Visuais',
    description: 'Home cinematográfica e rotas internas com scroll narrativo e motion suave.',
    href: '/'
  }
] as const;
