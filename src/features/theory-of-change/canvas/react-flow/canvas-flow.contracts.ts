export type CanvasFlowPosition = {
  x: number;
  y: number;
};

export type CanvasConnectionCandidate = {
  source: string | null;
  target: string | null;
};

export type CanvasViewportNode = {
  id: string;
  position: CanvasFlowPosition;
  width?: number;
  height?: number;
  measured?: {
    width?: number;
    height?: number;
  };
};

export type CanvasFlowBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type CanvasViewportTransition = {
  duration?: number;
};

export type CanvasViewportRuntime = {
  getNodesBounds: (nodes: CanvasViewportNode[]) => CanvasFlowBounds;
  getViewport: () => { x: number; y: number; zoom: number };
  setViewport: (
    viewport: { x: number; y: number; zoom: number },
    transition?: CanvasViewportTransition
  ) => Promise<boolean> | void;
  zoomIn: (transition?: CanvasViewportTransition) => Promise<boolean> | void;
  zoomOut: (transition?: CanvasViewportTransition) => Promise<boolean> | void;
};

export type CanvasStageDropRuntime = {
  screenToFlowPosition: (position: CanvasFlowPosition) => CanvasFlowPosition;
};
