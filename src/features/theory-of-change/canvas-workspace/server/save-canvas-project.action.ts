'use server';

import { saveCanvasProject } from '../application/save-canvas-project';
import type { CanvasProject } from '../domain/canvas-project';
import { createHttpCanvasProjectRepository } from '../infrastructure/http/http-canvas-project.repository';

export type SaveCanvasProjectActionResult =
  | { ok: true; project: CanvasProject; savedAt: string }
  | { ok: false; message: string };

const SAVE_SIMULATION_DELAY_MS = 280;

function waitForSaveSimulation() {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, SAVE_SIMULATION_DELAY_MS);
  });
}

export async function saveCanvasProjectAction(
  project: CanvasProject
): Promise<SaveCanvasProjectActionResult> {
  try {
    await waitForSaveSimulation();
    const repository = createHttpCanvasProjectRepository({
      baseUrl: process.env.TDM_CANVAS_API_BASE_URL ?? 'http://127.0.0.1:3000'
    });
    const result = await saveCanvasProject(repository, project);
    return { ok: true, project: result.project, savedAt: result.savedAt };
  } catch {
    return { ok: false, message: 'Não foi possível salvar o projeto agora.' };
  }
}
