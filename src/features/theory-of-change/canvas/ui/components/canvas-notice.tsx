'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { canvasIcons as icons } from '../canvas-icons';
import styles from '../canvas-workspace/canvas-workspace.module.sass';
import { useCanvasRuntime } from '../runtime/canvas-runtime-context';

export function CanvasNotice() {
  const runtime = useCanvasRuntime();
  const [dismissedRevision, setDismissedRevision] = useState<number | null>(null);
  const message = runtime.ui.notice.trim();
  const isUnresolvedKey = message.startsWith('Canvas.notices.') || message.startsWith('notices.');
  const visible = Boolean(message) && !isUnresolvedKey && dismissedRevision !== runtime.ui.noticeRevision;

  return (
    <AnimatePresence initial={false}>
      {visible ? (
        <motion.div
          key="canvas-notice"
          className={styles.notice}
          data-tone={runtime.ui.noticeTone}
          role="status"
          initial={{ y: 18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 18, opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <span>{message}</span>
          <button
            type="button"
            className={styles.noticeClose}
            onClick={() => setDismissedRevision(runtime.ui.noticeRevision)}
            aria-label={runtime.t('tooltips.closeInspector')}
            title={runtime.t('tooltips.closeInspector')}
          >
            {icons.close}
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
