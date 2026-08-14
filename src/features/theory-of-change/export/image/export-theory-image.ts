import type { Node } from '@xyflow/react';
import { downloadBlob } from '../shared/download-blob';
import {
  buildFlowExportFilename,
  type TheoryExportResult
} from '../model/theory-export-model';
import {
  DEFAULT_FLOW_EXPORT_BACKGROUND,
  IMAGE_EXPORT_EXCLUDE_SELECTORS,
  IMAGE_EXPORT_MAX_DIMENSION,
  IMAGE_EXPORT_PIXEL_RATIO,
  type TheoryImageExportOptions
} from './image-export-types';

function resolveBackgroundColor(
  container: HTMLElement,
  override?: string
): string {
  if (override) {
    return override;
  }

  const fromVar = getComputedStyle(container).getPropertyValue('--tdm-surface-app').trim();
  if (fromVar) {
    return fromVar;
  }

  const canvasBg = getComputedStyle(container).backgroundColor;
  if (canvasBg && canvasBg !== 'rgba(0, 0, 0, 0)' && canvasBg !== 'transparent') {
    return canvasBg;
  }

  return DEFAULT_FLOW_EXPORT_BACKGROUND;
}

function exportFilter(node: HTMLElement): boolean {
  return !IMAGE_EXPORT_EXCLUDE_SELECTORS.some((selector) => {
    try {
      return Boolean(node.matches?.(selector) || node.closest?.(selector));
    } catch {
      return false;
    }
  });
}

function assertSafeDimensions(
  width: number,
  height: number,
  pixelRatio: number
): string | null {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width < 1 || height < 1) {
    return 'Não foi possível medir o diagrama para exportação.';
  }

  const maxEdge = Math.max(width * pixelRatio, height * pixelRatio);
  if (maxEdge > IMAGE_EXPORT_MAX_DIMENSION * IMAGE_EXPORT_PIXEL_RATIO) {
    return `O fluxo excede o limite seguro de exportação (${IMAGE_EXPORT_MAX_DIMENSION}px). Reduza o diagrama ou exporte em partes.`;
  }

  if (width > IMAGE_EXPORT_MAX_DIMENSION || height > IMAGE_EXPORT_MAX_DIMENSION) {
    return `O fluxo excede o limite seguro de exportação (${IMAGE_EXPORT_MAX_DIMENSION}px). Reduza o diagrama ou exporte em partes.`;
  }

  return null;
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, data] = dataUrl.split(',');
  if (!header || data == null) {
    throw new Error('Falha ao converter a imagem exportada.');
  }

  const isBase64 = header.includes('base64');
  const mimeMatch = header.match(/data:([^;]+)/);
  const mime = mimeMatch?.[1] ?? 'application/octet-stream';
  const binary = isBase64 ? atob(data) : decodeURIComponent(data);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new Blob([bytes], { type: mime });
}

async function captureReactFlowViewport(
  container: HTMLElement,
  nodes: Node[],
  options: TheoryImageExportOptions,
  format: 'png' | 'svg'
): Promise<{ blob: Blob; width: number; height: number }> {
  const viewport = container.querySelector('.react-flow__viewport');
  if (!(viewport instanceof HTMLElement)) {
    throw new Error('Viewport do React Flow não encontrado para exportação.');
  }

  const { getNodesBounds, getViewportForBounds } = await import('@xyflow/react');
  const htmlToImage = await import('html-to-image');

  const bounds = getNodesBounds(nodes);
  const padding = options.padding ?? 0.12;
  const minZoom = options.minZoom ?? 0.1;
  const maxZoom = options.maxZoom ?? 1;

  const width = Math.max(1, Math.ceil(bounds.width || 1));
  const height = Math.max(1, Math.ceil(bounds.height || 1));
  // Fit content into a canvas sized to bounds with padding applied via getViewportForBounds.
  const exportWidth = Math.ceil(width * (1 + padding * 2));
  const exportHeight = Math.ceil(height * (1 + padding * 2));

  const dimensionError = assertSafeDimensions(
    exportWidth,
    exportHeight,
    format === 'png' ? IMAGE_EXPORT_PIXEL_RATIO : 1
  );
  if (dimensionError) {
    throw new Error(dimensionError);
  }

  const fit = getViewportForBounds(
    bounds,
    exportWidth,
    exportHeight,
    minZoom,
    maxZoom,
    padding
  );

  const backgroundColor = resolveBackgroundColor(container, options.backgroundColor);
  const style = {
    width: `${exportWidth}px`,
    height: `${exportHeight}px`,
    transform: `translate(${fit.x}px, ${fit.y}px) scale(${fit.zoom})`,
    transformOrigin: '0 0'
  };

  if (format === 'png') {
    const dataUrl = await htmlToImage.toPng(viewport, {
      backgroundColor,
      width: exportWidth,
      height: exportHeight,
      pixelRatio: IMAGE_EXPORT_PIXEL_RATIO,
      style,
      filter: exportFilter
    });
    return {
      blob: dataUrlToBlob(dataUrl),
      width: exportWidth * IMAGE_EXPORT_PIXEL_RATIO,
      height: exportHeight * IMAGE_EXPORT_PIXEL_RATIO
    };
  }

  let fontEmbedCSS: string | undefined;
  try {
    fontEmbedCSS = await htmlToImage.getFontEmbedCSS(viewport);
  } catch {
    fontEmbedCSS = undefined;
  }

  const dataUrl = await htmlToImage.toSvg(viewport, {
    backgroundColor,
    width: exportWidth,
    height: exportHeight,
    style,
    filter: exportFilter,
    fontEmbedCSS
  });

  return {
    blob: dataUrlToBlob(dataUrl),
    width: exportWidth,
    height: exportHeight
  };
}

