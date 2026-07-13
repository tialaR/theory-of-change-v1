import { exampleTheory } from '@/features/theory-of-change/data/example-theory';
import { FlowVisionInteractiveWorkspace } from '@/features/theory-of-change/components/result-view/experience/flow-vision-interactive-workspace';

export default function VisaoDoFluxoInterativoPage() {
  return (
    <FlowVisionInteractiveWorkspace
      title={exampleTheory.title}
      nodes={exampleTheory.nodes}
      edges={exampleTheory.edges}
    />
  );
}
