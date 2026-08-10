import { useCanvasGuidePresentationController } from './stage-guide/use-canvas-guide-presentation-controller';
import { useCanvasResultAvailabilityController } from './stage-guide/use-canvas-result-availability-controller';
import { useCanvasStageProgressController } from './stage-guide/use-canvas-stage-progress-controller';
import { useCanvasTheoryCompletionLifecycle } from './stage-guide/use-canvas-theory-completion-lifecycle';
import type { UseCanvasStageGuideControllerParams } from './stage-guide/types';

export function useCanvasStageGuideController({
  nodes,
  edges,
  stageCreation,
  selectedEdge,
  clearFlowTooltipEvent,
  ...stageActions
}: UseCanvasStageGuideControllerParams) {
  const progress = useCanvasStageProgressController({
    nodes,
    stageCreation,
    ...stageActions
  });
  const availability = useCanvasResultAvailabilityController({ nodes, edges });
  const presentation = useCanvasGuidePresentationController({
    edges,
    selectedEdge,
    stageCounts: progress.stageCounts,
    stageCreation,
    canGenerateResult: availability.canGenerateResult
  });

  useCanvasTheoryCompletionLifecycle({
    canGenerateResult: availability.canGenerateResult,
    showFlowTooltip: stageActions.showFlowTooltip,
    clearFlowTooltipEvent
  });

  return {
    ...progress,
    ...availability,
    ...presentation
  };
}
