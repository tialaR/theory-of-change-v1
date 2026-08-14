import type { TheoryDocumentModel } from '@/features/theory-of-change/components/result-view/result-theory-narrative/theory-narrative.types';
import { downloadBlob } from '../shared/download-blob';
import {
  buildInterpreterExportFilename,
  formatTheoryExportMetadata,
  type TheoryExportResult
} from '../model/theory-export-model';

function headingLevel(
  HeadingLevel: typeof import('docx').HeadingLevel,
  level: 1 | 2 | 3
): (typeof HeadingLevel)[keyof typeof HeadingLevel] {
  if (level === 1) {
    return HeadingLevel.HEADING_1;
  }
  if (level === 2) {
    return HeadingLevel.HEADING_2;
  }
  return HeadingLevel.HEADING_3;
}

/**
 * Export the Intérprete document as a real .docx (dynamic `docx` import).
 */
export async function exportTheoryDocx(
  documentModel: TheoryDocumentModel,
  theoryTitle: string,
  options?: { download?: boolean }
): Promise<TheoryExportResult> {
  const format = 'docx' as const;
  const filename = buildInterpreterExportFilename(theoryTitle, format);

  if (typeof window === 'undefined') {
    return {
      status: 'error',
      format,
      message: 'A exportação em DOCX só está disponível no navegador.',
      filename
    };
  }

  try {
    const {
      AlignmentType,
      Document,
      Footer,
      Header,
      HeadingLevel,
      Packer,
      PageNumber,
      Paragraph,
      TextRun
    } = await import('docx');

    const resolvedTitle = theoryTitle.trim() || 'Teoria da mudança';
    const children: InstanceType<typeof Paragraph>[] = [
      new Paragraph({
        children: [
          new TextRun({
            text: 'INTÉRPRETE DA TEORIA',
            bold: true,
            size: 18,
            font: 'Arial'
          })
        ]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({ text: resolvedTitle, size: 20, font: 'Arial' })]
      }),
      new Paragraph({
        heading: HeadingLevel.TITLE,
        spacing: { after: 160 },
        children: [new TextRun({ text: documentModel.title, bold: true, size: 32 })]
      }),
      new Paragraph({
        spacing: { after: 280 },
        children: [
          new TextRun({
            text: formatTheoryExportMetadata(documentModel),
            size: 18,
            font: 'Arial',
            color: '555555'
          })
        ]
      })
    ];

    if (documentModel.executiveSummary.length > 0) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 200, after: 160 },
          children: [new TextRun({ text: 'Introdução', bold: true })]
        })
      );
      documentModel.executiveSummary.forEach((paragraph) => {
        children.push(
          new Paragraph({
            spacing: { after: 160 },
            alignment: AlignmentType.JUSTIFIED,
            children: [new TextRun({ text: paragraph.text, size: 22 })]
          })
        );
      });
    }

    documentModel.pages.forEach((page) => {
      if (page.kind === 'references') {
        children.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 280, after: 160 },
            children: [new TextRun({ text: 'Referências', bold: true })]
          })
        );
        documentModel.references.forEach((reference) => {
          children.push(
            new Paragraph({
              spacing: { after: 120 },
              children: [new TextRun({ text: reference.text, size: 18 })]
            })
          );
        });
        return;
      }

      page.sections.forEach((section) => {
        if (section.title) {
          const label = `${section.number ? `${section.number} ` : ''}${section.title}`;
          children.push(
            new Paragraph({
              heading: headingLevel(HeadingLevel, section.level),
              spacing: { before: 240, after: 140 },
              children: [new TextRun({ text: label, bold: true })]
            })
          );
        }

        (section.paragraphs ?? []).forEach((paragraph) => {
          children.push(
            new Paragraph({
              spacing: { after: 140 },
              alignment: AlignmentType.JUSTIFIED,
              indent: paragraph.suppressIndent ? undefined : { firstLine: 360 },
              children: [new TextRun({ text: paragraph.text, size: 22 })]
            })
          );
        });

        (section.callouts ?? []).forEach((callout) => {
          children.push(
            new Paragraph({
              spacing: { before: 120, after: 40 },
              children: [
                new TextRun({
                  text: callout.label,
                  bold: true,
                  size: 18
                })
              ]
            })
          );
          children.push(
            new Paragraph({
              spacing: { after: 160 },
              border: {
                left: { color: '3A3A3E', space: 8, style: 'single', size: 12 }
              },
              indent: { left: 120 },
              children: [new TextRun({ text: callout.text, size: 22 })]
            })
          );
        });
      });
    });

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              size: {
                width: 11906,
                height: 16838
              },
              margin: {
                top: 1440,
                right: 1134,
                bottom: 1134,
                left: 1440
              }
            }
          },
          headers: {
            default: new Header({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'Intérprete da Teoria · TDM',
                      size: 16,
                      color: '666666',
                      font: 'Arial'
                    })
                  ]
                })
              ]
            })
          },
          footers: {
            default: new Footer({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      children: [PageNumber.CURRENT],
                      size: 16,
                      font: 'Arial'
                    })
                  ]
                })
              ]
            })
          },
          children
        }
      ]
    });

    const blob = await Packer.toBlob(doc);
    if (options?.download !== false) {
      downloadBlob(blob, filename);
    }

    return {
      status: 'success',
      format,
      filename,
      message: `DOCX gerado: ${filename}`
    };
  } catch (error) {
    return {
      status: 'error',
      format,
      filename,
      message:
        error instanceof Error
          ? error.message
          : 'Falha inesperada ao gerar o arquivo DOCX.'
    };
  }
}
