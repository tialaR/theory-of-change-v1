import type {
  CanvasProject,
  CanvasProjectConnection,
  CanvasProjectNode,
  CanvasStageId
} from './canvas-project';

type CanvasProjectNodeV2 = Omit<CanvasProjectNode, 'order'>;

export type CanvasProjectV2 = Omit<CanvasProject, 'schemaVersion' | 'nodes'> & {
  schemaVersion: 2;
  nodes: CanvasProjectNodeV2[];
  connections: CanvasProjectConnection[];
};

export type CanvasProjectDocument = CanvasProject | CanvasProjectV2;

const STAGES: CanvasStageId[] = ['input', 'activity', 'product', 'outcome'];

function comparePosition(first: CanvasProjectNodeV2, second: CanvasProjectNodeV2) {
  return first.position.y - second.position.y
    || first.position.x - second.position.x
    || first.id.localeCompare(second.id);
}

function compareCanonical(first: CanvasProjectNode, second: CanvasProjectNode) {
  return first.order - second.order
    || comparePosition(first, second);
}

function canonicalizeV2Nodes(project: CanvasProjectV2): CanvasProjectNode[] {
  const result = new Map<string, CanvasProjectNode>();

  for (const stage of STAGES) {
    const ordered = project.nodes
      .filter((node) => node.stage === stage)
      .sort(comparePosition);

    ordered.forEach((node, order) => {
      result.set(node.id, { ...node, order });
    });
  }

  return project.nodes.map((node) => {
    const canonical = result.get(node.id);
    if (!canonical) throw new Error(`Canvas node ${node.id} has an invalid stage.`);
    return canonical;
  });
}

function canonicalizeV3Nodes(project: CanvasProject): CanvasProjectNode[] {
  const result = new Map<string, CanvasProjectNode>();

  for (const stage of STAGES) {
    const ordered = project.nodes
      .filter((node) => node.stage === stage)
      .sort(compareCanonical);

    ordered.forEach((node, order) => {
      result.set(node.id, { ...node, order });
    });
  }

  return project.nodes.map((node) => {
    const canonical = result.get(node.id);
    if (!canonical) throw new Error(`Canvas node ${node.id} has an invalid stage.`);
    return canonical;
  });
}

export function migrateCanvasProject(project: CanvasProjectDocument): CanvasProject {
  if (project.schemaVersion === 2) {
    return {
      ...structuredClone(project),
      schemaVersion: 3,
      nodes: canonicalizeV2Nodes(project)
    };
  }

  if (project.schemaVersion === 3) {
    return {
      ...structuredClone(project),
      nodes: canonicalizeV3Nodes(project)
    };
  }

  throw new Error('Unsupported canvas project schema version.');
}
