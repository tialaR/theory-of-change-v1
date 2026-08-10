import type { CanvasProject } from '../domain/canvas-project';
import {
  createCanvasProjectContentSignature,
  type CanvasProjectContent
} from './canvas-project-content';
import { createCanvasEnginePersistenceSnapshot } from '../engine/canvas-engine';

export type CanvasSaveExecutionResult = {
  project: CanvasProject;
  saved: boolean;
};

export type CanvasProjectSaveExecutor = (
  project: CanvasProject
) => Promise<{ project: CanvasProject }>;

export function createCanvasSaveQueue(input: {
  initialProject: CanvasProject;
  executeSave: CanvasProjectSaveExecutor;
}) {
  let currentProject = input.initialProject;
  let persistedSignature = createCanvasProjectContentSignature(input.initialProject);
  let queue: Promise<void> = Promise.resolve();


  async function persist(content: CanvasProjectContent): Promise<CanvasSaveExecutionResult> {
    const draft: CanvasProject = {
      ...currentProject,
      ...createCanvasEnginePersistenceSnapshot(content)
    };
    const draftSignature = createCanvasProjectContentSignature(draft);

    if (draftSignature === persistedSignature) {
      return { project: currentProject, saved: false };
    }

    const result = await input.executeSave(draft);
    currentProject = result.project;
    persistedSignature = createCanvasProjectContentSignature(result.project);

    return { project: result.project, saved: true };
  }

  return {
    saveLatest(content: CanvasProjectContent) {
      const snapshot = createCanvasEnginePersistenceSnapshot(content);
      const operation = queue.then(() => persist(snapshot));
      queue = operation.then(
        () => undefined,
        () => undefined
      );
      return operation;
    },
    getCurrentProject() {
      return currentProject;
    }
  };
}
