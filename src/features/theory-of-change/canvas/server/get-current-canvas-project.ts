import { getTranslations } from 'next-intl/server';
import { requireAuthenticatedSession } from '@/features/auth';
import { getOrCreateCanvasProject } from '../application/get-or-create-canvas-project';
import { createServerCanvasProjectRepository } from './canvas-server.repository';

export async function getCurrentCanvasProject(returnTo = '/canvas') {
  const authenticated = await requireAuthenticatedSession(returnTo);
  const t = await getTranslations('Canvas.project');
  const repository = createServerCanvasProjectRepository();
  const project = await getOrCreateCanvasProject(repository, authenticated.user.id, t('defaultTitle'));
  return { project, user: authenticated.user };
}
