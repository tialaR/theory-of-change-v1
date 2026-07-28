'use client';

import { forwardRef } from 'react';
import styles from './example-preview-frame.module.sass';
import type { ExamplePreviewFrameProps } from './example-preview-frame.types';

export const ExamplePreviewFrame = forwardRef<HTMLElement, ExamplePreviewFrameProps>(
  function ExamplePreviewFrame(
    { children, density = 'detailed', className = '', ariaLabel },
    ref
  ) {
    return (
      <figure
        ref={ref}
        className={[styles.frame, className].filter(Boolean).join(' ')}
        data-density={density}
        aria-label={ariaLabel}
      >
        <div className={styles.viewport}>{children}</div>
      </figure>
    );
  }
);

export default ExamplePreviewFrame;
