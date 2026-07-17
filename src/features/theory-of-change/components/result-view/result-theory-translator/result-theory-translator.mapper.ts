import type { TdmEdge, TdmNode } from '@/features/theory-of-change/domain/tdm-types';
import { buildTheoryNarrativeDocument } from '../result-theory-narrative/theory-narrative.mapper';
import type {
  TheoryDocumentModel,
  TheoryNarrativeSelection
} from '../result-theory-narrative/theory-narrative.types';

/**
 * Shared ViewModel builder for example + canvas Intérprete.
 * Reconstruct only when nodes/edges/selection change — never on camera/scroll.
 */
export function buildTheoryTranslatorViewModel(
  selection: TheoryNarrativeSelection,
  nodes: TdmNode[],
  edges: TdmEdge[],
  options?: { includeReferencesPage?: boolean }
): TheoryDocumentModel | null {
  return buildTheoryNarrativeDocument(selection, nodes, edges, options);
}
