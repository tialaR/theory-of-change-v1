import { http, HttpResponse } from 'msw';
import type { CanvasProject, CanvasProjectPatch } from '../../domain/canvas-project';
import { canvasProjectMockStore } from '../memory/canvas-project.mock-store';

const collectionEndpoint = '*/api/v1/users/:ownerId/canvas-projects';
const itemEndpoint = '*/api/v1/users/:ownerId/canvas-projects/:projectId';

function itemEnvelope(data: CanvasProject) {
  return { data, meta: { requestId: crypto.randomUUID(), schemaVersion: 2 as const } };
}

function ownerMismatch() {
  return HttpResponse.json(
    { error: { code: 'canvas-project-owner-mismatch', message: 'Projeto não pertence ao usuário informado.' } },
    { status: 409 }
  );
}

export const canvasProjectHandlers = [
  http.get(collectionEndpoint, ({ params }) => {
    const projects = canvasProjectMockStore.list(String(params.ownerId));
    return HttpResponse.json({
      data: projects,
      meta: { requestId: crypto.randomUUID(), schemaVersion: 2 as const, total: projects.length }
    });
  }),
  http.post(collectionEndpoint, async ({ request, params }) => {
    const ownerId = String(params.ownerId);
    const body = (await request.json()) as CanvasProject;
    if (body.ownerId !== ownerId) return ownerMismatch();
    const project = canvasProjectMockStore.create(ownerId, body);
    if (!project) {
      return HttpResponse.json(
        { error: { code: 'canvas-project-conflict', message: 'Projeto já existe.' } },
        { status: 409 }
      );
    }
    return HttpResponse.json(itemEnvelope(project), { status: 201 });
  }),
  http.get(itemEndpoint, ({ params }) => {
    const project = canvasProjectMockStore.read(String(params.ownerId), String(params.projectId));
    if (!project) {
      return HttpResponse.json(
        { error: { code: 'canvas-project-not-found', message: 'Projeto não encontrado.' } },
        { status: 404 }
      );
    }
    return HttpResponse.json(itemEnvelope(project));
  }),
  http.put(itemEndpoint, async ({ request, params }) => {
    const ownerId = String(params.ownerId);
    const projectId = String(params.projectId);
    const body = (await request.json()) as CanvasProject;
    if (body.ownerId !== ownerId || body.id !== projectId) return ownerMismatch();
    const project = canvasProjectMockStore.replace(ownerId, body);
    if (!project) return HttpResponse.json({ error: { code: 'not-found' } }, { status: 404 });
    return HttpResponse.json(itemEnvelope(project));
  }),
  http.patch(itemEndpoint, async ({ request, params }) => {
    const project = canvasProjectMockStore.patch(
      String(params.ownerId),
      String(params.projectId),
      (await request.json()) as CanvasProjectPatch
    );
    if (!project) return HttpResponse.json({ error: { code: 'not-found' } }, { status: 404 });
    return HttpResponse.json(itemEnvelope(project));
  }),
  http.delete(itemEndpoint, ({ params }) => {
    const removed = canvasProjectMockStore.delete(String(params.ownerId), String(params.projectId));
    return new HttpResponse(null, { status: removed ? 204 : 404 });
  })
];
