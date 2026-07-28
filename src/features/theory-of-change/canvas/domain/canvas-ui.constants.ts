export const CANVAS_DIMENSIONS = {
  width: 1480,
  height: 820,
  nodeWidth: 238,
  nodeHeight: 126,
  nodeEdgeGap: 24,
  duplicateOffset: 34,
  columnGapY: 172,
  columnStartY: 120,
  historyLimit: 24
} as const;

export const CANVAS_COLUMN_X = {
  input: 120,
  activity: 430,
  product: 740,
  outcome: 1050
} as const;

export const CANVAS_DRAG_STAGE_MIME = 'application/x-tdm-stage';