async function captureResultDiagram(
  container: HTMLElement,
  options: TheoryImageExportOptions,
  format: 'png' | 'svg'
): Promise<{ blob: Blob; width: number; height: number }> {
  const diagram = container.querySelector('[data-theory-export-diagram]');
  if (!(diagram instanceof HTMLElement)) {
    throw new Error('Diagrama de resultado não encontrado para exportação.');
  }

  const htmlToImage = await import('html-to-image');
  const width = Math.max(1, diagram.scrollWidth);
  const height = Math.max(1, diagram.scrollHeight);

  const dimensionError = assertSafeDimensions(
    width,
    height,
    format === 'png' ? IMAGE_EXPORT_PIXEL_RATIO : 1
  );
  if (dimensionError) {
    throw new Error(dimensionError);
  }

  const backgroundColor = resolveBackgroundColor(container, options.backgroundColor);

  if (format === 'png') {
    const dataUrl = await htmlToImage.toPng(diagram, {
      backgroundColor,
      width,
      height,
      pixelRatio: IMAGE_EXPORT_PIXEL_RATIO,
      filter: exportFilter
    });
    return {
      blob: dataUrlToBlob(dataUrl),
      width: width * IMAGE_EXPORT_PIXEL_RATIO,
      height: height * IMAGE_EXPORT_PIXEL_RATIO
    };
  }

  let fontEmbedCSS: string | undefined;
  try {
    fontEmbedCSS = await htmlToImage.getFontEmbedCSS(diagram);
  } catch {
    fontEmbedCSS = undefined;
  }

  const dataUrl = await htmlToImage.toSvg(diagram, {
    backgroundColor,
    width,
    height,
    filter: exportFilter,
    fontEmbedCSS
  });

  return {
    blob: dataUrlToBlob(dataUrl),
    width,
    height
  };
}

async function exportTheoryImage(
  format: 'png' | 'svg',
  options: TheoryImageExportOptions
): Promise<TheoryExportResult> {
  const filename = buildFlowExportFilename(options.theoryTitle, format);

  if (typeof window === 'undefined') {
    return {
      status: 'error',
      format,
      filename,
      message: 'A exportação de imagem só está disponível no navegador.'
    };
  }

  try {
    const { container, nodes } = options;
    const reactFlowRoot =
      container.classList.contains('react-flow')
        ? container
        : (container.querySelector('.react-flow') as HTMLElement | null);
    const hasReactFlow = Boolean(reactFlowRoot?.querySelector('.react-flow__viewport'));
    const hasDiagram = Boolean(container.querySelector('[data-theory-export-diagram]'));

    let captured: { blob: Blob; width: number; height: number };

    if (hasReactFlow && reactFlowRoot) {
      if (!nodes || nodes.length === 0) {
        return {
          status: 'error',
          format,
          filename,
          message: 'Nodes do fluxo são necessários para exportar o React Flow.'
        };
      }
      captured = await captureReactFlowViewport(reactFlowRoot, nodes, options, format);
    } else if (hasDiagram) {
      captured = await captureResultDiagram(container, options, format);
    } else {
      return {
        status: 'error',
        format,
        filename,
        message:
          'Nenhum diagrama exportável encontrado. Abra o resultado a partir do Canvas (Visualizar teoria) para exportar.'
      };
    }

    if (options.download !== false) {
      downloadBlob(captured.blob, filename);
    }

    return {
      status: 'success',
      format,
      filename,
      message: `${format.toUpperCase()} gerado: ${filename}`,
      width: captured.width,
      height: captured.height,
      nodeCount: options.nodeCount ?? nodes?.length,
      edgeCount: options.edgeCount
    };
  } catch (error) {
    return {
      status: 'error',
      format,
      filename,
      message:
        error instanceof Error
          ? error.message
          : `Falha inesperada ao gerar o arquivo ${format.toUpperCase()}.`
    };
  }
}

export function exportTheoryPng(options: TheoryImageExportOptions): Promise<TheoryExportResult> {
  return exportTheoryImage('png', options);
}

export function exportTheorySvg(options: TheoryImageExportOptions): Promise<TheoryExportResult> {
  return exportTheoryImage('svg', options);
}
