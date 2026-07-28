import type { CanvasProject } from '@/features/theory-of-change/canvas-workspace';
import type { CanvasEdge, CanvasNode } from './resend-command-preview-v2.model';

export type CanvasProjectSnapshot = {
  title: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
};

export function mapCanvasSnapshotToProject(
  baseProject: CanvasProject,
  snapshot: CanvasProjectSnapshot
): CanvasProject {
  return {
    ...baseProject,
    title: snapshot.title.trim() || baseProject.title,
    nodes: snapshot.nodes.map((node) => ({
      id: node.id,
      stage: node.stage,
      title: node.title,
      description: node.description,
      advancedDetails: node.advancedDetails,
      position: { x: node.x, y: node.y }
    })),
    connections: snapshot.edges.map((edge) => ({
      id: edge.id,
      sourceId: edge.source,
      targetId: edge.target,
      relation: edge.relationKind
        ? {
            kind: edge.relationKind,
            title: edge.relationTitle ?? '',
            description: edge.relationText ?? '',
            advancedDetails: edge.relationAdvancedDetails ?? ''
          }
        : undefined
    }))
  };
}
