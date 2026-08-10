import { describe, expect, it, vi } from 'vitest';
import {
  deleteCanvasNode,
  duplicateCanvasNode,
  saveCanvasNodeDraft,
  updateSelectedCanvasNode,
  type CanvasNode
} from './canvas-node-actions';

const node: CanvasNode = {
  id: 'input-1',
  data: {
    stage: 'input',
    title: 'Equipe',
    description: 'Equipe disponível',
    advancedDetails: ''
  }
};

describe('canvas node application actions', () => {
  it('updates only when a selected node exists', () => {
    const updateNode = vi.fn();

    expect(updateSelectedCanvasNode(null, 'title', 'Novo', updateNode)).toBe(false);
    expect(updateSelectedCanvasNode(node.id, 'title', 'Novo', updateNode)).toBe(true);
    expect(updateNode).toHaveBeenCalledOnce();
    expect(updateNode).toHaveBeenCalledWith(node.id, { title: 'Novo' });
  });

  it('reports duplicate and delete command outcomes without UI concerns', () => {
    const duplicate = { ...node, id: 'input-2' };

    expect(duplicateCanvasNode(node.id, () => duplicate)).toEqual({ status: 'applied', node: duplicate });
    expect(duplicateCanvasNode('missing', () => null)).toEqual({ status: 'not-found' });
    expect(deleteCanvasNode(node.id, () => node)).toEqual({ status: 'applied', node });
    expect(deleteCanvasNode('missing', () => null)).toEqual({ status: 'not-found' });
  });

  it('merges the editor draft with the current node data before saving', () => {
    const saveNodeDraft = vi.fn();

    const result = saveCanvasNodeDraft({
      nodes: [node],
      nodeId: node.id,
      draft: { title: 'Equipe atualizada' },
      saveNodeDraft
    });

    expect(result).toEqual({ status: 'applied', node });
    expect(saveNodeDraft).toHaveBeenCalledWith(node.id, {
      ...node.data,
      title: 'Equipe atualizada'
    });
  });

  it('does not save when the draft or node is missing', () => {
    const saveNodeDraft = vi.fn();

    expect(saveCanvasNodeDraft({ nodes: [node], nodeId: node.id, draft: null, saveNodeDraft })).toEqual({ status: 'not-found' });
    expect(saveCanvasNodeDraft({ nodes: [node], nodeId: 'missing', draft: { title: 'Novo' }, saveNodeDraft })).toEqual({ status: 'not-found' });
    expect(saveNodeDraft).not.toHaveBeenCalled();
  });
});
