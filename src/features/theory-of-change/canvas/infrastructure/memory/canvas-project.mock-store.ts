import { cloneCanvasProject, type CanvasProject, type CanvasProjectPatch } from '../../domain/canvas-project';

const CANVAS_PROJECTS_KEY = Symbol.for('tdm.mock.canvas.projects-by-owner');
type CanvasMockGlobal = typeof globalThis & {
  [CANVAS_PROJECTS_KEY]?: Map<string, Map<string, CanvasProject>>;
};
const canvasGlobal = globalThis as CanvasMockGlobal;
const projectsByOwner = canvasGlobal[CANVAS_PROJECTS_KEY] ?? new Map<string, Map<string, CanvasProject>>();
canvasGlobal[CANVAS_PROJECTS_KEY] = projectsByOwner;

function ownerProjects(ownerId: string) {
  const existing = projectsByOwner.get(ownerId);
  if (existing) return existing;
  const projects = new Map<string, CanvasProject>();
  projectsByOwner.set(ownerId, projects);
  return projects;
}

function assertOwnership(ownerId: string, project: CanvasProject) {
  if (project.ownerId !== ownerId) throw new Error('Canvas project owner mismatch.');
}

export const canvasProjectMockStore = {
  clear() { projectsByOwner.clear(); },
  list(ownerId: string) { return [...ownerProjects(ownerId).values()].map(cloneCanvasProject); },
  read(ownerId: string, projectId: string) {
    const project = ownerProjects(ownerId).get(projectId);
    return project ? cloneCanvasProject(project) : null;
  },
  create(ownerId: string, project: CanvasProject) {
    assertOwnership(ownerId, project);
    const projects = ownerProjects(ownerId);
    if (projects.has(project.id)) return null;
    projects.set(project.id, cloneCanvasProject(project));
    return cloneCanvasProject(project);
  },
  replace(ownerId: string, project: CanvasProject) {
    assertOwnership(ownerId, project);
    const projects = ownerProjects(ownerId);
    if (!projects.has(project.id)) return null;
    projects.set(project.id, cloneCanvasProject(project));
    return cloneCanvasProject(project);
  },
  patch(ownerId: string, projectId: string, patch: CanvasProjectPatch) {
    const existing = ownerProjects(ownerId).get(projectId);
    if (!existing) return null;
    const project: CanvasProject = {
      ...existing,
      ...structuredClone(patch),
      id: existing.id,
      ownerId: existing.ownerId,
      schemaVersion: existing.schemaVersion,
      updatedAt: new Date().toISOString()
    };
    ownerProjects(ownerId).set(projectId, project);
    return cloneCanvasProject(project);
  },
  delete(ownerId: string, projectId: string) { return ownerProjects(ownerId).delete(projectId); }
};
