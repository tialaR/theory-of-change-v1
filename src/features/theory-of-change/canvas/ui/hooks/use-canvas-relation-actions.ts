'use client';

import { useCallback } from 'react';
import type { CanvasRelationKind } from '../../domain/canvas-project';
import type { CanvasCausalEdge } from '../../react-flow/canvas-flow.types';
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
  const selectEdge = useCallback((edge: CanvasCausalEdge) => {
    const relationKind = getRelationKind(edge);

    if (!relationKind) {
      return;
    }

    selectFlowEdge(edge, relationKind);
    notify(t('notices.connectionSelected'));
  }, [
    getRelationKind,
    notify,
    selectFlowEdge,
    t
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

  const saveRelation = useCallback(() => {
    if (
      !selectedEdge
      || !selectedRelationKind
      || !relationDraft
    ) {
      return;
    }

    if (!relationDraft.description.trim()) {
      notify(
        selectedRelationKind === 'risk'
          ? t('notices.riskRequired')
          : t('notices.hypothesisRequired'),
        'warning'
      );

      return;
    }

    saveFlowRelation(
      selectedEdge.id,
      selectedRelationKind,
      relationDraft
    );

    setRelationPanelMode('menu');
    markDirty();

    notify(
      selectedRelationKind === 'risk'
        ? t('notices.riskSaved')
        : t('notices.hypothesisSaved')
    );
  }, [
    markDirty,
    notify,
    relationDraft,
    saveFlowRelation,
    selectedEdge,
    selectedRelationKind,
    setRelationPanelMode,
    t
  ]);

  const removeRelation = useCallback(() => {
    if (
      !selectedEdge
      || !selectedRelationKind
      || !selectedEdge.data?.relationKind
    ) {
      return;
    }

    removeFlowRelation(selectedEdge.id);

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
    notify(t('notices.markerRemoved'));
  }, [
    markDirty,
    notify,
    removeFlowRelation,
    selectedEdge,
    selectedRelationKind,
    setRelationDraft,
    setRelationPanelMode,
    t
  ]);

  const deleteConnection = useCallback(() => {
    if (!selectedEdge) {
      return;
    }

    deleteFlowEdge(selectedEdge.id);
    clearSelection();
    markDirty();
    notify(t('notices.connectionDeleted'));
  }, [
    clearSelection,
    deleteFlowEdge,
    markDirty,
    notify,
    selectedEdge,
    t
  ]);

  return {
    selectEdge,
    openRelationForm,
    updateRelationDraft,
    saveRelation,
    removeRelation,
    deleteConnection
  };
}
