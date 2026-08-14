import type { TdmEdge, TdmNode } from '@/features/theory-of-change/domain/tdm-types';
import { buildTheoryTranslatorViewModel } from '@/features/theory-of-change/components/result-view/result-theory-translator/result-theory-translator.mapper';
import type {
  TheoryDocumentModel,
  TheoryNarrativeSelection
} from '@/features/theory-of-change/components/result-view/result-theory-narrative/theory-narrative.types';

/**
 * Thin wrapper around the Intérprete ViewModel builder.
 * Does not duplicate narrative generation.
 */
export function buildTheoryExportModel(
  selection: TheoryNarrativeSelection,
  nodes: TdmNode[],
  edges: TdmEdge[],
  options?: { includeReferencesPage?: boolean }
): TheoryDocumentModel | null {
  return buildTheoryTranslatorViewModel(selection, nodes, edges, options);
}
