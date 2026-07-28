'use client';

import { canvasIcons as icons } from '../canvas-icons';
import styles from '../canvas-workspace/canvas-workspace.module.sass';
import { useCanvasRuntime } from '../runtime/canvas-runtime-context';

export function CanvasToolbar() {
  const runtime = useCanvasRuntime();

  if (runtime.ui.fullCanvasMode) {
    return (
      <div className={styles.fullCanvasActions} role="toolbar" aria-label={runtime.t('toolbar.fullActionsLabel')}>
        <button type="button" onClick={runtime.undo} disabled={!runtime.flow.canUndo} data-tooltip={runtime.t('tooltips.undo')} title={runtime.t('tooltips.undo')} aria-label={runtime.t('tooltips.undo')}>{icons.undo}</button>
        <button type="button" onClick={runtime.redo} disabled={!runtime.flow.canRedo} data-tooltip={runtime.t('tooltips.redo')} title={runtime.t('tooltips.redo')} aria-label={runtime.t('tooltips.redo')}>{icons.redo}</button>
        <button type="button" onClick={runtime.save} data-tooltip={runtime.t('tooltips.save')} title={runtime.t('tooltips.save')} aria-label={runtime.t('tooltips.save')}>{icons.save}</button>
        <button type="button" onClick={() => runtime.ui.setFullCanvasMode(false)} data-tooltip={runtime.t('tooltips.closeFullCanvas')} title={runtime.t('tooltips.closeFullCanvas')} aria-label={runtime.t('tooltips.closeFullCanvas')}>{icons.close}</button>
      </div>
    );
  }

  return (
    <aside className={styles.rail} aria-label={runtime.t('toolbar.toolsLabel')}>
      <button type="button" data-active="true" data-tooltip={runtime.t('tooltips.select')}>{icons.cursor}</button>
      <span className={styles.railDivider} />
      <button type="button" data-tooltip={runtime.t('tooltips.zoomIn')} onClick={runtime.zoomIn}>{icons.zoomIn}</button>
      <button type="button" data-tooltip={runtime.t('tooltips.zoomOut')} onClick={runtime.zoomOut}>{icons.zoomOut}</button>
      <button type="button" data-tooltip={runtime.t('tooltips.fit')} onClick={runtime.frameVisualization}>{icons.fit}</button>
      <button
        type="button"
        data-tooltip={runtime.t('tooltips.fullCanvas')}
        title={runtime.t('tooltips.fullCanvas')}
        onClick={() => {
          runtime.ui.setFullCanvasMode(true);
          runtime.ui.setInspectorOpen(false);
          runtime.ui.setHistoryOpen(false);
        }}
        aria-label={runtime.t('tooltips.fullCanvas')}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 9 5 5m0 0v4m0-4h4M15 9l4-4m0 0v4m0-4h-4M9 15l-4 4m0 0v-4m0 4h4M15 15l4 4m0 0v-4m0 4h-4" />
        </svg>
      </button>
    </aside>
  );
}
