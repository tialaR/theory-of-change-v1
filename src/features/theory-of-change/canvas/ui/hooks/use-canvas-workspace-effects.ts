'use client';

import { useEffect } from 'react';

type UseCanvasWorkspaceEffectsOptions = {
  activeToolbarNodeId: string | null;
  relationPopoverOpen: boolean;
  selectedEdgeId: string | null;
  selectedNodeId: string | null;
  setActiveToolbarNodeId: (nodeId: string | null) => void;
  setInspectorAdvancedOpenKey: (key: null) => void;
  setRelationPopoverOpen: (open: boolean) => void;
};

export function useCanvasWorkspaceEffects({
  activeToolbarNodeId,
  relationPopoverOpen,
  selectedEdgeId,
  selectedNodeId,
  setActiveToolbarNodeId,
  setInspectorAdvancedOpenKey,
  setRelationPopoverOpen
}: UseCanvasWorkspaceEffectsOptions) {
  useEffect(() => {
    setInspectorAdvancedOpenKey(null);
  }, [selectedEdgeId, selectedNodeId, setInspectorAdvancedOpenKey]);

  useEffect(() => {
    if (!relationPopoverOpen || !selectedEdgeId) return undefined;

    function closeRelationToolbarOnOutsidePointer(event: PointerEvent) {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const popover = target.closest('[data-edge-popover]');
      const inspector = target.closest('[data-canvas-inspector]');
      const inspectorToggle = target.closest('[data-inspector-toggle]');
      const edgeAction = target.closest(
        `[data-edge-action-id="${selectedEdgeId}"]`
      );

      if (!popover && !edgeAction && !inspector && !inspectorToggle) {
        setRelationPopoverOpen(false);
      }
    }

    document.addEventListener(
      'pointerdown',
      closeRelationToolbarOnOutsidePointer,
      true
    );

    return () => {
      document.removeEventListener(
        'pointerdown',
        closeRelationToolbarOnOutsidePointer,
        true
      );
    };
  }, [relationPopoverOpen, selectedEdgeId, setRelationPopoverOpen]);

  useEffect(() => {
    if (!activeToolbarNodeId) return undefined;

    function closeToolbarOnOutsidePointer(event: PointerEvent) {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const card = target.closest(
        `[data-node-card-id="${activeToolbarNodeId}"]`
      );
      const toolbar = target.closest(
        `[data-node-toolbar-id="${activeToolbarNodeId}"]`
      );

      if (!card && !toolbar) {
        setActiveToolbarNodeId(null);
      }
    }

    document.addEventListener(
      'pointerdown',
      closeToolbarOnOutsidePointer,
      true
    );

    return () => {
      document.removeEventListener(
        'pointerdown',
        closeToolbarOnOutsidePointer,
        true
      );
    };
  }, [activeToolbarNodeId, setActiveToolbarNodeId]);
}
