import type { Node } from '@xyflow/react';

export type TheoryImageExportFormat = 'png' | 'svg';

export type TheoryImageExportOptions = {
  /** Root element that contains `.react-flow` and/or `[data-theory-export-diagram]`. */
  container: HTMLElement;
  theoryTitle: string;
  /** Required for the React Flow capture path. */
  nodes?: Node[];
  nodeCount?: number;
  edgeCount?: number;
  /** PNG background; defaults to canvas dark / CSS var when available. */
  backgroundColor?: string;
  /** Download the file after generation (default true). */
  download?: boolean;
  /** Padding fraction for React Flow fit (default 0.12). */
  padding?: number;
  /** Min zoom for getViewportForBounds (default 0.1). */
  minZoom?: number;
  /** Max zoom for getViewportForBounds (default 1). */
  maxZoom?: number;
};

export const IMAGE_EXPORT_EXCLUDE_SELECTORS = [
  '[data-export-exclude="true"]',
  '.react-flow__controls',
  '.react-flow__minimap',
  '.react-flow__panel',
  '.react-flow__handle',
  '.react-flow__nodesselection',
  '.react-flow__selection'
] as const;

/** Max CSS pixel dimension before pixelRatio (hard browser-safe ceiling). */
export const IMAGE_EXPORT_MAX_DIMENSION = 4096;

export const IMAGE_EXPORT_PIXEL_RATIO = 2;

export const DEFAULT_FLOW_EXPORT_BACKGROUND = '#0a0a0c';
