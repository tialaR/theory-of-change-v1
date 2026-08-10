'use client';

import { useCallback, useMemo } from 'react';
import {
  prepareCanvasConnectionDeletion,
  prepareCanvasRelationRemoval,
  prepareCanvasRelationSave
} from '../../application/canvas-relation-actions';
import type { CanvasRelationKind } from '../../domain/canvas-project';
import type { CanvasCausalEdge, CanvasStageNode } from '../../react-flow/canvas-flow.types';
import type { CanvasTranslator } from '../canvas-copy';
import { createRelationDraft } from './use-canvas-ui-state';

type CanvasUiState = ReturnType<
  typeof import('./use-canvas-ui-state').useCanvasUiState
>;

type CanvasFlowController = ReturnType<
  typeof import('./use-canvas-flow-controller').useCanvasFlowController
>;

type RelationDraftField =
  | 'title'
  | 'description'
  | 'advancedDetails';

type UseCanvasRelationActionsOptions = {
  selectedEdge: CanvasCausalEdge | null;
  selectedEdgeSource: CanvasStageNode | null;
  selectedEdgeTarget: CanvasStageNode | null;
  selectedRelationKind: CanvasRelationKind | null;
  relationDraft: CanvasUiState['relationDraft'];
  getRelationKind: CanvasFlowController['getRelationKind'];
  selectFlowEdge: CanvasUiState['selectEdge'];
  setRelationDraft: CanvasUiState['setRelationDraft'];
  setRelationPanelMode: CanvasUiState['setRelationPanelMode'];
  saveFlowRelation: CanvasFlowController['saveRelation'];
  removeFlowRelation: CanvasFlowController['removeRelation'];
  deleteFlowEdge: CanvasFlowController['deleteEdge'];
  clearSelection: CanvasUiState['clearSelection'];
  notify: CanvasUiState['notify'];
  markDirty: () => void;
  t: CanvasTranslator;
};

export function useCanvasRelationActions({
  selectedEdge,
  selectedEdgeSource,
  selectedEdgeTarget,
  selectedRelationKind,
  relationDraft,
  getRelationKind,
  selectFlowEdge,
  setRelationDraft,
  setRelationPanelMode,
  saveFlowRelation,
  removeFlowRelation,
  deleteFlowEdge,
  clearSelection,
  notify,
  markDirty,
  t
}: UseCanvasRelationActionsOptions) {
  const relationNoticeValues = useMemo(() => ({
    source: selectedEdgeSource?.data.title ?? t('notices.unknownBlock'),
    target: selectedEdgeTarget?.data.title ?? t('notices.unknownBlock')
  }), [selectedEdgeSource, selectedEdgeTarget, t]);

  const selectEdge = useCallback((edge: CanvasCausalEdge) => {
    const relationKind = getRelationKind(edge);

    if (!relationKind) {
      return;
    }

    selectFlowEdge(edge, relationKind);
  }, [
    getRelationKind,
    selectFlowEdge
  ]);

  const openRelationForm = useCallback(() => {
    if (!selectedEdge || !selectedRelationKind) {
      return;
    }

    setRelationDraft(
      createRelationDraft(
        selectedEdge,
        selectedRelationKind,
        t
      )
    );

    setRelationPanelMode('form');
  }, [
    selectedEdge,
    selectedRelationKind,
    setRelationDraft,
    setRelationPanelMode,
    t
  ]);

  const updateRelationDraft = useCallback((
    field: RelationDraftField,
    value: string
  ) => {
    setRelationDraft((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        [field]: value
      };
    });
  }, [setRelationDraft]);


  const cancelRelation = useCallback(() => {
    if (!selectedEdge || !selectedRelationKind) {
      return;
    }

    setRelationDraft(
      createRelationDraft(
        selectedEdge,
        selectedRelationKind,
        t
      )
    );

    setRelationPanelMode('menu');
  }, [
    selectedEdge,
    selectedRelationKind,
    setRelationDraft,
    setRelationPanelMode,
    t
  ]);

  const saveRelation = useCallback(() => {
    if (
      !selectedEdge
      || !selectedRelationKind
      || !relationDraft
    ) {
      return;
    }

    const decision = prepareCanvasRelationSave({
      edgeId: selectedEdge.id,
      kind: selectedRelationKind,
      draft: relationDraft
    });

    if (decision.status === 'description-required') {
      notify(
        decision.kind === 'risk'
          ? t('notices.riskRequired', relationNoticeValues)
          : t('notices.hypothesisRequired', relationNoticeValues),
        'warning'
      );

      return;
    }

    saveFlowRelation(decision.edgeId, decision.kind, decision.draft);

    setRelationPanelMode('menu');
    markDirty();

    notify(
      selectedRelationKind === 'risk'
        ? t('notices.riskSaved', { ...relationNoticeValues, relation: decision.draft.description })
        : t('notices.hypothesisSaved', { ...relationNoticeValues, relation: decision.draft.description })
    );
  }, [
    markDirty,
    notify,
    relationDraft,
    saveFlowRelation,
    selectedEdge,
    relationNoticeValues,
    selectedRelationKind,
    setRelationPanelMode,
    t
  ]);

  const removeRelation = useCallback(() => {
    if (!selectedRelationKind) {
      return;
    }

    const decision = prepareCanvasRelationRemoval({
      edgeId: selectedEdge?.id ?? null,
      hasPersistedRelation: Boolean(selectedEdge?.data?.relationKind)
    });

    if (decision.status === 'not-available' || !selectedEdge) {
      return;
    }

    removeFlowRelation(decision.edgeId);

    setRelationDraft(
      createRelationDraft(
        {
          ...selectedEdge,
          data: {}
        },
        selectedRelationKind,
        t
      )
    );

    setRelationPanelMode('menu');
    markDirty();
    notify(t('notices.markerRemoved', relationNoticeValues));
  }, [
    markDirty,
    notify,
    removeFlowRelation,
    selectedEdge,
    relationNoticeValues,
    selectedRelationKind,
    setRelationDraft,
    setRelationPanelMode,
    t
  ]);

  const deleteConnection = useCallback(() => {
    const decision = prepareCanvasConnectionDeletion(selectedEdge?.id ?? null);

    if (decision.status === 'not-available') {
      return;
    }

    deleteFlowEdge(decision.edgeId);
    clearSelection();
    markDirty();
    notify(t('notices.connectionDeleted', relationNoticeValues));
  }, [
    clearSelection,
    deleteFlowEdge,
    markDirty,
    notify,
    selectedEdge,
    relationNoticeValues,
    t
  ]);

  return {
    selectEdge,
    openRelationForm,
    updateRelationDraft,
    cancelRelation,
    saveRelation,
    removeRelation,
    deleteConnection
  };
}
