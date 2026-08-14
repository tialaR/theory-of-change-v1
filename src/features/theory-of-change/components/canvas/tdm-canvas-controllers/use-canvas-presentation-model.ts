import { useCallback, useMemo } from 'react';

import type { TdmEdge, TdmNode } from '../../../domain/tdm-types';
import {
  CANVAS_DS_MINIMAP
} from '../tdm-canvas-config/tdm-canvas-runtime';
import {
  buildCanvasFlowEdges,
  buildCanvasFlowNodes,
  buildSidebarBlockForms,
  buildSidebarContext
} from '../tdm-canvas-view-model';
import type { CanvasEdgeViewActions } from '../tdm-canvas-view-model/canvas-flow-edges';
import type { CanvasNodeViewActions } from '../tdm-canvas-view-model/canvas-flow-nodes';
import type { SidebarBlockFormsInput } from '../tdm-canvas-view-model/sidebar-block-forms';
import type { SidebarContextInput } from '../tdm-canvas-view-model/sidebar-context';

type CanvasPresentationModelInput = {
  nodes: TdmNode[];
  edges: TdmEdge[];
  nodeActions: CanvasNodeViewActions;
  edgeActions: CanvasEdgeViewActions;
  blockFormsInput: SidebarBlockFormsInput;
  sidebarContextInput: SidebarContextInput;
};

export function useCanvasPresentationModel({
  nodes,
  edges,
  nodeActions,
  edgeActions,
  blockFormsInput,
  sidebarContextInput
}: CanvasPresentationModelInput) {
  const flowNodes = useMemo(
    () => buildCanvasFlowNodes(nodes, nodeActions),
    [nodes, nodeActions]
  );
  const flowEdges = useMemo(
    () => buildCanvasFlowEdges(edges, edgeActions),
    [edges, edgeActions]
  );
  const blockForms = useMemo(
    () => buildSidebarBlockForms(blockFormsInput),
    [blockFormsInput]
  );
  const sidebarContext = useMemo(
    () => buildSidebarContext(sidebarContextInput),
    [sidebarContextInput]
  );
  const minimapNodeColor = useCallback((node: TdmNode) => CANVAS_DS_MINIMAP[node.stage].fill, []);
  const minimapNodeStrokeColor = useCallback((node: TdmNode) => CANVAS_DS_MINIMAP[node.stage].stroke, []);

  return { flowNodes, flowEdges, blockForms, sidebarContext, minimapNodeColor, minimapNodeStrokeColor };
}
