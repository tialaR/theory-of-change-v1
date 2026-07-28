'use client';

import { CANVAS_TOOLTIP_LABELS } from '../../domain/canvas-ui.constants';
import { canvasIcons as icons } from '../canvas-icons';
import styles from '../canvas-workspace/canvas-workspace.module.sass';
import { useCanvasRuntime } from '../runtime/canvas-runtime-context';

export function CanvasToolbar() {
  const runtime = useCanvasRuntime();

  if (runtime.ui.fullCanvasMode) {
    return (
      <div className={styles.fullCanvasActions} role="toolbar" aria-label="Ações do canvas completo">
        <button
          type="button"
          onClick={runtime.undo}
          disabled={!runtime.flow.canUndo}
          data-tooltip={CANVAS_TOOLTIP_LABELS.undo}
          title={CANVAS_TOOLTIP_LABELS.undo}
          aria-label={CANVAS_TOOLTIP_LABELS.undo}
        >
          {icons.undo}
        </button>
        <button
          type="button"
          onClick={runtime.redo}
          disabled={!runtime.flow.canRedo}
          data-tooltip={CANVAS_TOOLTIP_LABELS.redo}
          title={CANVAS_TOOLTIP_LABELS.redo}
          aria-label={CANVAS_TOOLTIP_LABELS.redo}
        >
          {icons.redo}
        </button>
        <button
          type="button"
          onClick={runtime.save}
          data-tooltip={CANVAS_TOOLTIP_LABELS.save}
          title={CANVAS_TOOLTIP_LABELS.save}
          aria-label={CANVAS_TOOLTIP_LABELS.save}
        >
          {icons.save}
        </button>
        <button
          type="button"
          onClick={() => runtime.ui.setFullCanvasMode(false)}
          data-tooltip={CANVAS_TOOLTIP_LABELS.closeFullCanvas}
          title={CANVAS_TOOLTIP_LABELS.closeFullCanvas}
          aria-label={CANVAS_TOOLTIP_LABELS.closeFullCanvas}
        >
          {icons.close}
        </button>
      </div>
    );
  }

  return (
    <aside className={styles.rail} aria-label="Ferramentas do canvas">
      <button type="button" data-active="true" data-tooltip={CANVAS_TOOLTIP_LABELS.select}>
        {icons.cursor}
      </button>
      <span className={styles.railDivider} />
      <button type="button" data-tooltip={CANVAS_TOOLTIP_LABELS.zoomIn} onClick={runtime.zoomIn}>
        {icons.zoomIn}
      </button>
      <button type="button" data-tooltip={CANVAS_TOOLTIP_LABELS.zoomOut} onClick={runtime.zoomOut}>
        {icons.zoomOut}
      </button>
      <button type="button" data-tooltip={CANVAS_TOOLTIP_LABELS.fit} onClick={runtime.frameVisualization}>
        {icons.fit}
      </button>
      <button
        type="button"
        data-tooltip={CANVAS_TOOLTIP_LABELS.fullCanvas}
        title={CANVAS_TOOLTIP_LABELS.fullCanvas}
        onClick={() => {
          runtime.ui.setFullCanvasMode(true);
          runtime.ui.setInspectorOpen(false);
          runtime.ui.setHistoryOpen(false);
        }}
        aria-label={CANVAS_TOOLTIP_LABELS.fullCanvas}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 9 5 5m0 0v4m0-4h4M15 9l4-4m0 0v4m0-4h-4M9 15l-4 4m0 0v-4m0 4h4M15 15l4 4m0 0v-4m0 4h-4" />
        </svg>
      </button>
    </aside>
  );
}
