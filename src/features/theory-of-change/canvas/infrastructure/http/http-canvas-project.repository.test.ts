import { describe, expect, it, vi } from 'vitest';
import { createCanvasProject } from '../../application/create-canvas-project';
import { createHttpCanvasProjectRepository } from './http-canvas-project.repository';

function itemResponse() {
  const project = createCanvasProject({ id: 'project-1', ownerId: 'user-tiala-rocha', title: 'Minha teoria da mudança' });
  return new Response(JSON.stringify({
    data: project,
    meta: { requestId: 'request-1', schemaVersion: 2 }
  }), { status: 200, headers: { 'content-type': 'application/json' } });
}

describe('createHttpCanvasProjectRepository', () => {
  it('expõe CRUD HTTP completo com owner na rota', async () => {
    const fetcher = vi.fn<typeof fetch>().mockImplementation(async (_input: RequestInfo | URL, init?: RequestInit) => {
      if (init?.method === 'DELETE') return new Response(null, { status: 204 });
      if (init?.method === 'GET' && String(_input).endsWith('/canvas-projects')) {
        return new Response(JSON.stringify({
          data: [],
          meta: { requestId: 'request-list', schemaVersion: 2, total: 0 }
        }), { status: 200, headers: { 'content-type': 'application/json' } });
      }
      return itemResponse();
    });
    const repository = createHttpCanvasProjectRepository({ baseUrl: 'http://tdm.mock.local', fetcher });
    const project = createCanvasProject({ id: 'project-1', ownerId: 'user-tiala-rocha', title: 'Minha teoria da mudança' });

    await repository.listByOwner(project.ownerId);
    await repository.findById(project.ownerId, project.id);
    await repository.create(project.ownerId, project);
    await repository.replace(project.ownerId, project);
    await repository.patch(project.ownerId, project.id, { title: 'Atualizado' });
    await repository.delete(project.ownerId, project.id);

    expect(fetcher.mock.calls.map((call) => call[1]?.method)).toEqual([
      'GET', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'
    ]);
    expect(String(fetcher.mock.calls[0]?.[0])).toContain('/users/user-tiala-rocha/canvas-projects');
  });
});
