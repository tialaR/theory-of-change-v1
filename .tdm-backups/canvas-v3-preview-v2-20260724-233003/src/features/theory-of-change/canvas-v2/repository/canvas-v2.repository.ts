import type { CanvasDocument } from '../domain/canvas-v2.types';

export interface CanvasV2Repository {
  load(documentId: string): Promise<CanvasDocument | null>;
  save(document: CanvasDocument): Promise<CanvasDocument>;
}
