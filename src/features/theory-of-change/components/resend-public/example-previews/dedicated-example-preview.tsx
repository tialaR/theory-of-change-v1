'use client';

import { useRef } from 'react';
import { useInView } from 'motion/react';
import { FlowDraftPreview } from './flow-draft-preview';
import { ResultDraftPreview } from './result-draft-preview';
import styles from './example-previews.module.sass';

type DedicatedExamplePreviewProps = {
  type: 'flow' | 'result';
  active?: boolean;
};

export function DedicatedExamplePreview({ type, active }: DedicatedExamplePreviewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once: true,
    amount: 0.45,
  });
  const isActive = active ?? isInView;
  const Preview = type === 'flow' ? FlowDraftPreview : ResultDraftPreview;

  if (type === 'flow') {
    return (
      <div ref={ref} className={styles.previewViewport} aria-hidden="true">
        <div className={styles.previewStage}>
          <Preview active={isActive} />
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className={styles.dedicatedPreviewFrame} aria-hidden="true">
      <Preview active={isActive} />
    </div>
  );
}
