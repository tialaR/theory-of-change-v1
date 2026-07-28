import { Suspense } from 'react';
import { CanvasClientEntry } from './ui/canvas-workspace/canvas-client-entry';
import { CanvasWorkspaceLoading } from './ui/canvas-workspace/canvas-workspace.loading';

export function CanvasPage() {
  return (
    <Suspense fallback={<CanvasWorkspaceLoading />}>
      <CanvasClientEntry />
    </Suspense>
  );
}
