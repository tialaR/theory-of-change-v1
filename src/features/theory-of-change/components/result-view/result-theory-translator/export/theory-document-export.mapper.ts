import { sanitizeExportFilename } from '../../result-view-utils';
import type { TheoryDocumentModel, TheoryDocumentFigure } from '../../result-theory-narrative/theory-narrative.types';
import type {
  TheoryDocumentExportPayload,
  TheoryDocumentExportScope
} from './theory-document-export.types';

export function buildTheoryDocumentExportFilename(
  theoryTitle: string,
  _scope: TheoryDocumentExportScope,
  format: 'pdf' | 'docx',
  _document: TheoryDocumentModel
): string {
  const theorySlug = sanitizeExportFilename(theoryTitle || 'teoria-da-mudanca');
  return `${theorySlug}-interprete.${format}`;
}

export function buildTheoryDocumentExportPayload(
  theoryTitle: string,
  scope: TheoryDocumentExportScope,
  document: TheoryDocumentModel,
  format: 'pdf' | 'docx'
): TheoryDocumentExportPayload {
  return {
    filename: buildTheoryDocumentExportFilename(theoryTitle, scope, format, document),
    theoryTitle: theoryTitle.trim() || 'Teoria da mudança',
    document,
    includeReferences: true,
    references: document.references.map((item) => item.text)
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function formatExportMetadata(document: TheoryDocumentModel): string {
  const { stagesCount, connectionsCount, riskCount, hypothesisCount } = document.metadata;
  return [
    pluralize(stagesCount, 'etapa', 'etapas'),
    pluralize(connectionsCount, 'conexão', 'conexões'),
    pluralize(riskCount, 'risco', 'riscos'),
    pluralize(hypothesisCount, 'hipótese', 'hipóteses')
  ].join(' · ');
}

function renderOverviewSvg(figure: TheoryDocumentFigure): string {
  const counts = figure.stageCounts;
  const stages = [
    { title: 'INSUMOS', subtitle: 'Recursos mobilizados', count: counts?.inputs },
    { title: 'ATIVIDADES', subtitle: 'Ações previstas', count: counts?.activities },
    { title: 'PRODUTOS', subtitle: 'Entregas geradas', count: counts?.products },
    { title: 'RESULTADOS', subtitle: 'Mudanças esperadas', count: counts?.results }
  ];
  const stageMarkup = stages
    .map((stage, index) => {
      const x = 40 + index * 295;
      return `<g transform="translate(${x},90)">
  <rect width="230" height="120" rx="8" fill="#fff" stroke="#8a8a8e"/>
  <text x="115" y="48" text-anchor="middle" fill="#242426" font-family="Times New Roman, Times, serif" font-size="22" font-weight="700">${escapeHtml(stage.title)}</text>
  <text x="115" y="78" text-anchor="middle" fill="#6d6d72" font-family="Times New Roman, Times, serif" font-size="15">${escapeHtml(stage.subtitle)}</text>
  ${typeof stage.count === 'number' ? `<text x="115" y="102" text-anchor="middle" fill="#6d6d72" font-family="Times New Roman, Times, serif" font-size="15" font-weight="600">${stage.count}</text>` : ''}
</g>`;
    })
    .join('');

  return `<svg viewBox="0 0 1200 360" role="img" aria-label="${escapeHtml(figure.altText)}" xmlns="http://www.w3.org/2000/svg">
  <title>${escapeHtml(figure.altText)}</title>
  <defs>
    <marker id="export-flow-arrow" markerWidth="7" markerHeight="7" refX="8" refY="5" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill="#4b4b4f"/>
    </marker>
  </defs>
  <rect width="1200" height="360" fill="#fbfbf8"/>
  ${stageMarkup}
  <g stroke="#4b4b4f" stroke-width="3" marker-end="url(#export-flow-arrow)">
    <line x1="280" y1="150" x2="325" y2="150"/>
    <line x1="575" y1="150" x2="620" y2="150"/>
    <line x1="870" y1="150" x2="915" y2="150"/>
  </g>
  <g font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="700" fill="#3c3c40" text-anchor="middle">
    <rect x="280" y="245" width="110" height="36" rx="18" fill="#fff" stroke="#9a9a9f"/>
    <text x="335" y="268">RISCO</text>
    <rect x="575" y="245" width="110" height="36" rx="18" fill="#fff" stroke="#9a9a9f"/>
    <text x="630" y="268">RISCO</text>
    <rect x="870" y="245" width="130" height="36" rx="18" fill="#fff" stroke="#9a9a9f"/>
    <text x="935" y="268">HIPÓTESE</text>
  </g>
</svg>`;
}

function renderMapSvg(figure: TheoryDocumentFigure): string {
  const nodes = figure.nodes ?? [];
  const edges = figure.edges ?? [];
  const columns =
    figure.kind === 'resources-map'
      ? (['input', 'activity'] as const)
      : (['activity', 'output', 'outcome'] as const);
  const width = figure.kind === 'resources-map' ? 1000 : 1120;
  const height = figure.kind === 'resources-map' ? 560 : 640;

  const positions = new Map<string, { x: number; y: number }>();
  columns.forEach((stage, columnIndex) => {
    const columnNodes = nodes.filter((node) => node.stage === stage);
    const x = 150 + columnIndex * (figure.kind === 'resources-map' ? 600 : 380);
    columnNodes.forEach((node, index) => {
      const total = columnNodes.length;
      const y = total <= 1 ? height / 2 : 120 + ((height - 200) / Math.max(total - 1, 1)) * index;
      positions.set(node.id, { x, y });
    });
  });

  const nodeMarkup = nodes
    .map((node) => {
      const pos = positions.get(node.id);
      if (!pos) {
        return '';
      }
      return `<g transform="translate(${pos.x - 110}, ${pos.y - 28})">
  <rect width="220" height="56" rx="8" fill="#fff" stroke="#8f9094"/>
  <text x="110" y="34" text-anchor="middle" fill="#242426" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="600">${escapeHtml(node.title)}</text>
</g>`;
    })
    .join('');

  const edgeMarkup = edges
    .map((edge) => {
      const from = positions.get(edge.sourceId);
      const to = positions.get(edge.targetId);
      if (!from || !to) {
        return '';
      }
      const midX = (from.x + 110 + to.x - 110) / 2;
      const marker = edge.marker
        ? `<text x="${midX}" y="${(from.y + to.y) / 2 - 8}" text-anchor="middle" fill="#55565a" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="700">${edge.marker}</text>`
        : '';
      return `<g>
  <path d="M ${from.x + 110} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${to.x - 110} ${to.y}" fill="none" stroke="#55565a" stroke-width="2.5" marker-end="url(#export-map-arrow)"/>
  ${marker}
</g>`;
    })
    .join('');

  return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(figure.altText)}" xmlns="http://www.w3.org/2000/svg">
  <title>${escapeHtml(figure.altText)}</title>
  <defs>
    <marker id="export-map-arrow" markerWidth="7" markerHeight="7" refX="8" refY="5" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill="#55565a"/>
    </marker>
  </defs>
  <rect width="${width}" height="${height}" fill="#fbfbf8"/>
  ${edgeMarkup}
  ${nodeMarkup}
</svg>`;
}

function renderFigureHtml(figure: TheoryDocumentFigure): string {
  const svg =
    figure.kind === 'overview' || figure.kind === 'selected-path'
      ? renderOverviewSvg(figure)
      : renderMapSvg(figure);
  return `<figure class="figure">
  <figcaption>${escapeHtml(figure.title)}</figcaption>
  <div class="figure-frame">${svg}</div>
  <p class="figure-source">${escapeHtml(figure.sourceNote)}</p>
</figure>`;
}

function renderPagesHtml(document: TheoryDocumentModel, includeReferences: boolean): string {
  const pages = includeReferences
    ? document.pages
    : document.pages.filter((page) => page.kind !== 'references');

  return pages
    .map((page) => {
      if (page.kind === 'references') {
        return `<section class="page references-page">
  <h2 class="references-title">REFERÊNCIAS</h2>
  ${document.references.map((item) => `<p class="reference">${escapeHtml(item.text)}</p>`).join('')}
  <footer class="page-footer"><span>${page.pageNumber}</span></footer>
</section>`;
      }

      const sections = page.sections
        .map((section) => {
          const heading =
            section.title != null
              ? `<h${Math.min(section.level + 1, 4)} class="heading-${section.level}">${escapeHtml(
                  `${section.number ? `${section.number} ` : ''}${section.title}`
                )}</h${Math.min(section.level + 1, 4)}>`
              : '';
          const paragraphs = (section.paragraphs ?? [])
            .map((item, index) => {
              const className =
                index === 0 || item.suppressIndent ? 'paragraph paragraph-flush' : 'paragraph';
              return `<p class="${className}">${escapeHtml(item.text)}</p>`;
            })
            .join('');
          const callouts = (section.callouts ?? [])
            .map(
              (callout) =>
                `<aside class="callout"><p class="callout-label">${escapeHtml(callout.label)}</p><p class="callout-text">${escapeHtml(callout.text)}</p></aside>`
            )
            .join('');
          const figure = section.figure ? renderFigureHtml(section.figure) : '';
          return `<section class="section">${heading}${paragraphs}${figure}${callouts}</section>`;
        })
        .join('');

      return `<section class="page">
  ${sections}
  <footer class="page-footer"><span>${page.pageNumber}</span></footer>
</section>`;
    })
    .join('');
}

export function buildTheoryDocumentExportHtml(payload: TheoryDocumentExportPayload): string {
  const { document, theoryTitle, includeReferences } = payload;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8"/>
  <title>${escapeHtml(payload.filename.replace(/\.(pdf|docx)$/i, ''))}</title>
  <style>
    @page {
      size: A4;
      margin: 3cm 2cm 2cm 3cm;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      color: #000;
      background: #fff;
      font-family: "Times New Roman", Times, serif;
      font-size: 12pt;
      line-height: 1.5;
      text-align: justify;
    }
    .kicker {
      margin: 0 0 0.5rem;
      font-size: 10pt;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      text-align: left;
      font-family: Arial, Helvetica, sans-serif;
    }
    h1 {
      margin: 0 0 0.5rem;
      font-size: 16pt;
      font-weight: 700;
      line-height: 1.3;
      text-align: left;
    }
    .meta {
      margin: 0 0 1.25rem;
      padding-bottom: 1.25rem;
      border-bottom: 0.5pt solid #c8c8cc;
      font-size: 10pt;
      line-height: 1.4;
      text-align: left;
      font-family: Arial, Helvetica, sans-serif;
    }
    .theory-name {
      margin: 0 0 0.75rem;
      font-size: 10pt;
      text-align: left;
    }
    .page {
      break-after: page;
      page-break-after: always;
      position: relative;
      min-height: 22cm;
      padding-bottom: 1.5cm;
    }
    .page:last-child {
      break-after: auto;
      page-break-after: auto;
    }
    .heading-1 {
      margin: 0 0 12pt;
      font-size: 16pt;
      font-weight: 700;
      text-align: left;
      break-after: avoid;
      page-break-after: avoid;
    }
    .heading-2 {
      margin: 14pt 0 10pt;
      font-size: 14pt;
      font-weight: 700;
      text-align: left;
      break-after: avoid;
      page-break-after: avoid;
    }
    .heading-3 {
      margin: 12pt 0 8pt;
      font-size: 12pt;
      font-weight: 700;
      text-align: left;
    }
    .paragraph {
      margin: 0 0 12pt;
      text-indent: 1.25cm;
    }
    .paragraph-flush {
      text-indent: 0;
    }
    .callout {
      margin: 14pt 0;
      padding: 0 0 0 12pt;
      border-left: 0.75pt solid #3a3a3e;
      text-align: left;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .callout-label {
      margin: 0 0 4pt;
      font-size: 10pt;
      font-weight: 700;
      text-indent: 0;
      break-after: avoid;
      page-break-after: avoid;
    }
    .callout-text {
      margin: 0;
      font-size: 12pt;
      line-height: 1.5;
      text-indent: 0;
    }
    .figure {
      margin: 14pt 0;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    figcaption {
      margin: 0 0 0.75rem;
      font-size: 10pt;
      text-align: left;
      break-after: avoid;
      page-break-after: avoid;
    }
    .figure-frame {
      border: 0.75pt solid #c8c8cc;
      padding: 10pt;
      background: #fff;
    }
    .figure-frame svg {
      display: block;
      width: 100%;
      height: auto;
    }
    .figure-source {
      margin: 0.5rem 0 0;
      font-size: 10pt;
      line-height: 1.35;
      text-align: left;
      font-style: italic;
    }
    .references-title {
      margin: 0 0 12pt;
      font-size: 14pt;
      font-weight: 700;
      text-align: left;
      letter-spacing: 0.04em;
    }
    .reference {
      margin: 0 0 12pt;
      font-size: 10pt;
      line-height: 1.35;
      text-indent: 0;
      text-align: left;
    }
    .page-footer {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      text-align: center;
      font-size: 10pt;
      color: #333;
    }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <header>
    <p class="kicker">INTÉRPRETE DA TEORIA</p>
    <p class="theory-name">${escapeHtml(theoryTitle)}</p>
    <h1>${escapeHtml(document.title)}</h1>
    <p class="meta">${escapeHtml(formatExportMetadata(document))}</p>
  </header>
  ${renderPagesHtml(document, includeReferences)}
</body>
</html>`;
}
