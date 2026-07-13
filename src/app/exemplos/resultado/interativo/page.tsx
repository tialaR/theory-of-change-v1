import { exampleTheory } from '@/features/theory-of-change/data/example-theory';
import { ResultInteractiveWorkspace } from '@/features/theory-of-change/components/result-view/experience/result-interactive-workspace';

export default function ResultadoInterativoPage() {
  return (
    <ResultInteractiveWorkspace
      title={exampleTheory.title}
      nodes={exampleTheory.nodes}
      edges={exampleTheory.edges}
    />
  );
}
