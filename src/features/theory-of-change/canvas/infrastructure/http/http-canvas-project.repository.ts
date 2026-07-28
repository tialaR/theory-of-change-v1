import type { CanvasProject, CanvasProjectRepository } from '../../domain/canvas-project';
import {
  CANVAS_PROJECT_API_PATH,
  isCanvasProjectApiEnvelope,
  type CanvasProjectApiEnvelope
} from './canvas-project-api.contract';

export type HttpCanvasProjectRepositoryOptions = {
  baseUrl: string;
  fetcher?: typeof fetch;
};

export function createHttpCanvasProjectRepository(
  options: HttpCanvasProjectRepositoryOptions
): CanvasProjectRepository {
  const baseUrl = options.baseUrl.replace(/\/$/, '');

  async function readEnvelope(response: Response): Promise<CanvasProjectApiEnvelope> {
    if (!response.ok) {
      throw new Error(`Canvas API respondeu com status ${response.status}.`);
    }

    const body: unknown = await response.json();
    if (!isCanvasProjectApiEnvelope(body)) {
      throw new Error('Canvas API respondeu com um contrato inválido.');
    }
    return body;
  }

  return {
    async findById(projectId) {
      const fetcher = options.fetcher ?? globalThis.fetch;
      const response = await fetcher(`${baseUrl}${CANVAS_PROJECT_API_PATH}/${projectId}`, {
        method: 'GET',
        headers: { accept: 'application/json' },
        cache: 'no-store'
      });
      if (response.status === 404) return null;
      return (await readEnvelope(response)).data;
    },

    async save(project: CanvasProject) {
      const fetcher = options.fetcher ?? globalThis.fetch;
      const response = await fetcher(`${baseUrl}${CANVAS_PROJECT_API_PATH}/${project.id}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify(project),
        cache: 'no-store'
      });
      return (await readEnvelope(response)).data;
    }
  };
}
