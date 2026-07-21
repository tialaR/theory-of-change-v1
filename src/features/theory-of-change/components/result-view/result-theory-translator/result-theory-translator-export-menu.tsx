'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { TdmIconButton } from '@/shared/ui/tdm-icon-button/tdm-icon-button';
import { TdmSurface } from '@/shared/ui/tdm-surface/tdm-surface';
import type {
  TheoryDocumentExportFormat,
  TheoryDocumentExportScope
} from './export/theory-document-export.types';
import { THEORY_TRANSLATOR_LABELS } from './result-theory-translator.constants';
import styles from './result-theory-translator-pane.module.sass';

type ResultTheoryTranslatorExportMenuProps = {
  hasScopedSelection: boolean;
  isExporting: boolean;
  onExport: (
    scope: TheoryDocumentExportScope,
    format: TheoryDocumentExportFormat
  ) => void | Promise<void>;
};

type MenuItem = {
  id: string;
  scope: TheoryDocumentExportScope;
  format: TheoryDocumentExportFormat;
  disabled?: boolean;
};

function ExportIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 4v11"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M8.5 11.5 12 15l3.5-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 19h14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ResultTheoryTranslatorExportMenu({
  hasScopedSelection,
  isExporting,
  onExport
}: ResultTheoryTranslatorExportMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  const scope: TheoryDocumentExportScope = hasScopedSelection ? 'scoped' : 'macro';
  const heading = hasScopedSelection
    ? THEORY_TRANSLATOR_LABELS.exportHeadingScoped
    : THEORY_TRANSLATOR_LABELS.exportHeadingMacro;

  const items: MenuItem[] = [
    {
      id: `${scope}-pdf`,
      scope,
      format: 'pdf'
    },
    {
      id: `${scope}-docx`,
      scope,
      format: 'docx'
    }
  ];

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      setOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown, true);
    };
  }, [open]);

  return (
    <div
      className={styles.exportMenuRoot}
      ref={rootRef}
      data-export-menu-open={open ? 'true' : 'false'}
    >
      <TdmIconButton
        ref={triggerRef}
        type="button"
        variant="subtle"
        size="md"
        aria-label={THEORY_TRANSLATOR_LABELS.export}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        disabled={isExporting}
        tooltip={THEORY_TRANSLATOR_LABELS.export}
        onClick={() => setOpen((value) => !value)}
      >
        <ExportIcon />
      </TdmIconButton>

      {open ? (
        <TdmSurface
          id={menuId}
          as="div"
          variant="overlay"
          padding="sm"
          radius="md"
          className={styles.exportMenu}
          role="menu"
          aria-label={THEORY_TRANSLATOR_LABELS.exportMenu}
        >
          <p className={styles.exportMenuHeading} role="presentation">
            {heading}
          </p>
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              className={styles.exportMenuItem}
              disabled={item.disabled || isExporting}
              aria-disabled={item.disabled || undefined}
              onClick={() => {
                if (item.disabled) {
                  return;
                }
                setOpen(false);
                triggerRef.current?.focus();
                onExport(item.scope, item.format);
              }}
            >
              <span className={styles.exportMenuItemLabel}>{item.format.toUpperCase()}</span>
              {item.disabled ? <span className={styles.exportSoon}>Em breve</span> : null}
            </button>
          ))}
        </TdmSurface>
      ) : null}
    </div>
  );
}
