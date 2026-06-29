'use client';

import { ReactFlowProvider } from '@xyflow/react';
import { TdmCanvasInner } from './tdm-canvas-inner';

export function TdmCanvas() {
  return (
    <ReactFlowProvider>
      <TdmCanvasInner />
    </ReactFlowProvider>
  );
}
