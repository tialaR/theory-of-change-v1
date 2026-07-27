// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createCanvasProject } from '../application/create-canvas-project';
import { useCanvasProjectController } from './use-canvas-project-controller';

describe('useCanvasProjectController', () => {
  it('mantém a mutação dentro do controller da feature', () => {
    const project = createCanvasProject({ id: 'project-controller' });
    const { result } = renderHook(() => useCanvasProjectController(project));

    act(() => {
      result.current.addNode({
        id: 'input-1',
        stage: 'input',
        title: 'Equipe',
        description: '',
        advancedDetails: '',
        position: { x: 0, y: 0 }
      });
    });

    expect(result.current.project.nodes).toHaveLength(1);
    expect(result.current.dirty).toBe(true);
  });
});
