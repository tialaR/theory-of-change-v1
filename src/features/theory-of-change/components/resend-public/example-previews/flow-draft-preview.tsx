'use client';

import type { CSSProperties } from 'react';
import { ResendDraftPreview } from './resend-draft-preview';

export type FlowDraftPreviewProps = {
  active?: boolean;
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
  [key: string]: unknown;
};

export function FlowDraftPreview({
  active = true,
  className,
  style,
  ariaLabel,
}: FlowDraftPreviewProps) {
  return (
    <ResendDraftPreview
      variant="flow"
      active={active}
      className={className}
      style={style}
      ariaLabel={ariaLabel}
    />
  );
}

export default FlowDraftPreview;
