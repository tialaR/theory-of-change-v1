import type { CanvasProject } from '../domain/canvas-project';
import {
  createCanvasProjectContentSignature,
  type CanvasProjectContent
} from './canvas-project-content';

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

  function snapshotContent(content: CanvasProjectContent): CanvasProjectContent {
    return {
      title: content.title,
      nodes: structuredClone(content.nodes),
      connections: structuredClone(content.connections)
    };
  }

  async function persist(content: CanvasProjectContent): Promise<CanvasSaveExecutionResult> {
    const draft: CanvasProject = {
      ...currentProject,
      ...snapshotContent(content)
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
      const snapshot = snapshotContent(content);
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
