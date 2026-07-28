import { describe, expect, it } from 'vitest';
import { createCanvasProject } from '@/features/theory-of-change/canvas-workspace';
import { createCanvasResultStageSummary } from './canvas-result-summary';

describe('createCanvasResultStageSummary', () => {
  it('resume somente os nós do projeto proprietário', () => {
    const project = createCanvasProject({ id: 'result-summary' });
    project.nodes = [
      { id: 'i1', stage: 'input', title: 'Equipe', description: '', advancedDetails: '', position: { x: 0, y: 0 } },
      { id: 'a1', stage: 'activity', title: 'Oficina', description: '', advancedDetails: '', position: { x: 0, y: 0 } }
    ];

    expect(createCanvasResultStageSummary(project).map((item) => item.count)).toEqual([1, 1, 0, 0]);
  });
});
