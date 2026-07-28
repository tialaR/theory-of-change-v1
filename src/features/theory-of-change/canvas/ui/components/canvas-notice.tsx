'use client';

import styles from '../canvas-workspace/canvas-workspace.module.sass';
import { useCanvasRuntime } from '../runtime/canvas-runtime-context';

export function CanvasNotice() {
  const runtime = useCanvasRuntime();
  return (
    <div className={styles.notice} data-tone={runtime.ui.noticeTone} role="status">
      <span />
      {runtime.ui.notice}
    </div>
  );
}
