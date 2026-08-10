import type {
  NarrativeNodeFields,
  NarrativeParagraph,
  TheoryDocumentSection,
  TheorySourceRef
} from '../theory-narrative.types';

export type BuilderCounters = {
  paragraph: number;
  section: number;
  callout: number;
  figure: number;
};

export function nextId(counters: BuilderCounters, prefix: 'p' | 's' | 'c' | 'f'): string {
  if (prefix === 'p') {
    counters.paragraph += 1;
    return `p-${counters.paragraph}`;
  }
  if (prefix === 's') {
    counters.section += 1;
    return `s-${counters.section}`;
  }
  if (prefix === 'c') {
    counters.callout += 1;
    return `c-${counters.callout}`;
  }
  counters.figure += 1;
  return `f-${counters.figure}`;
}

export function nodeRefs(
  node: NarrativeNodeFields,
  fields: Array<'title' | 'description' | 'details' | 'notes'>
): TheorySourceRef[] {
  return fields.map((field) => ({ kind: 'node' as const, id: node.id, field }));
}

export function paragraph(
  counters: BuilderCounters,
  text: string,
  role: NarrativeParagraph['role'],
  sourceRefs: TheorySourceRef[],
  suppressIndent = false
): NarrativeParagraph | null {
  const clean = text.trim();
  if (!clean) {
    return null;
  }
  return {
    id: nextId(counters, 'p'),
    text: clean,
    role,
    sourceRefs,
    suppressIndent
  };
}

export function pushParagraph(
  list: NarrativeParagraph[],
  counters: BuilderCounters,
  text: string,
  role: NarrativeParagraph['role'],
  sourceRefs: TheorySourceRef[],
  suppressIndent = false
) {
  const item = paragraph(counters, text, role, sourceRefs, suppressIndent);
  if (item) {
    list.push(item);
  }
}

export function numberSections(
  sections: TheoryDocumentSection[],
  chapter: number
): TheoryDocumentSection[] {
  return sections.map((section, index) => ({
    ...section,
    number: `${chapter}.${index + 1}`
  }));
}
