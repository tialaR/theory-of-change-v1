import { afterEach, describe, expect, it } from 'vitest';
import { createCanvasProject } from '@/features/theory-of-change/canvas/application/create-canvas-project';
import { canvasProjectMockStore } from '@/features/theory-of-change/canvas/infrastructure/memory/canvas-project.mock-store';
import { authMockStore } from './auth.mock-store';

afterEach(() => {
  authMockStore.clearSessions();
  canvasProjectMockStore.clear();
});

describe('isolated demo access', () => {
  it('creates one owner per visitor and never shares Canvas state between demo sessions', () => {
    const demoA = authMockStore.createDemoSession();
    const demoB = authMockStore.createDemoSession();

    expect(demoA.user.id).not.toBe(demoB.user.id);
    expect(demoA.session.id).not.toBe(demoB.session.id);
    expect(demoA.user.accessMode).toBe('demo');
    expect(demoB.user.accessMode).toBe('demo');

    const projectA = createCanvasProject({
      id: 'primary',
      ownerId: demoA.user.id,
      title: 'Canvas A'
    });
    const projectB = createCanvasProject({
      id: 'primary',
      ownerId: demoB.user.id,
      title: 'Canvas B'
    });

    canvasProjectMockStore.create(demoA.user.id, projectA);
    canvasProjectMockStore.create(demoB.user.id, projectB);
    canvasProjectMockStore.patch(demoA.user.id, projectA.id, { title: 'Canvas A editado' });

    expect(canvasProjectMockStore.read(demoA.user.id, projectA.id)?.title).toBe('Canvas A editado');
    expect(canvasProjectMockStore.read(demoB.user.id, projectB.id)?.title).toBe('Canvas B');
  });
});
