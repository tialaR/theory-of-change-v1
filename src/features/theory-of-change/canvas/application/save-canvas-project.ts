import type { CanvasProject, CanvasProjectRepository } from '../domain/canvas-project';

export type SaveCanvasProjectResult = {
  project: CanvasProject;
  savedAt: string;
};

export async function saveCanvasProject(
  repository: CanvasProjectRepository,
  project: CanvasProject,
  now = new Date()
): Promise<SaveCanvasProjectResult> {
  const nextProject: CanvasProject = {
    ...project,
    revision: project.revision + 1,
    updatedAt: now.toISOString()
  };
  const savedProject = await repository.replace(project.ownerId, nextProject);

  return { project: savedProject, savedAt: savedProject.updatedAt };
}
