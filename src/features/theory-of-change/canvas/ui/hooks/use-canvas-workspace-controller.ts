'use client';

import { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import type { CanvasProject } from '../../domain/canvas-project';
import type { CanvasStageNode } from '../../react-flow/canvas-flow.types';
import { createCanvasStageCopy, type CanvasTranslator } from '../canvas-copy';
import { useCanvasWorkspaceActions } from './use-canvas-workspace-actions';
import { useCanvasWorkspaceFoundation } from './use-canvas-workspace-foundation';

export function useCanvasWorkspaceController(initialProject: CanvasProject, userName: string) {
  const translate = useTranslations('Canvas');
  const t: CanvasTranslator = useCallback((key, values) => translate(key, values), [translate]);
  const stageCopy = useCallback((stage: CanvasStageNode['data']['stage']) => createCanvasStageCopy(t, stage), [t]);
  const duplicateTitle = useCallback((title: string) => t('node.duplicateTitle', { title }), [t]);

  const foundation = useCanvasWorkspaceFoundation({
    initialProject,
    t,
    stageCopy,
    duplicateTitle
  });
  const actions = useCanvasWorkspaceActions({
    ...foundation,
    t,
    stageCopy
  });

  return {
    flow: foundation.flow,
    ui: foundation.ui,
    reactFlow: foundation.reactFlow,
    viewport: foundation.viewportActions.viewport,
    onViewportChange: foundation.viewportActions.onViewportChange,
    ...foundation.selection,
    ...actions,
    frameVisualization: foundation.viewportActions.frameVisualization,
    openInspector: foundation.viewportActions.openInspector,
    closeInspector: foundation.viewportActions.closeInspector,
    enterFullCanvas: foundation.viewportActions.enterFullCanvas,
    exitFullCanvas: foundation.viewportActions.exitFullCanvas,
    zoomIn: foundation.viewportActions.zoomIn,
    zoomOut: foundation.viewportActions.zoomOut,
    save: foundation.saveController.save,
    openResult: foundation.saveController.openResult,
    t,
    stageCopy,
    userName
  };
}

export type CanvasWorkspaceController = ReturnType<typeof useCanvasWorkspaceController>;
