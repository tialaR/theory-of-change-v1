import type { CanvasProject } from '../../domain/canvas-project';

export const CANVAS_PROJECT_API_VERSION = 'v1';
export const CANVAS_PROJECT_API_PATH = `/api/${CANVAS_PROJECT_API_VERSION}/canvas-projects`;

export type CanvasProjectApiEnvelope = {
  data: CanvasProject;
  meta: {
    requestId: string;
    schemaVersion: 1;
  };
};

export type CanvasProjectApiError = {
  error: {
    code: string;
    message: string;
  };
};

export function isCanvasProjectApiEnvelope(value: unknown): value is CanvasProjectApiEnvelope {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<CanvasProjectApiEnvelope>;
  return Boolean(candidate.data && candidate.meta?.schemaVersion === 1);
}
