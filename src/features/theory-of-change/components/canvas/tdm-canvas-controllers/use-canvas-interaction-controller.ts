import { useCanvasEdgeInteraction } from './interaction/use-canvas-edge-interaction';
import { useCanvasNodeInteraction } from './interaction/use-canvas-node-interaction';
import { useCanvasPaneInteraction } from './interaction/use-canvas-pane-interaction';
import { useCanvasToolbarInteraction } from './interaction/use-canvas-toolbar-interaction';
import type { UseCanvasInteractionControllerArgs } from './interaction/types';

export function useCanvasInteractionController(args: UseCanvasInteractionControllerArgs) {
  const toolbar = useCanvasToolbarInteraction(args);
  const pane = useCanvasPaneInteraction({
    ...args,
    closeToolbarSelection: toolbar.closeToolbarSelection
  });
  const node = useCanvasNodeInteraction(args);
  const edge = useCanvasEdgeInteraction(args);

  return {
    handleCloseToolbar: toolbar.handleCloseToolbar,
    handlePaneClick: pane.handlePaneClick,
    handleFlowBackgroundClick: pane.handleFlowBackgroundClick,
    focusNodeSelection: node.focusNodeSelection,
    handleNodeDoubleClick: node.handleNodeDoubleClick,
    handleNodeClick: node.handleNodeClick,
    handleEdgeClick: edge.handleEdgeClick
  };
}
