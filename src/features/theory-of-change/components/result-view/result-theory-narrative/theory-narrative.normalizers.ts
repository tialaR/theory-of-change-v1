/** Pure text helpers for the TDM CLEAR narrative motor. Never rewrite semantics. */

export function trimField(value: string | undefined | null): string | undefined {
  if (value == null) {
    return undefined;
  }
  const trimmed = value.replace(/\s+/gu, ' ').trim();
  return trimmed ? trimmed : undefined;
}

export function stripTrailingPunctuation(value: string): string {
  return value.replace(/[.!?…]+$/u, '').trim();
}

export function ensureSentence(value: string): string {
  const trimmed = trimField(value);
  if (!trimmed) {
    return '';
  }
  return /[.!?…]$/u.test(trimmed) ? trimmed : `${trimmed}.`;
}

export function lowerFirstPreserveNames(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return trimmed;
  }

  const firstWord = trimmed.split(/\s+/u)[0] ?? '';
  if (firstWord.length <= 4 && firstWord === firstWord.toUpperCase() && /[A-ZÀ-Ü]/u.test(firstWord)) {
    return trimmed;
  }

  return trimmed.charAt(0).toLowerCase() + trimmed.slice(1);
}

export function embedField(value: string): string {
  return lowerFirstPreserveNames(stripTrailingPunctuation(value));
}

/** Normalize for semantic equality (dedupe). */
export function normalizeForCompare(value: string): string {
  return stripTrailingPunctuation(value)
    .replace(/^["“”'«»]+|["“”'«»]+$/gu, '')
    .replace(/\s+/gu, ' ')
    .trim()
    .toLocaleLowerCase('pt-BR');
}

/** Drop exact/semantic duplicate fields so description/details/notes are not repeated. */
export function dedupeLiteralFields(fields: {
  description?: string;
  details?: string;
  notes?: string;
}): {
  description?: string;
  details?: string;
  notes?: string;
} {
  const description = trimField(fields.description);
  let details = trimField(fields.details);
  let notes = trimField(fields.notes);

  const descKey = description ? normalizeForCompare(description) : '';
  const detailsKey = details ? normalizeForCompare(details) : '';
  const notesKey = notes ? normalizeForCompare(notes) : '';

  if (details && description && detailsKey === descKey) {
    details = undefined;
  }
  if (notes && description && notesKey === descKey) {
    notes = undefined;
  }
  if (notes && details && notesKey === (details ? normalizeForCompare(details) : '')) {
    notes = undefined;
  }

  return { description, details, notes };
}

/** Avoid repeating the card title when it already appears as the sole field body. */
export function omitIfSameAsTitle(value: string | undefined, title: string): string | undefined {
  if (!value) {
    return undefined;
  }
  return normalizeForCompare(value) === normalizeForCompare(title) ? undefined : value;
}

export function collapseDoublePunctuation(value: string): string {
  return value
    .replace(/([.!?…])\1+/gu, '$1')
    .replace(/\s+([.!?…])/gu, '$1')
    .replace(/\s{2,}/gu, ' ')
    .trim();
}

export function finalizeSentence(value: string): string {
  return collapseDoublePunctuation(ensureSentence(value));
}

/**
 * Deterministic pick from a closed template set.
 * Stable across renders for the same seed.
 */
export function pickTemplateIndex(seed: string, length: number): number {
  if (length <= 1) {
    return 0;
  }

  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }
  return hash % length;
}

/** Join sentence parts, omitting empties, with single spaces. */
export function joinSentenceParts(parts: Array<string | undefined | null>): string {
  return collapseDoublePunctuation(
    parts
      .map((part) => (part ? part.replace(/\s+/gu, ' ').trim() : ''))
      .filter(Boolean)
      .join(' ')
  );
}
