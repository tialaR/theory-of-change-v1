import { isAllowedTdmConnection } from '../../../domain/tdm-connection-rules';
import type { TdmStage } from '../../../domain/tdm-stages';
import type { TdmNode, TdmNodeDraft } from '../../../domain/tdm-types';

export type CanvasNodeViewActions = {
  selectedNodeId: string | null;
  toolbarNodeId: string | null;
  editingNodeId: string | null;
  connectingFromStage: TdmStage | null;
  onSelectNode: (nodeId: string) => void;
  onCloseToolbar: () => void;
  onStartInlineEdit: (nodeId: string) => void;
  onUpdateNode: (nodeId: string, payload: TdmNodeDraft) => boolean;
  onDuplicateNode: (nodeId: string) => void;
  onDeleteNode: (nodeId: string) => void;
};

export function buildCanvasFlowNodes(nodes: TdmNode[], actions: CanvasNodeViewActions): TdmNode[] {
  return nodes.map((node) => {
    const { width: _width, height: _height, style, ...nodeWithoutDimensions } = node;
    const { width: _styleWidth, height: _styleHeight, ...styleWithoutDimensions } = style ?? {};

    return {
      ...nodeWithoutDimensions,
      selected: actions.selectedNodeId === node.id,
      ...(Object.keys(styleWithoutDimensions).length > 0 ? { style: styleWithoutDimensions } : {}),
      data: {
        ...node.data,
        nodeId: node.id,
        isToolbarVisible: actions.toolbarNodeId === node.id && actions.editingNodeId !== node.id,
        isSelected: actions.selectedNodeId === node.id,
        isValidConnectionTarget:
          actions.connectingFromStage !== null && isAllowedTdmConnection(actions.connectingFromStage, node.stage),
        onSelectNode: actions.onSelectNode,
        onCloseToolbar: actions.onCloseToolbar,
        onStartInlineEdit: actions.onStartInlineEdit,
        onUpdateNode: actions.onUpdateNode,
        onDuplicateNode: actions.onDuplicateNode,
        onDeleteNode: actions.onDeleteNode
      }
    };
  });
}
