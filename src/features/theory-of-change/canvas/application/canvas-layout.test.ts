import { describe, expect, it } from 'vitest';
import { centralizeCanvasColumns } from './canvas-layout';
import { CANVAS_COLUMN_X, CANVAS_DIMENSIONS } from '../domain/canvas-ui.constants';
import type { CanvasLayoutNode } from './canvas-layout';

type TestLayoutNode = CanvasLayoutNode & { type: 'canvas-stage'; data: CanvasLayoutNode['data'] & { title: string; description: string; advancedDetails: string } };

const nodes: TestLayoutNode[] = [
  {
    id: 'input-2',
    type: 'canvas-stage',
    position: { x: 500, y: 400 },
    data: { stage: 'input', title: 'B', description: '', advancedDetails: '' }
  },
  {
    id: 'input-1',
    type: 'canvas-stage',
    position: { x: 400, y: 100 },
    data: { stage: 'input', title: 'A', description: '', advancedDetails: '' }
  }
];

describe('centralizeCanvasColumns', () => {
  it('mantém a ordem vertical e posiciona cada etapa na própria coluna', () => {
    const result = centralizeCanvasColumns(nodes);
    const expectedGap = CANVAS_DIMENSIONS.nodeHeight + 42;

    expect(result.find((node) => node.id === 'input-1')?.position).toEqual({
      x: CANVAS_COLUMN_X.input,
      y: CANVAS_DIMENSIONS.columnStartY
    });
    expect(result.find((node) => node.id === 'input-2')?.position).toEqual({
      x: CANVAS_COLUMN_X.input,
      y: CANVAS_DIMENSIONS.columnStartY + expectedGap
    });
  });
});
