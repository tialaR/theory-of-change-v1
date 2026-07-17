import { joinNaturalList, pluralize, quoteTitle } from './theory-narrative.grammar';
import {
  dedupeLiteralFields,
  embedField,
  finalizeSentence,
  joinSentenceParts,
  omitIfSameAsTitle,
  trimField
} from './theory-narrative.normalizers';
import type { NarrativeNodeFields, TheoryReference } from './theory-narrative.types';

/**
 * Deterministic V2.3 narrative templates.
 * Source: 03-MOTOR-NARRATIVO-DETERMINISTICO-V2.3.md
 * Never invent facts. Never use AI.
 */

export const NARRATIVE_TITLES = {
  macro: 'Narrativa da teoria',
  scoped: 'Narrativa do fluxo selecionado'
} as const;

export const NARRATIVE_LABELS = {
  risk: 'Risco',
  hypothesis: 'Hipótese',
  kicker: 'Intérprete da teoria',
  close: 'Recolher intérprete',
  open: 'Abrir Intérprete da teoria',
  references: 'REFERÊNCIAS'
} as const;

/** Methodological and editorial references actually used by the V2.3 standard. */
export const CLEAR_METHODOLOGICAL_REFERENCES: TheoryReference[] = [
  {
    id: 'ref-clear-infografico',
    text: 'FGV EESP CLEAR. Infográfico: Teoria da mudança. São Paulo, 2021.'
  },
  {
    id: 'ref-clear-guia',
    text: 'FGV EESP CLEAR. Guia de Monitoramento e Avaliação de Políticas Públicas. São Paulo, 2025.'
  },
  {
    id: 'ref-manual-redacao',
    text: 'BRASIL. Presidência da República. Manual de Redação da Presidência da República. Brasília, DF.'
  },
  {
    id: 'ref-gov-ux-writing',
    text: 'BRASIL. Padrão Digital de Governo. Princípios de UX Writing.'
  },
  {
    id: 'ref-nbr-14724',
    text: 'ASSOCIAÇÃO BRASILEIRA DE NORMAS TÉCNICAS. NBR 14724: informação e documentação — trabalhos acadêmicos — apresentação. Rio de Janeiro: ABNT, 2024. Citada como referência de apresentação, sem afirmar certificação.'
  },
  {
    id: 'ref-normaliza-ifb',
    text: 'INSTITUTO FEDERAL DE BRASÍLIA. NORMALIZA IFB: Manual de Normalização de Trabalhos Acadêmicos. Brasília, DF, 2025. Utilizado para interpretação pública da NBR 14724:2024.'
  }
];

/** Scoped export keeps the primary methodological references. */
export const CLEAR_SCOPED_EXPORT_REFERENCES: TheoryReference[] = [
  CLEAR_METHODOLOGICAL_REFERENCES[0],
  CLEAR_METHODOLOGICAL_REFERENCES[1]
];

const FIGURE_SOURCE_CLEAR =
  'Fonte: elaboração própria com base nos dados registrados na teoria e na estrutura metodológica do FGV EESP CLEAR.';

const FIGURE_SOURCE_THEORY =
  'Fonte: elaboração própria com base nos dados registrados na teoria.';

export const FIGURE_SOURCES = {
  overview: FIGURE_SOURCE_CLEAR,
  resources: FIGURE_SOURCE_THEORY,
  convergence: FIGURE_SOURCE_THEORY,
  selectedPath: FIGURE_SOURCE_THEORY
} as const;

export function fieldAsSentence(value: string | undefined): string {
  const trimmed = trimField(value);
  if (!trimmed) {
    return '';
  }
  return finalizeSentence(trimmed);
}

export function buildNodeBodyParagraph(
  node: NarrativeNodeFields,
  leads: {
    description?: string;
    details: string;
    notes: string;
  }
): { text: string; fieldsUsed: Array<'description' | 'details' | 'notes'> } {
  const deduped = dedupeLiteralFields({
    description: omitIfSameAsTitle(trimField(node.description), node.title),
    details: omitIfSameAsTitle(trimField(node.details), node.title),
    notes: omitIfSameAsTitle(trimField(node.notes), node.title)
  });

  const parts: string[] = [];
  const fieldsUsed: Array<'description' | 'details' | 'notes'> = [];

  if (deduped.description) {
    const body = embedField(deduped.description);
    if (leads.description) {
      parts.push(finalizeSentence(`${leads.description} ${body}`));
    } else if (node.stage === 'input') {
      parts.push(finalizeSentence(`Esse recurso é descrito como ${body}`));
    } else if (node.stage === 'activity') {
      parts.push(finalizeSentence(`A atividade consiste em ${body}`));
    } else if (node.stage === 'output') {
      parts.push(finalizeSentence(`Essa entrega corresponde a ${body}`));
    } else {
      parts.push(finalizeSentence(`A mudança esperada é descrita como ${body}`));
    }
    fieldsUsed.push('description');
  }

  if (deduped.details) {
    parts.push(finalizeSentence(`${leads.details} ${embedField(deduped.details)}`));
    fieldsUsed.push('details');
  }

  if (deduped.notes) {
    parts.push(finalizeSentence(`${leads.notes} ${embedField(deduped.notes)}`));
    fieldsUsed.push('notes');
  }

  const text = joinSentenceParts(parts);
  return { text, fieldsUsed };
}

