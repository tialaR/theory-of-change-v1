import type { CanvasProject } from '../../domain/canvas-project';

export const CANVAS_PROJECTS_RESOURCE = '/api/v1/users';

export type CanvasProjectApiEnvelope = {
  data: CanvasProject;
  meta: { requestId: string; schemaVersion: 2 };
};

export type CanvasProjectListApiEnvelope = {
  data: CanvasProject[];
  meta: { requestId: string; schemaVersion: 2; total: number };
};

export function canvasProjectCollectionPath(ownerId: string) {
  return `${CANVAS_PROJECTS_RESOURCE}/${ownerId}/canvas-projects`;
}

export function canvasProjectItemPath(ownerId: string, projectId: string) {
  return `${canvasProjectCollectionPath(ownerId)}/${projectId}`;
}

export function isCanvasProjectApiEnvelope(value: unknown): value is CanvasProjectApiEnvelope {
  if (!value || typeof value !== 'object') return false;
  const envelope = value as Partial<CanvasProjectApiEnvelope>;
  return Boolean(
    envelope.data?.id &&
    envelope.data?.ownerId &&
    envelope.data?.schemaVersion === 2 &&
    envelope.meta?.schemaVersion === 2
  );
}

export function isCanvasProjectListApiEnvelope(value: unknown): value is CanvasProjectListApiEnvelope {
  if (!value || typeof value !== 'object') return false;
  const envelope = value as Partial<CanvasProjectListApiEnvelope>;
  return Array.isArray(envelope.data) && envelope.meta?.schemaVersion === 2;
}
