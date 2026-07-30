import { Suspense } from 'react';
import { getCurrentCanvasProject } from './server/get-current-canvas-project';
import { CanvasClientEntry } from './ui/canvas-workspace/canvas-client-entry';
import { CanvasWorkspaceLoading } from './ui/canvas-workspace/canvas-workspace.loading';

async function AuthenticatedCanvas() {
  const { project, user } = await getCurrentCanvasProject('/canvas');
  return <CanvasClientEntry initialProject={project} user={user} />;
}

export function CanvasPage() {
  return (
    <Suspense fallback={<CanvasWorkspaceLoading />}>
      <AuthenticatedCanvas />
    </Suspense>
  );
}
