import { cloneCanvasProject, type CanvasProject } from '../../domain/canvas-project';

const projects = new Map<string, CanvasProject>();

export const canvasProjectMockStore = {
  clear() {
    projects.clear();
  },
  read(projectId: string) {
    const project = projects.get(projectId);
    return project ? cloneCanvasProject(project) : null;
  },
  write(project: CanvasProject) {
    const clone = cloneCanvasProject(project);
    projects.set(project.id, clone);
    return cloneCanvasProject(clone);
  }
};
