import { describe, expect, it } from 'vitest';
import type { CanvasProject } from '../domain/canvas-project';
import { createCanvasProject } from './create-canvas-project';
import { createCanvasSaveQueue } from './canvas-save-queue';

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolver) => {
    resolve = resolver;
  });
  return { promise, resolve };
}

describe('canvas save queue', () => {
  it('serializa gravações e persiste o conteúdo mais recente depois da primeira resposta', async () => {
    const initial = createCanvasProject({
      id: 'project-1',
      ownerId: 'user-1',
      title: 'Inicial'
    });
    const first = deferred<{ project: CanvasProject }>();
    const persistedTitles: string[] = [];
    let execution = 0;

    const queue = createCanvasSaveQueue({
      initialProject: initial,
      executeSave: async (project) => {
        execution += 1;
        persistedTitles.push(project.title);
        if (execution === 1) return first.promise;
        return { project: { ...project, revision: project.revision + 1 } };
      }
    });

    const firstSave = queue.saveLatest({
      title: 'Primeira alteração',
      nodes: [],
      connections: []
    });
    const secondSave = queue.saveLatest({
      title: 'Segunda alteração',
      nodes: [],
      connections: []
    });

    await Promise.resolve();
    expect(persistedTitles).toEqual(['Primeira alteração']);
    first.resolve({ project: { ...initial, title: 'Primeira alteração', revision: 1 } });

    await firstSave;
    await secondSave;

    expect(persistedTitles).toEqual(['Primeira alteração', 'Segunda alteração']);
    expect(queue.getCurrentProject().title).toBe('Segunda alteração');
  });

  it('não cria revisão nova quando o conteúdo não mudou', async () => {
    const initial = createCanvasProject({ id: 'project-1', ownerId: 'user-1', title: 'Estável' });
    let calls = 0;
    const queue = createCanvasSaveQueue({
      initialProject: initial,
      executeSave: async (project) => {
        calls += 1;
        return { project };
      }
    });

    const result = await queue.saveLatest({
      title: initial.title,
      nodes: initial.nodes,
      connections: initial.connections
    });

    expect(result.saved).toBe(false);
    expect(calls).toBe(0);
  });
});