export function inputOpeningParagraph(node: NarrativeNodeFields): {
  text: string;
  fieldsUsed: Array<'title' | 'description' | 'details' | 'notes'>;
} {
  const body = buildNodeBodyParagraph(node, {
    details: 'Em termos operacionais,',
    notes: 'Como observação complementar,'
  });
  const text = joinSentenceParts([
    `O percurso registrado parte do insumo ${quoteTitle(node.title)}.`,
    body.text
  ]);
  return {
    text,
    fieldsUsed: ['title', ...body.fieldsUsed]
  };
}

export function inputToActivityParagraph(
  activity: NarrativeNodeFields
): {
  text: string;
  fieldsUsed: Array<'title' | 'description' | 'details' | 'notes'>;
} {
  const body = buildNodeBodyParagraph(activity, {
    details: 'Na execução,',
    notes: 'A nota associada registra'
  });
  const text = joinSentenceParts([
    `Esses recursos sustentam a realização da atividade ${quoteTitle(activity.title)}.`,
    body.text
  ]);
  return {
    text,
    fieldsUsed: ['title', ...body.fieldsUsed]
  };
}

export function activityToProductParagraph(
  activityTitle: string,
  product: NarrativeNodeFields
): {
  text: string;
  fieldsUsed: Array<'title' | 'description' | 'details' | 'notes'>;
} {
  const body = buildNodeBodyParagraph(product, {
    details: 'O detalhamento registrado informa que',
    notes: 'Como registro adicional,'
  });
  const text = joinSentenceParts([
    `Na sequência, a atividade ${quoteTitle(activityTitle)} se relaciona ao produto ${quoteTitle(product.title)}.`,
    body.text
  ]);
  return {
    text,
    fieldsUsed: ['title', ...body.fieldsUsed]
  };
}

export function productToResultParagraph(
  productTitle: string,
  result: NarrativeNodeFields
): {
  text: string;
  fieldsUsed: Array<'title' | 'description' | 'details' | 'notes'>;
} {
  const body = buildNodeBodyParagraph(result, {
    description: 'A mudança esperada é descrita como',
    details: 'Em termos de efeito esperado,',
    notes: 'A observação final registra'
  });
  const text = joinSentenceParts([
    `O produto ${quoteTitle(productTitle)} se conecta ao resultado esperado ${quoteTitle(result.title)}.`,
    body.text
  ]);
  return {
    text,
    fieldsUsed: ['title', ...body.fieldsUsed]
  };
}

export function riskTransitionSentence(sourceTitle: string, targetTitle: string): string {
  return finalizeSentence(
    `A transição entre ${quoteTitle(sourceTitle)} e ${quoteTitle(targetTitle)} registra o risco abaixo, que deve permanecer associado a essa passagem`
  );
}

export function hypothesisTransitionSentence(productTitle: string, resultTitle: string): string {
  return finalizeSentence(
    `A passagem entre ${quoteTitle(productTitle)} e ${quoteTitle(resultTitle)} depende da hipótese registrada abaixo`
  );
}

export function branchParagraph(sourceTitle: string, targetTitles: string[]): string {
  return finalizeSentence(
    `A partir de ${quoteTitle(sourceTitle)}, o desenho se desdobra em ${targetTitles.length} caminhos: ${joinNaturalList(targetTitles.map(quoteTitle))}. Cada conexão é descrita separadamente para preservar os riscos e as condições registradas em cada passagem`
  );
}

export function convergenceParagraph(sourceTitles: string[], targetTitle: string, edgeCount: number): string {
  return finalizeSentence(
    `Os caminhos que partem de ${joinNaturalList(sourceTitles.map(quoteTitle))} convergem em ${quoteTitle(targetTitle)}. No diagrama, essa convergência reúne ${pluralize(edgeCount, 'conexão registrada', 'conexões registradas')} para o mesmo destino`
  );
}

