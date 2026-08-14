import type { CanvasProjectDocument } from '../../domain/canvas-project-migration';

export const CANVAS_PROJECTS_RESOURCE = '/api/v1/users';

export type CanvasProjectApiEnvelope = {
  data: CanvasProjectDocument;
  meta: { requestId: string; schemaVersion: 2 };
};

export type CanvasProjectListApiEnvelope = {
  data: CanvasProjectDocument[];
  meta: { requestId: string; schemaVersion: 2; total: number };
};

export function canvasProjectCollectionPath(ownerId: string) {
  return `${CANVAS_PROJECTS_RESOURCE}/${ownerId}/canvas-projects`;
}

export function canvasProjectItemPath(ownerId: string, projectId: string) {
  return `${canvasProjectCollectionPath(ownerId)}/${projectId}`;
}

type UnknownCanvasProject = {
  id?: unknown;
  ownerId?: unknown;
  schemaVersion?: unknown;
  nodes?: unknown;
  connections?: unknown;
};

function isCanvasProjectDocument(value: unknown): value is CanvasProjectDocument {
  if (!value || typeof value !== 'object') return false;
  const project = value as UnknownCanvasProject;

  return Boolean(
    typeof project.id === 'string'
    && typeof project.ownerId === 'string'
    && (project.schemaVersion === 2 || project.schemaVersion === 3)
    && Array.isArray(project.nodes)
    && Array.isArray(project.connections)
  );
}

export function isCanvasProjectApiEnvelope(value: unknown): value is CanvasProjectApiEnvelope {
  if (!value || typeof value !== 'object') return false;
  const envelope = value as Partial<CanvasProjectApiEnvelope>;
  return Boolean(
    isCanvasProjectDocument(envelope.data)
    && envelope.meta?.schemaVersion === 2
  );
}

export function isCanvasProjectListApiEnvelope(value: unknown): value is CanvasProjectListApiEnvelope {
  if (!value || typeof value !== 'object') return false;
  const envelope = value as Partial<CanvasProjectListApiEnvelope>;
  return Boolean(
    Array.isArray(envelope.data)
    && envelope.data.every(isCanvasProjectDocument)
    && envelope.meta?.schemaVersion === 2
  );
}
