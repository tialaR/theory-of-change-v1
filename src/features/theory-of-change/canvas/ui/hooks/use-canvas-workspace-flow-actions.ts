'use client';

import { useCallback } from 'react';
import type { Connection, NodeMouseHandler } from '@xyflow/react';
import type { CanvasStageNode } from '../../react-flow/canvas-flow.types';
import type { CanvasTranslator } from '../canvas-copy';
import { CANVAS_CONNECT_NOTICE_KEYS } from './canvas-connect-notices';

type CanvasUiState = ReturnType<
  typeof import('./use-canvas-ui-state').useCanvasUiState
>;

type CanvasFlowController = ReturnType<
  typeof import('./use-canvas-flow-controller').useCanvasFlowController
>;

type CanvasViewportActions = ReturnType<
  typeof import('./use-canvas-viewport-actions').useCanvasViewportActions
>;

type UseCanvasWorkspaceFlowActionsOptions = {
  flow: CanvasFlowController;
  ui: CanvasUiState;
  viewportActions: CanvasViewportActions;
  markDirty: () => void;
  t: CanvasTranslator;
};

export function useCanvasWorkspaceFlowActions({
  flow,
  ui,
  viewportActions,
  markDirty,
  t
}: UseCanvasWorkspaceFlowActionsOptions) {
  const onPaneClick = useCallback(() => {
    ui.clearSelection();
    ui.setActiveToolbarNodeId(null);
    ui.setCreatorOpen(false);
  }, [ui]);

  const onNodeClick: NodeMouseHandler<CanvasStageNode> = useCallback((_event, node) => {
    ui.selectNode(node.id);
  }, [ui]);

  const onConnect = useCallback((connection: Connection) => {
    const sourceNode = connection.source
      ? flow.nodes.find((node) => node.id === connection.source) ?? null
      : null;
    const targetNode = connection.target
      ? flow.nodes.find((node) => node.id === connection.target) ?? null
      : null;
    const noticeValues = {
      source: sourceNode?.data.title ?? t('notices.unknownBlock'),
      target: targetNode?.data.title ?? t('notices.unknownBlock')
    };

    const result = flow.connectNodes(connection);
    if (!result.ok) {
      ui.notify(t(CANVAS_CONNECT_NOTICE_KEYS[result.code], noticeValues), 'warning');
      return;
    }

    markDirty();
  }, [flow, markDirty, t, ui]);

  const onNodeDragStart = useCallback(() => {
    flow.beginNodeDrag();
  }, [flow]);

  const onNodeDragStop = useCallback(() => {
    flow.finishNodeDrag();
    markDirty();
  }, [flow, markDirty]);

  const centralizeColumns = useCallback(() => {
    flow.centralizeColumns();
    markDirty();
    ui.notify(t('notices.columns'));
    requestAnimationFrame(() => viewportActions.fitCurrentGraph());
  }, [flow, markDirty, t, ui, viewportActions]);

  const organizeFlow = useCallback(() => {
    flow.organizeFlow();
    markDirty();
    ui.notify(t('notices.organized'));
    requestAnimationFrame(() => viewportActions.fitCurrentGraph());
  }, [flow, markDirty, t, ui, viewportActions]);

  return {
    onPaneClick,
    onNodeClick,
    onConnect,
    onNodeDragStart,
    onNodeDragStop,
    centralizeColumns,
    organizeFlow
  };
}
