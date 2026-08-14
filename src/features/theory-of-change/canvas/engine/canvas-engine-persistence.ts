export type CanvasEnginePersistableContent<Node, Edge, Viewport> = {
  title: string;
  nodes: Node[];
  connections: Edge[];
  viewport?: Viewport;
};

export function createCanvasEnginePersistenceSnapshot<Node, Edge, Viewport>(
  content: CanvasEnginePersistableContent<Node, Edge, Viewport>
): CanvasEnginePersistableContent<Node, Edge, Viewport> {
  return {
    title: content.title,
    nodes: structuredClone(content.nodes),
    connections: structuredClone(content.connections),
    viewport: content.viewport === undefined
      ? undefined
      : structuredClone(content.viewport)
  };
}

export function createCanvasEnginePersistenceSignature<Node, Edge, Viewport>(
  content: CanvasEnginePersistableContent<Node, Edge, Viewport>
): string {
  const snapshot = createCanvasEnginePersistenceSnapshot(content);

  return JSON.stringify({
    title: snapshot.title,
    nodes: snapshot.nodes,
    connections: snapshot.connections,
    viewport: snapshot.viewport
  });
}
