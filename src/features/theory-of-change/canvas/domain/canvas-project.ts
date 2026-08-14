export type CanvasStageId = 'input' | 'activity' | 'product' | 'outcome';
export type CanvasRelationKind = 'risk' | 'hypothesis';

export type CanvasViewport = {
  x: number;
  y: number;
  zoom: number;
};

export type CanvasProjectNode = {
  id: string;
  stage: CanvasStageId;
  order: number;
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
  schemaVersion: 3;
  id: string;
  ownerId: string;
  title: string;
  locale: 'pt-BR';
  revision: number;
  nodes: CanvasProjectNode[];
  connections: CanvasProjectConnection[];
  viewport?: CanvasViewport;
  createdAt: string;
  updatedAt: string;
};

export type CanvasProjectPatch = Partial<Pick<CanvasProject, 'title' | 'nodes' | 'connections' | 'viewport'>>;

export type CanvasProjectRepository = {
  listByOwner(ownerId: string): Promise<CanvasProject[]>;
  findById(ownerId: string, projectId: string): Promise<CanvasProject | null>;
  create(ownerId: string, project: CanvasProject): Promise<CanvasProject>;
  replace(ownerId: string, project: CanvasProject): Promise<CanvasProject>;
  patch(ownerId: string, projectId: string, patch: CanvasProjectPatch): Promise<CanvasProject>;
  delete(ownerId: string, projectId: string): Promise<void>;
};

export function cloneCanvasProject(project: CanvasProject): CanvasProject {
  return structuredClone(project);
}
