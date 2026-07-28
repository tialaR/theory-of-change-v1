import { getCurrentCanvasProject } from './server/get-current-canvas-project';
import { CanvasResultView } from './ui/canvas-result/canvas-result-view';

export async function CanvasResultPage() {
  const { project } = await getCurrentCanvasProject('/canvas/resultado');
  return <CanvasResultView project={project} />;
}
