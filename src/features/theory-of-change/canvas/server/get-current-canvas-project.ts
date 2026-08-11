import { getTranslations } from 'next-intl/server';
import { getOrCreateCanvasProject } from '../application/get-or-create-canvas-project';
import { createServerCanvasProjectRepository } from './canvas-server.repository';

export async function getCurrentCanvasProject(ownerId: string) {
  const t = await getTranslations('Canvas.project');
  const repository = createServerCanvasProjectRepository();
  return getOrCreateCanvasProject(repository, ownerId, t('defaultTitle'));
}
