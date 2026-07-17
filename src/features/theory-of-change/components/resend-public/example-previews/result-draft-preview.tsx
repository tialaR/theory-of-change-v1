'use client';

import type { CSSProperties } from 'react';
import { ResendDraftPreview } from './resend-draft-preview';

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
    <ResendDraftPreview
      variant="result"
      active={active}
      className={className}
      style={style}
      ariaLabel={ariaLabel}
    />
  );
}

export default ResultDraftPreview;
