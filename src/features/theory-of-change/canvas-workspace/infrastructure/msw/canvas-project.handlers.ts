import { http, HttpResponse } from 'msw';
import { CANVAS_PROJECT_API_PATH } from '../http/canvas-project-api.contract';
import type { CanvasProject } from '../../domain/canvas-project';
import { canvasProjectMockStore } from './canvas-project.mock-store';

const endpoint = `*${CANVAS_PROJECT_API_PATH}/:projectId`;

export const canvasProjectHandlers = [
  http.get(endpoint, ({ params }) => {
    const project = canvasProjectMockStore.read(String(params.projectId));
    if (!project) {
      return HttpResponse.json(
        { error: { code: 'canvas-project-not-found', message: 'Projeto não encontrado.' } },
        { status: 404 }
      );
    }
    return HttpResponse.json({
      data: project,
      meta: { requestId: crypto.randomUUID(), schemaVersion: 1 }
    });
  }),
  http.put(endpoint, async ({ request, params }) => {
    const body = (await request.json()) as CanvasProject;
    if (body.id !== String(params.projectId)) {
      return HttpResponse.json(
        { error: { code: 'canvas-project-id-mismatch', message: 'Identificador divergente.' } },
        { status: 409 }
      );
    }
    const project = canvasProjectMockStore.write(body);
    return HttpResponse.json({
      data: project,
      meta: { requestId: crypto.randomUUID(), schemaVersion: 1 }
    });
  })
];
