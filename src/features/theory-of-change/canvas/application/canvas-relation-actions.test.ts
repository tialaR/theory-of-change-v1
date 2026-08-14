import { describe, expect, it } from 'vitest';
import {
  prepareCanvasConnectionDeletion,
  prepareCanvasRelationRemoval,
  prepareCanvasRelationSave
} from './canvas-relation-actions';

describe('canvas relation actions', () => {
  it('rejects blank descriptions without leaking translated copy into Application', () => {
    expect(prepareCanvasRelationSave({
      edgeId: 'edge-1',
      kind: 'risk',
      draft: { title: 'Risco', description: '   ', advancedDetails: '' }
    })).toEqual({ status: 'description-required', kind: 'risk' });
  });

  it('normalizes the description and returns an executable save command', () => {
    expect(prepareCanvasRelationSave({
      edgeId: 'edge-1',
      kind: 'hypothesis',
      draft: { title: 'Hipótese', description: '  Evidência causal  ', advancedDetails: 'Detalhes' }
    })).toEqual({
      status: 'applied',
      edgeId: 'edge-1',
      kind: 'hypothesis',
      draft: { title: 'Hipótese', description: 'Evidência causal', advancedDetails: 'Detalhes' }
    });
  });

  it('only allows marker removal when a persisted relation exists', () => {
    expect(prepareCanvasRelationRemoval({ edgeId: 'edge-1', hasPersistedRelation: false }))
      .toEqual({ status: 'not-available' });
    expect(prepareCanvasRelationRemoval({ edgeId: 'edge-1', hasPersistedRelation: true }))
      .toEqual({ status: 'applied', edgeId: 'edge-1' });
  });

  it('keeps connection deletion distinct from marker removal', () => {
    expect(prepareCanvasConnectionDeletion(null)).toEqual({ status: 'not-available' });
    expect(prepareCanvasConnectionDeletion('edge-1')).toEqual({ status: 'applied', edgeId: 'edge-1' });
  });
});
