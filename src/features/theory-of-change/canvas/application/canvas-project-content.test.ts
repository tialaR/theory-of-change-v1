import { describe, expect, it } from 'vitest';
import { createCanvasProject } from './create-canvas-project';
import { createCanvasProjectContentSignature } from './canvas-project-content';

describe('canvas project content signature', () => {
  it('ignora metadados de revisão e detecta mudanças reais', () => {
    const project = createCanvasProject({
      id: 'project-1',
      ownerId: 'user-1',
      title: 'Minha teoria',
      now: new Date('2026-07-28T00:00:00.000Z')
    });
    const sameContent = {
      ...project,
      revision: 9,
      updatedAt: '2026-07-28T01:00:00.000Z'
    };
    const changedContent = {
      ...sameContent,
      title: 'Minha teoria atualizada'
    };

    expect(createCanvasProjectContentSignature(sameContent)).toBe(
      createCanvasProjectContentSignature(project)
    );
    expect(createCanvasProjectContentSignature(changedContent)).not.toBe(
      createCanvasProjectContentSignature(project)
    );
  });
});
