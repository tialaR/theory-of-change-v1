'use client';

import {
  type TdmCanvasInnerProps,
  useCanvasWorkspaceComposition
} from './tdm-canvas-workspace-composition';

export function TdmCanvasInner(props: TdmCanvasInnerProps) {
  return useCanvasWorkspaceComposition(props);
}
