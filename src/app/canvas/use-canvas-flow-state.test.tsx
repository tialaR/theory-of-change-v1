/** @vitest-environment jsdom */
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { CanvasNode } from './canvas-workspace.model';
import { useCanvasFlowState } from './use-canvas-flow-state';

const initialNode: CanvasNode = {
  id: 'node-input-1',
  stage: 'input' as const,
  title: 'Equipe',
  description: 'Equipe técnica',
  advancedDetails: '',
  x: 120,
  y: 80
};

describe('useCanvasFlowState', () => {
  it('mantém o contrato visual legado sobre o estado do React Flow', () => {
    const { result } = renderHook(() => useCanvasFlowState([initialNode], []));

    act(() => {
      result.current.setNodes((nodes: CanvasNode[]) => nodes.map((node: CanvasNode) => ({ ...node, x: 240 })));
      result.current.setEdges([{ id: 'edge-1', source: 'node-input-1', target: 'node-activity-1' }]);
    });

    expect(result.current.nodes[0]).toMatchObject({ id: 'node-input-1', x: 240 });
    expect(result.current.edges[0]).toEqual({
      id: 'edge-1',
      source: 'node-input-1',
      target: 'node-activity-1',
      relationKind: undefined,
      relationTitle: undefined,
      relationText: undefined,
      relationAdvancedDetails: undefined
    });
  });
});
