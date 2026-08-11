import { Suspense } from 'react';
import type { AuthUser } from '@/features/auth';
import { getCurrentCanvasProject } from './server/get-current-canvas-project';
import { CanvasClientEntry } from './ui/canvas-workspace/canvas-client-entry';
import { CanvasWorkspaceLoading } from './ui/canvas-workspace/canvas-workspace.loading';

type CanvasPageProps = {
  user: AuthUser;
};

async function AuthenticatedCanvas({ user }: CanvasPageProps) {
  const project = await getCurrentCanvasProject(user.id);
  return <CanvasClientEntry initialProject={project} user={user} />;
}

export function CanvasPage({ user }: CanvasPageProps) {
  return (
    <Suspense fallback={<CanvasWorkspaceLoading />}>
      <AuthenticatedCanvas user={user} />
    </Suspense>
  );
}
