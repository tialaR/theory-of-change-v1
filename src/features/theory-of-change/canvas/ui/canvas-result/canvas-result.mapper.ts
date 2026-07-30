import type { TdmEdge, TdmNode } from '@/features/theory-of-change/domain/tdm-types';
import type { TdmStage } from '@/features/theory-of-change/domain/tdm-stages';
import type { ResultViewModel } from '@/features/theory-of-change/components/result-view/result-view.types';
import type {
  CanvasProject,
  CanvasProjectConnection,
  CanvasProjectNode,
  CanvasStageId
} from '../../domain/canvas-project';

const STAGE_MAP: Record<CanvasStageId, TdmStage> = {
  input: 'input',
  activity: 'activity',
  product: 'output',
  outcome: 'outcome'
};

function mapNode(node: CanvasProjectNode, project: CanvasProject): TdmNode {
  const stage = STAGE_MAP[node.stage];

  return {
    id: node.id,
    type: 'default',
    stage,
    title: node.title,
    description: node.description,
    advancedDetails: node.advancedDetails,
    shortNotes: '',
    position: node.position,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    data: {
      stage,
      title: node.title,
      description: node.description,
      advancedDetails: node.advancedDetails,
      shortNotes: ''
    }
  };
}

function getMarkerText(connection: CanvasProjectConnection): string | undefined {
  const relation = connection.relation;
  if (!relation) {
    return undefined;
  }

  return relation.title.trim() || relation.description.trim() || relation.advancedDetails.trim() || undefined;
}

function mapConnection(
  connection: CanvasProjectConnection,
  nodesById: Map<string, CanvasProjectNode>,
  project: CanvasProject
): TdmEdge | null {
  const source = nodesById.get(connection.sourceId);
  const target = nodesById.get(connection.targetId);

  if (!source || !target) {
    return null;
  }

  const sourceStage = STAGE_MAP[source.stage];
  const targetStage = STAGE_MAP[target.stage];
  const markerType = connection.relation?.kind;
  const markerText = getMarkerText(connection);

  return {
    id: connection.id,
    source: connection.sourceId,
    target: connection.targetId,
    sourceStage,
    targetStage,
    markerType,
    markerText,
    validationStatus: 'valid',
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    data: {
      sourceStage,
      targetStage,
      markerType,
      markerText,
      validationStatus: 'valid'
    }
  };
}

export function mapCanvasProjectToResultViewModel(project: CanvasProject): ResultViewModel {
  const nodesById = new Map(project.nodes.map((node) => [node.id, node]));
  const edges = project.connections
    .map((connection) => mapConnection(connection, nodesById, project))
    .filter((edge): edge is TdmEdge => edge !== null);

  return {
    title: project.title,
    nodes: project.nodes.map((node) => mapNode(node, project)),
    edges
  };
}
