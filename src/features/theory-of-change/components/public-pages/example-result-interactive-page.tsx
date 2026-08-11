import { exampleTheory } from '../../data/example-theory';
import { ResultExperience } from '../result-view/result-experience';

export function ExampleResultInteractivePage() {
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
