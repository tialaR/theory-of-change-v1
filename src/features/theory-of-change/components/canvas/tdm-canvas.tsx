'use client';

import { ReactFlowProvider } from '@xyflow/react';
import { TdmCanvasInner } from './tdm-canvas-inner';

type TdmCanvasProps = {
  initialVariant?: 'custom' | 'example';
};

export function TdmCanvas({ initialVariant = 'custom' }: TdmCanvasProps) {
  return (
    <ReactFlowProvider>
      <TdmCanvasInner initialVariant={initialVariant} />
    </ReactFlowProvider>
  );
}
