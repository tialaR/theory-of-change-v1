'use client';

import { ReactFlowProvider } from '@xyflow/react';
import type { PropsWithChildren } from 'react';

export function CanvasFlowProvider({ children }: PropsWithChildren) {
  return <ReactFlowProvider>{children}</ReactFlowProvider>;
}
