export type CanvasEngineInteractionNode<TStage> = {
  id: string;
  data: { stage: TStage };
};

export type CanvasEngineInteractionEdge = {
  source: string;
  target: string;
};

export type CanvasEngineConnectionCandidate = {
  source: string | null;
  target: string | null;
};

export type CanvasEngineConnectionDecision<TRelationKind, TRejectionCode extends string> =
  | { allowed: true; relationKind: TRelationKind }
  | { allowed: false; code: TRejectionCode };

export type CanvasEngineConnectionFailureCode<TRejectionCode extends string> =
  | TRejectionCode
  | 'invalid-target'
  | 'missing-cards'
  | 'duplicate-connection';

export type CanvasEngineConnectionResolution<
  TNode,
  TRelationKind,
  TRejectionCode extends string
> =
  | {
      ok: true;
      source: TNode;
      target: TNode;
      relationKind: TRelationKind;
    }
  | {
      ok: false;
      code: CanvasEngineConnectionFailureCode<TRejectionCode>;
    };

type ResolveCanvasEngineConnectionInput<
  TStage,
  TNode extends CanvasEngineInteractionNode<TStage>,
  TEdge extends CanvasEngineInteractionEdge,
  TRelationKind,
  TRejectionCode extends string
> = {
  nodes: readonly TNode[];
  edges: readonly TEdge[];
  candidate: CanvasEngineConnectionCandidate;
  evaluateTransition: (
    sourceStage: TStage,
    targetStage: TStage
  ) => CanvasEngineConnectionDecision<TRelationKind, TRejectionCode>;
};

export function resolveCanvasEngineConnection<
  TStage,
  TNode extends CanvasEngineInteractionNode<TStage>,
  TEdge extends CanvasEngineInteractionEdge,
  TRelationKind,
  TRejectionCode extends string
>({
  nodes,
  edges,
  candidate,
  evaluateTransition
}: ResolveCanvasEngineConnectionInput<
  TStage,
  TNode,
  TEdge,
  TRelationKind,
  TRejectionCode
>): CanvasEngineConnectionResolution<TNode, TRelationKind, TRejectionCode> {
  if (!candidate.source || !candidate.target || candidate.source === candidate.target) {
    return { ok: false, code: 'invalid-target' };
  }

  const source = nodes.find((node) => node.id === candidate.source);
  const target = nodes.find((node) => node.id === candidate.target);

  if (!source || !target) {
    return { ok: false, code: 'missing-cards' };
  }

  const decision = evaluateTransition(source.data.stage, target.data.stage);
  if (!decision.allowed) {
    return { ok: false, code: decision.code };
  }

  if (edges.some((edge) => edge.source === source.id && edge.target === target.id)) {
    return { ok: false, code: 'duplicate-connection' };
  }

  return {
    ok: true,
    source,
    target,
    relationKind: decision.relationKind
  };
}

export type CanvasEngineInteractionPosition = { x: number; y: number };

export type CanvasEngineDropBounds = {
  width: number;
  height: number;
  nodeWidth: number;
  nodeHeight: number;
  edgeGap: number;
  topGap: number;
  anchorOffsetX: number;
  anchorOffsetY: number;
};

export function constrainCanvasEngineDropPosition(
  position: CanvasEngineInteractionPosition,
  bounds: CanvasEngineDropBounds
): CanvasEngineInteractionPosition {
  return {
    x: Math.max(
      bounds.edgeGap,
      Math.min(
        bounds.width - bounds.nodeWidth - bounds.edgeGap,
        position.x - bounds.anchorOffsetX
      )
    ),
    y: Math.max(
      bounds.topGap,
      Math.min(
        bounds.height - bounds.nodeHeight - bounds.edgeGap,
        position.y - bounds.anchorOffsetY
      )
    )
  };
}
