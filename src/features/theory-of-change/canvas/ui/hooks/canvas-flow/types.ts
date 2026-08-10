import type { Dispatch, SetStateAction } from 'react';
import type { CanvasConnectionRejectionCode } from '../../../domain/canvas-connection-policy';
import type { CanvasRelationKind } from '../../../domain/canvas-project';
import type { CanvasCausalEdge, CanvasStageNode } from '../../../react-flow/canvas-flow.types';

export type SetCanvasNodes = Dispatch<SetStateAction<CanvasStageNode[]>>;
export type SetCanvasEdges = Dispatch<SetStateAction<CanvasCausalEdge[]>>;
export type CaptureCanvasSnapshot = () => void;
export type CanvasRelationDraftInput = { title: string; description: string; advancedDetails: string };
export type CanvasConnectFailureCode = CanvasConnectionRejectionCode | 'invalid-target' | 'missing-cards' | 'duplicate-connection';
export type CanvasConnectResult = { ok: true; edge: CanvasCausalEdge; relationKind: CanvasRelationKind } | { ok: false; code: CanvasConnectFailureCode };
