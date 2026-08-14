/** Deterministic Portuguese grammar helpers for the V2.3 narrative motor. */

export function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function joinNaturalList(items: string[]): string {
  const clean = items.map((item) => item.trim()).filter(Boolean);
  if (clean.length === 0) {
    return '';
  }
  if (clean.length === 1) {
    return clean[0];
  }
  if (clean.length === 2) {
    return `${clean[0]} e ${clean[1]}`;
  }
  return `${clean.slice(0, -1).join(', ')} e ${clean[clean.length - 1]}`;
}

export function quoteTitle(title: string): string {
  return `“${title.trim()}”`;
}

export function stageLabel(stage: string): string {
  switch (stage) {
    case 'input':
      return 'Insumos';
    case 'activity':
      return 'Atividades';
    case 'output':
      return 'Produtos';
    case 'outcome':
      return 'Resultados';
    default:
      return stage;
  }
}

export function asSentenceFragment(value: string): string {
  const trimmed = value.replace(/\s+/gu, ' ').trim();
  if (!trimmed) {
    return '';
  }
  return /[.!?…]$/u.test(trimmed) ? trimmed : `${trimmed}.`;
}
