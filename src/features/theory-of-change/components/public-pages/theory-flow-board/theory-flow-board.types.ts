import type { TdmEdge, TdmNode } from '../../../domain/tdm-types';

export type TheoryFlowBoardProps = {
  nodes: TdmNode[];
  edges: TdmEdge[];
  mode: 'preview' | 'interactive';
  selectedNodeId?: string | null;
  onSelectNode?: (nodeId: string) => void;
  zoom?: number;
};
