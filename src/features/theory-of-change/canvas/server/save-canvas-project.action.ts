'use server';

import { requireAuthenticatedSession } from '@/features/auth';
import type { CanvasProject } from '../domain/canvas-project';
import { saveCanvasProject } from '../application/save-canvas-project';
import { createServerCanvasProjectRepository } from './canvas-server.repository';

const SAVE_DELAY_MS = 420;

function wait(duration: number) {
  return new Promise((resolve) => setTimeout(resolve, duration));
}

export async function saveCanvasProjectAction(project: CanvasProject) {
  const authenticated = await requireAuthenticatedSession('/canvas');
  if (project.ownerId !== authenticated.user.id) {
    throw new Error('Projeto não pertence ao usuário autenticado.');
  }

  await wait(SAVE_DELAY_MS);
  const repository = createServerCanvasProjectRepository();
  return saveCanvasProject(repository, project);
}