export function disconnectedParagraph(title: string, stageLabelText: string): string {
  return finalizeSentence(
    `O bloco ${quoteTitle(title)} está registrado na etapa ${stageLabelText}, mas não possui conexão no escopo atual. Por essa razão, ele é apresentado como elemento ainda não integrado ao encadeamento narrado`
  );
}

export function readingOrientationParagraph(): string {
  return finalizeSentence(
    'A leitura a seguir descreve o encadeamento registrado no diagrama. Ela preserva os textos informados nos blocos e apresenta riscos e hipóteses no ponto em que condicionam cada transição. O documento explica o desenho esperado da teoria; não comprova que as ações foram executadas ou que o resultado já foi alcançado'
  );
}

export function macroExecutiveSummary(params: {
  inputsCount: number;
  activitiesCount: number;
  productsCount: number;
  resultsCount: number;
  edgeCount: number;
  riskCount: number;
  hypothesisCount: number;
  inputTitles: string[];
  activityTitles: string[];
  productTitles: string[];
  resultTitle: string;
}): string {
  const parts = [
    `Esta teoria organiza ${pluralize(params.inputsCount, 'insumo', 'insumos')}, ${pluralize(params.activitiesCount, 'atividade', 'atividades')}, ${pluralize(params.productsCount, 'produto', 'produtos')} e ${pluralize(params.resultsCount, 'resultado', 'resultados')} em ${pluralize(params.edgeCount, 'conexão', 'conexões')}.`,
    `O desenho registra ${pluralize(params.riskCount, 'risco', 'riscos')} nas duas primeiras passagens da cadeia e ${pluralize(params.hypothesisCount, 'hipótese', 'hipóteses')} na transição entre produtos e resultados.`
  ];

  if (params.inputTitles.length > 0 || params.activityTitles.length > 0 || params.productTitles.length > 0 || params.resultTitle) {
    parts.push(
      finalizeSentence(
        `O percurso parte de ${joinNaturalList(params.inputTitles.map(quoteTitle)) || 'os insumos registrados'}, organiza-se nas atividades ${joinNaturalList(params.activityTitles.map(quoteTitle)) || 'registradas'}, gera os produtos ${joinNaturalList(params.productTitles.map(quoteTitle)) || 'registrados'} e converge no resultado esperado ${quoteTitle(params.resultTitle || 'não informado')}`
      )
    );
  }

  return joinSentenceParts(parts);
}

export function macroConclusion(params: {
  inputTitles: string[];
  activityTitles: string[];
  productTitles: string[];
  resultTitle: string;
  riskCount: number;
  hypothesisCount: number;
}): string {
  return finalizeSentence(
    `Em síntese, o documento descreve como os insumos ${joinNaturalList(params.inputTitles.map(quoteTitle)) || 'registrados'} se articulam às atividades ${joinNaturalList(params.activityTitles.map(quoteTitle)) || 'registradas'}, aos produtos ${joinNaturalList(params.productTitles.map(quoteTitle)) || 'registrados'} e ao resultado esperado ${quoteTitle(params.resultTitle || 'não informado')}. O percurso contém ${pluralize(params.riskCount, 'risco', 'riscos')} e ${pluralize(params.hypothesisCount, 'hipótese', 'hipóteses')}, apresentados nas transições em que foram registrados. Essa leitura representa o encadeamento esperado da teoria e não constitui comprovação de execução ou de alcance do resultado`
  );
}

export function scopedIntroduction(startTitle: string, endTitle: string): string {
  if (startTitle === endTitle) {
    return finalizeSentence(
      `Este recorte acompanha o elemento ${quoteTitle(startTitle)} e suas ligações registradas no diagrama`
    );
  }
  return finalizeSentence(
    `Este recorte acompanha o caminho que liga ${quoteTitle(startTitle)} a ${quoteTitle(endTitle)}`
  );
}

export function scopedConclusion(startTitle: string, endTitle: string, riskCount: number, hypothesisCount: number): string {
  return finalizeSentence(
    `Em síntese, o recorte descreve o encadeamento esperado entre ${quoteTitle(startTitle)} e ${quoteTitle(endTitle)}, com ${pluralize(riskCount, 'risco', 'riscos')} e ${pluralize(hypothesisCount, 'hipótese', 'hipóteses')} nas transições em que foram registrados. O documento não constitui comprovação de execução ou de alcance do resultado`
  );
}
