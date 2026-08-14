import type { TdmEdge, TdmNode } from '@/features/theory-of-change/domain/tdm-types';
import { prepareNarrativeGraph } from './narrative-mapping/theory-graph-traversal';
import { assembleTheoryDocument } from './narrative-mapping/theory-document-assembly';
import type {
  TheoryDocumentModel,
  TheoryNarrativeSelection
} from './theory-narrative.types';

/**
 * Deterministic document ViewModel for the Intérprete V2.3.
 * Source: 03-MOTOR-NARRATIVO-DETERMINISTICO-V2.3.md
 */
export function buildTheoryNarrativeDocument(
  selection: TheoryNarrativeSelection,
  nodes: TdmNode[],
  edges: TdmEdge[],
  options?: { includeReferencesPage?: boolean }
): TheoryDocumentModel | null {
  const prepared = prepareNarrativeGraph(selection, nodes, edges);
  if (!prepared) {
    return null;
  }

  return assembleTheoryDocument({
    scope: prepared.scope,
    graph: prepared.graph,
    selection,
    includeReferencesPage: options?.includeReferencesPage ?? false
  });
}

/** Alias for clarity in newer call sites. */
export const buildTheoryDocument = buildTheoryNarrativeDocument;
