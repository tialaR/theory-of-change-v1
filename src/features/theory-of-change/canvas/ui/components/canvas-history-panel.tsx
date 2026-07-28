'use client';

import { canvasIcons as icons } from '../canvas-icons';
import styles from '../canvas-workspace/canvas-workspace.module.sass';
import { useCanvasRuntime } from '../runtime/canvas-runtime-context';

export function CanvasHistoryPanel() {
  const runtime = useCanvasRuntime();
  if (runtime.ui.fullCanvasMode || !runtime.ui.historyOpen) return null;

  return (
    <aside className={styles.historyPanel}>
      <div className={styles.historyHeader}>
        <div><span>{runtime.t('history.title')}</span><strong>{runtime.t('history.session')}</strong></div>
        <button type="button" onClick={() => runtime.ui.setHistoryOpen(false)} data-tooltip={runtime.t('history.close')}>{icons.close}</button>
      </div>
      <ol>
        <li><span>{icons.check}</span><div><strong>{runtime.t('history.current')}</strong><small>{runtime.t('result.blocks', { count: runtime.flow.nodes.length })}</small></div></li>
        {runtime.flow.history.slice().reverse().map((_, index) => (
          <li key={`history-${index}`}><span>{index + 1}</span><div><strong>{runtime.t('history.change')}</strong><small>{runtime.t('history.version', { version: runtime.flow.history.length - index })}</small></div></li>
        ))}
      </ol>
    </aside>
  );
}
