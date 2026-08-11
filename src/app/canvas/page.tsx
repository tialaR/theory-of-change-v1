import { requireAuthenticatedSession } from '@/features/auth/server/auth-session';
import { CanvasPage } from '@/features/theory-of-change/canvas';

export default async function Page() {
  const { user } = await requireAuthenticatedSession('/canvas');
  return <CanvasPage user={user} />;
}
