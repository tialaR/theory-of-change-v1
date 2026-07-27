import { describe, expect, it, vi } from 'vitest';
import { createCanvasProject } from '../../application/create-canvas-project';
import { createHttpCanvasProjectRepository } from './http-canvas-project.repository';

function createEnvelope(project: ReturnType<typeof createCanvasProject>) {
  return {
    data: project,
    meta: { requestId: 'request-1', schemaVersion: 1 as const }
  };
}

describe('HttpCanvasProjectRepository', () => {
  it('envia o documento no contrato HTTP versionado', async () => {
    const project = createCanvasProject({ id: 'project-http' });
    const fetcher = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(createEnvelope(project)), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      })
    );
    const repository = createHttpCanvasProjectRepository({
      baseUrl: 'http://localhost:3000',
      fetcher: fetcher as typeof fetch
    });

    await repository.save(project);

    expect(fetcher).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/canvas-projects/project-http',
      expect.objectContaining({ method: 'PUT' })
    );
  });

  it('retorna null quando a API responde 404', async () => {
    const repository = createHttpCanvasProjectRepository({
      baseUrl: 'http://localhost:3000',
      fetcher: vi.fn().mockResolvedValue(new Response(null, { status: 404 })) as typeof fetch
    });

    await expect(repository.findById('missing')).resolves.toBeNull();
  });
});
