import type {
  CanvasProject,
  CanvasProjectPatch,
  CanvasProjectRepository
} from '../../domain/canvas-project';
import {
  canvasProjectCollectionPath,
  canvasProjectItemPath,
  isCanvasProjectApiEnvelope,
  isCanvasProjectListApiEnvelope,
  type CanvasProjectApiEnvelope,
  type CanvasProjectListApiEnvelope
} from './canvas-project-api.contract';

export type HttpCanvasProjectRepositoryOptions = {
  baseUrl: string;
  fetcher?: typeof fetch;
};

export function createHttpCanvasProjectRepository(
  options: HttpCanvasProjectRepositoryOptions
): CanvasProjectRepository {
  const baseUrl = options.baseUrl.replace(/\/$/, '');
  const fetcher = options.fetcher ?? globalThis.fetch;

  async function readItem(response: Response): Promise<CanvasProjectApiEnvelope> {
    if (!response.ok) throw new Error(`Canvas API respondeu com status ${response.status}.`);
    const body: unknown = await response.json();
    if (!isCanvasProjectApiEnvelope(body)) throw new Error('Canvas API respondeu com contrato inválido.');
    return body;
  }

  async function readList(response: Response): Promise<CanvasProjectListApiEnvelope> {
    if (!response.ok) throw new Error(`Canvas API respondeu com status ${response.status}.`);
    const body: unknown = await response.json();
    if (!isCanvasProjectListApiEnvelope(body)) throw new Error('Canvas API respondeu com lista inválida.');
    return body;
  }

  async function requestItem(method: string, ownerId: string, projectId: string, body?: unknown) {
    const response = await fetcher(`${baseUrl}${canvasProjectItemPath(ownerId, projectId)}`, {
      method,
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: 'no-store'
    });
    return response;
  }

  return {
    async listByOwner(ownerId) {
      const response = await fetcher(`${baseUrl}${canvasProjectCollectionPath(ownerId)}`, {
        method: 'GET',
        headers: { accept: 'application/json' },
        cache: 'no-store'
      });
      return (await readList(response)).data;
    },

    async findById(ownerId, projectId) {
      const response = await requestItem('GET', ownerId, projectId);
      if (response.status === 404) return null;
      return (await readItem(response)).data;
    },

    async create(ownerId, project) {
      const response = await fetcher(`${baseUrl}${canvasProjectCollectionPath(ownerId)}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify(project),
        cache: 'no-store'
      });
      return (await readItem(response)).data;
    },

    async replace(ownerId, project) {
      return (await readItem(await requestItem('PUT', ownerId, project.id, project))).data;
    },

    async patch(ownerId, projectId, patch: CanvasProjectPatch) {
      return (await readItem(await requestItem('PATCH', ownerId, projectId, patch))).data;
    },

    async delete(ownerId, projectId) {
      const response = await requestItem('DELETE', ownerId, projectId);
      if (!response.ok && response.status !== 404) {
        throw new Error(`Canvas API respondeu com status ${response.status}.`);
      }
    }
  };
}
