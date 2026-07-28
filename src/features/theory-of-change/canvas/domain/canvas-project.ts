export type CanvasStageId = 'input' | 'activity' | 'product' | 'outcome';
export type CanvasRelationKind = 'risk' | 'hypothesis';

export type CanvasProjectNode = {
  id: string;
  stage: CanvasStageId;
  title: string;
  description: string;
  advancedDetails: string;
  position: { x: number; y: number };
};

export type CanvasProjectConnection = {
  id: string;
  sourceId: string;
  targetId: string;
  relation?: {
    kind: CanvasRelationKind;
    title: string;
    description: string;
    advancedDetails: string;
  };
};

export type CanvasProject = {
  schemaVersion: 1;
  id: string;
  title: string;
  locale: 'pt-BR';
  revision: number;
  nodes: CanvasProjectNode[];
  connections: CanvasProjectConnection[];
  createdAt: string;
  updatedAt: string;
};

export type CanvasProjectRepository = {
  findById(projectId: string): Promise<CanvasProject | null>;
  save(project: CanvasProject): Promise<CanvasProject>;
};

export function cloneCanvasProject(project: CanvasProject): CanvasProject {
  return structuredClone(project);
}
