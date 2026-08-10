import type { CanvasRelationKind } from '../domain/canvas-project';

export type CanvasRelationDraftInput = {
  title: string;
  description: string;
  advancedDetails: string;
};

export type CanvasRelationSaveDecision =
  | { status: 'applied'; edgeId: string; kind: CanvasRelationKind; draft: CanvasRelationDraftInput }
  | { status: 'description-required'; kind: CanvasRelationKind };

export type CanvasRelationRemovalDecision =
  | { status: 'applied'; edgeId: string }
  | { status: 'not-available' };

export type CanvasConnectionDeletionDecision =
  | { status: 'applied'; edgeId: string }
  | { status: 'not-available' };

export function prepareCanvasRelationSave(input: {
  edgeId: string;
  kind: CanvasRelationKind;
  draft: CanvasRelationDraftInput;
}): CanvasRelationSaveDecision {
  const description = input.draft.description.trim();

  if (!description) {
    return { status: 'description-required', kind: input.kind };
  }

  return {
    status: 'applied',
    edgeId: input.edgeId,
    kind: input.kind,
    draft: {
      ...input.draft,
      description
    }
  };
}

export function prepareCanvasRelationRemoval(input: {
  edgeId: string | null;
  hasPersistedRelation: boolean;
}): CanvasRelationRemovalDecision {
  if (!input.edgeId || !input.hasPersistedRelation) {
    return { status: 'not-available' };
  }

  return { status: 'applied', edgeId: input.edgeId };
}

export function prepareCanvasConnectionDeletion(
  edgeId: string | null
): CanvasConnectionDeletionDecision {
  if (!edgeId) {
    return { status: 'not-available' };
  }

  return { status: 'applied', edgeId };
}
