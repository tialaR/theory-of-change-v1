import type { CanvasStageId } from '../domain/canvas-project';

export type CanvasNodeData = {
  stage: CanvasStageId;
  title: string;
  description: string;
  advancedDetails: string;
};

export type CanvasNode = {
  id: string;
  data: CanvasNodeData;
};

export type CanvasEditableNodeField = keyof Pick<
  CanvasNodeData,
  'title' | 'description' | 'advancedDetails'
>;

export type CanvasNodeDraft = Partial<CanvasNodeData> | null;

export type CanvasNodeCommandResult<TNode extends CanvasNode> =
  | { status: 'applied'; node: TNode }
  | { status: 'not-found' };

export function updateSelectedCanvasNode(
  nodeId: string | null,
  field: CanvasEditableNodeField,
  value: string,
  updateNode: (nodeId: string, patch: Partial<CanvasNodeData>) => void
): boolean {
  if (!nodeId) {
    return false;
  }

  updateNode(nodeId, { [field]: value });
  return true;
}

export function duplicateCanvasNode<TNode extends CanvasNode>(
  nodeId: string,
  duplicateNode: (nodeId: string) => TNode | null
): CanvasNodeCommandResult<TNode> {
  const duplicate = duplicateNode(nodeId);
  return duplicate ? { status: 'applied', node: duplicate } : { status: 'not-found' };
}

export function deleteCanvasNode<TNode extends CanvasNode>(
  nodeId: string,
  deleteNode: (nodeId: string) => TNode | null
): CanvasNodeCommandResult<TNode> {
  const deleted = deleteNode(nodeId);
  return deleted ? { status: 'applied', node: deleted } : { status: 'not-found' };
}

export function saveCanvasNodeDraft<TNode extends CanvasNode>({
  nodes,
  nodeId,
  draft,
  saveNodeDraft
}: {
  nodes: TNode[];
  nodeId: string;
  draft: CanvasNodeDraft;
  saveNodeDraft: (nodeId: string, data: CanvasNodeData) => void;
}): CanvasNodeCommandResult<TNode> {
  if (!draft) {
    return { status: 'not-found' };
  }

  const node = nodes.find((item) => item.id === nodeId);
  if (!node) {
    return { status: 'not-found' };
  }

  saveNodeDraft(nodeId, {
    ...node.data,
    ...draft
  });

  return { status: 'applied', node };
}
