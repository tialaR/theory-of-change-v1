'use client';

import { FlowDraftPreview } from './flow-draft-preview';
import { ResultDraftPreview } from './result-draft-preview';
import styles from './example-previews.module.sass';

type DedicatedExamplePreviewProps = {
  type: 'flow' | 'result';
  active?: boolean;
};

export function DedicatedExamplePreview({ type, active = true }: DedicatedExamplePreviewProps) {
  const Preview = type === 'flow' ? FlowDraftPreview : ResultDraftPreview;

  return (
    <div className={styles.dedicatedPreviewFrame} aria-hidden="true">
      <Preview active={active} />
    </div>
  );
}
