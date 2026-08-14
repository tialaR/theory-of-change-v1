import { useCallback, type Dispatch, type SetStateAction } from 'react';
import {
  addEdge,
  type Connection,
  type FinalConnectionState,
  type IsValidConnection,
  type OnConnectEnd,
  type OnConnectStart
} from '@xyflow/react';

import { isAllowedTdmConnection } from '../../../domain/tdm-connection-rules';
import { THEORY_GUIDE_INVALID_CONNECTION } from '../../../domain/tdm-theory-guide';
import type { TdmStage } from '../../../domain/tdm-stages';
import type { TdmEdge, TdmNode } from '../../../domain/tdm-types';
import { createEdge } from '../../../utils/create-edge';

type Params = {
  canConnectNodes: boolean;
  nodes: TdmNode[];
  setEdges: Dispatch<SetStateAction<TdmEdge[]>>;
  setSelectedNodeId: Dispatch<SetStateAction<string | null>>;
  setToolbarNodeId: Dispatch<SetStateAction<string | null>>;
  setConnectingFromStage: Dispatch<SetStateAction<TdmStage | null>>;
  setGuideTransientMessage: Dispatch<SetStateAction<string | null>>;
};

export function useCanvasConnectionController({
  canConnectNodes,
  nodes,
  setEdges,
  setSelectedNodeId,
  setToolbarNodeId,
  setConnectingFromStage,
  setGuideTransientMessage
}: Params) {
  const isValidConnection: IsValidConnection<TdmEdge> = useCallback(
    (connection) => {
      if (!canConnectNodes || !connection.source || !connection.target) return false;
      const sourceNode = nodes.find((node) => node.id === connection.source);
      const targetNode = nodes.find((node) => node.id === connection.target);
      return Boolean(sourceNode && targetNode && isAllowedTdmConnection(sourceNode.stage, targetNode.stage));
    },
    [canConnectNodes, nodes]
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      if (!canConnectNodes || !connection.source || !connection.target) return;
      const sourceNode = nodes.find((node) => node.id === connection.source);
      const targetNode = nodes.find((node) => node.id === connection.target);
      if (!sourceNode || !targetNode || !isAllowedTdmConnection(sourceNode.stage, targetNode.stage)) return;

      const nextEdge = createEdge({
        source: connection.source,
        target: connection.target,
        sourceStage: sourceNode.stage,
        targetStage: targetNode.stage
      });

      setEdges((currentEdges) => addEdge(nextEdge, currentEdges));
      setSelectedNodeId(null);
      setToolbarNodeId(null);
      setGuideTransientMessage(null);
    },
    [canConnectNodes, nodes, setEdges, setGuideTransientMessage, setSelectedNodeId, setToolbarNodeId]
  );

  const handleConnectStart: OnConnectStart = useCallback(
    (_event, params) => {
      if (!canConnectNodes || !params.nodeId) return;
      const sourceNode = nodes.find((node) => node.id === params.nodeId);
      if (!sourceNode) return;
      setConnectingFromStage(sourceNode.stage);
      setGuideTransientMessage(null);
    },
    [canConnectNodes, nodes, setConnectingFromStage, setGuideTransientMessage]
  );

  const handleConnectEnd: OnConnectEnd = useCallback(
    (_event, connectionState: FinalConnectionState) => {
      setConnectingFromStage(null);
      const fromNodeId = connectionState.fromNode?.id;
      if (!fromNodeId) return;
      const sourceNode = nodes.find((node) => node.id === fromNodeId);
      if (!sourceNode) return;
      const toNodeId = connectionState.toNode?.id;
      if (!toNodeId) {
        setGuideTransientMessage(null);
        return;
      }
      const targetNode = nodes.find((node) => node.id === toNodeId);
      if (targetNode && !isAllowedTdmConnection(sourceNode.stage, targetNode.stage)) {
        setGuideTransientMessage(THEORY_GUIDE_INVALID_CONNECTION);
      }
    },
    [nodes, setConnectingFromStage, setGuideTransientMessage]
  );

  return { isValidConnection, handleConnect, handleConnectStart, handleConnectEnd };
}
