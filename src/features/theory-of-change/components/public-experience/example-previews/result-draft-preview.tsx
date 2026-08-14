'use client';

import type { CSSProperties } from 'react';
import { TheoryDraftPreview } from './theory-draft-preview';

export type ResultDraftPreviewProps = {
  active?: boolean;
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
  [key: string]: unknown;
};

export function ResultDraftPreview({
  active = true,
  className,
  style,
  ariaLabel,
}: ResultDraftPreviewProps) {
  return (
    <TheoryDraftPreview
      variant="result"
      active={active}
      className={className}
      style={style}
      ariaLabel={ariaLabel}
    />
  );
}

export default ResultDraftPreview;
