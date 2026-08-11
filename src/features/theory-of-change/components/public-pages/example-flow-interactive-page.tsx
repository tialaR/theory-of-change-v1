import { exampleTheory } from '../../data/example-theory';
import { FlowVisionInteractiveWorkspace } from '../result-view/experience/flow-vision-interactive-workspace';

export function ExampleFlowInteractivePage() {
  return (
    <FlowVisionInteractiveWorkspace
      title={exampleTheory.title}
      nodes={exampleTheory.nodes}
      edges={exampleTheory.edges}
    />
  );
}
