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
        <div><span>Histórico</span><strong>Esta sessão</strong></div>
        <button
          type="button"
          onClick={() => runtime.ui.setHistoryOpen(false)}
          data-tooltip="Fechar histórico"
        >
          {icons.close}
        </button>
      </div>
      <ol>
        <li>
          <span>{icons.check}</span>
          <div>
            <strong>Estado atual</strong>
            <small>{runtime.flow.nodes.length} blocos no canvas</small>
          </div>
        </li>
        {runtime.flow.history.slice().reverse().map((_, index) => (
          <li key={`history-${index}`}>
            <span>{index + 1}</span>
            <div>
              <strong>Alteração registrada</strong>
              <small>Versão {runtime.flow.history.length - index}</small>
            </div>
          </li>
        ))}
      </ol>
    </aside>
  );
}
