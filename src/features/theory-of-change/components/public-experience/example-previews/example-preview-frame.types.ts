import type { ReactNode } from 'react';

export type ExamplePreviewDensity = 'compact' | 'detailed';

export type ExamplePreviewFrameProps = {
  children: ReactNode;
  density?: ExamplePreviewDensity;
  className?: string;
  ariaLabel: string;
};
