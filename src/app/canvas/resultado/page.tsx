import { requireAuthenticatedSession } from '@/features/auth/server/auth-session';
import { CanvasResultPage } from '@/features/theory-of-change/canvas';

export default async function CanvasResultadoRoutePage() {
  const { user } = await requireAuthenticatedSession('/canvas/resultado');
  return <CanvasResultPage user={user} />;
}
