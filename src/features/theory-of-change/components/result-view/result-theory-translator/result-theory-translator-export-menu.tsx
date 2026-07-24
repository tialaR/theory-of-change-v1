'use client';

import { useMemo } from 'react';
import { TdmFileIcon, TdmDownloadIcon } from '@/shared/ui/tdm-icons';
import { TdmMenu, type TdmMenuItem } from '@/shared/ui/tdm-menu';
import type {
  TheoryDocumentExportFormat,
  TheoryDocumentExportScope
} from './export/theory-document-export.types';
import { THEORY_TRANSLATOR_LABELS } from './result-theory-translator.constants';

type ResultTheoryTranslatorExportMenuProps = {
  hasScopedSelection: boolean;
  isExporting: boolean;
  onExport: (
    scope: TheoryDocumentExportScope,
    format: TheoryDocumentExportFormat
  ) => void | Promise<void>;
};

function formatLabel(format: TheoryDocumentExportFormat) {
  return format.toUpperCase();
}

export function ResultTheoryTranslatorExportMenu({
  hasScopedSelection,
  isExporting,
  onExport
}: ResultTheoryTranslatorExportMenuProps) {
  const scope: TheoryDocumentExportScope = hasScopedSelection ? 'scoped' : 'macro';
  const heading = hasScopedSelection
    ? THEORY_TRANSLATOR_LABELS.exportHeadingScoped
    : THEORY_TRANSLATOR_LABELS.exportHeadingMacro;

  const items = useMemo<readonly TdmMenuItem[]>(
    () =>
      (['pdf', 'docx'] as const).map((format) => ({
        id: `${scope}-${format}`,
        label: formatLabel(format),
        icon: <TdmFileIcon />,
        onSelect: () => onExport(scope, format)
      })),
    [onExport, scope]
  );

  return (
    <TdmMenu
      triggerLabel={THEORY_TRANSLATOR_LABELS.export}
      triggerIcon={<TdmDownloadIcon />}
      tooltip={THEORY_TRANSLATOR_LABELS.export}
      heading={heading}
      items={items}
      busy={isExporting}
      align="end"
      triggerVariant="subtle"
      triggerSize="md"
    />
  );
}
