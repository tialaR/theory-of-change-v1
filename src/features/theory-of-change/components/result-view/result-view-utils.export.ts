import type { TdmEdge, TdmNode } from '../../domain/tdm-types';
import { TDM_STAGE_LABELS, TDM_STAGE_ORDER } from '../../domain/tdm-stages';
import {
  buildTheoryStatusSummary,
  getEdgeMarkerText,
  getEdgeMarkerType,
  groupNodesByStage
} from './result-view-utils.network';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildWordExportHtml({
  title,
  description,
  nodes,
  edges
}: {
  title: string;
  description?: string;
  nodes: TdmNode[];
  edges: TdmEdge[];
}): string {
  const grouped = groupNodesByStage(nodes);
  const status = buildTheoryStatusSummary(nodes, edges);
  const summary = description?.trim() || 'Teoria da Mudança organizada em etapas, conexões, riscos e hipóteses.';

  const stageSections = TDM_STAGE_ORDER.map((stage) => {
    const stageNodes = grouped[stage];

    if (stageNodes.length === 0) {
      return '';
    }

    const blocks = stageNodes
      .map((node) => {
        const parts = [
          `<h3>${escapeHtml(node.title)}</h3>`,
          `<p>${escapeHtml(node.description?.trim() || 'Sem descrição registrada.')}</p>`
        ];

        if (node.advancedDetails?.trim()) {
          parts.push(`<p><strong>Detalhes:</strong> ${escapeHtml(node.advancedDetails)}</p>`);
        }

        if (node.shortNotes?.trim()) {
          parts.push(`<p><strong>Notas:</strong> ${escapeHtml(node.shortNotes)}</p>`);
        }

        return `<div>${parts.join('')}</div>`;
      })
      .join('');

    return `<section><h2>${escapeHtml(TDM_STAGE_LABELS[stage])}</h2>${blocks}</section>`;
  }).join('');

  const connectionLines = edges
    .map((edge) => {
      const source = nodes.find((node) => node.id === edge.source);
      const target = nodes.find((node) => node.id === edge.target);
      const markerType = getEdgeMarkerType(edge);
      const markerText =
        markerType === 'risk'
          ? getEdgeMarkerText(edge, 'risk')
          : markerType === 'hypothesis'
            ? getEdgeMarkerText(edge, 'hypothesis')
            : undefined;

      let line = `${source?.title ?? '—'} → ${target?.title ?? '—'}`;

      if (markerText?.trim()) {
        line += ` (${markerType === 'risk' ? 'Risco' : 'Hipótese'}: ${markerText.trim()})`;
      }

      return `<li>${escapeHtml(line)}</li>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p>${escapeHtml(summary)}</p>
  <p><strong>Resumo:</strong> ${status.totalBlocks} blocos, ${status.connectionCount} conexões, ${status.riskCount} riscos, ${status.hypothesisCount} hipóteses.</p>
  ${stageSections}
  <section>
    <h2>Conexões</h2>
    <ul>${connectionLines}</ul>
  </section>
</body>
</html>`;
}

export function downloadWordDocument(html: string, filename: string) {
  const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename.endsWith('.doc') ? filename : `${filename}.doc`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function sanitizeExportFilename(title: string): string {
  const normalized = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9à-úãõâêîôûç\s-]/gi, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return normalized || 'teoria-da-mudanca';
}
