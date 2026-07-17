import { exampleTheory } from '@/features/theory-of-change/data/example-theory';
import { ResultExperience } from '@/features/theory-of-change/components/result-view/result-experience';

export default function ResultadoInterativoPage() {
  return (
    <ResultExperience
      mode="example"
      viewModel={{
        title: exampleTheory.title,
        nodes: exampleTheory.nodes,
        edges: exampleTheory.edges
      }}
    />
  );
}
