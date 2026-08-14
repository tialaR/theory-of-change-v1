import type { AuthUser } from '@/features/auth';
import { getCurrentCanvasProject } from './server/get-current-canvas-project';
import { CanvasResultView } from './ui/canvas-result/canvas-result-view';

type CanvasResultPageProps = {
  user: AuthUser;
};

export async function CanvasResultPage({ user }: CanvasResultPageProps) {
  const project = await getCurrentCanvasProject(user.id);
  return <CanvasResultView project={project} user={user} />;
}
