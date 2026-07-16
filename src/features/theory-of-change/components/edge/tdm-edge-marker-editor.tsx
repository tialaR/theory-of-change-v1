'use client';

import { useEffect, useState } from 'react';
import type { TdmMarkerType } from '../../domain/tdm-types';
import { TdmClearFieldButton } from '../form-field/tdm-form-field';
import styles from './tdm-edge-marker-editor.module.sass';

type TdmEdgeMarkerEditorProps = {
  markerType: TdmMarkerType;
  initialText: string;
  onSave: (text: string) => void;
  onDelete: () => void;
  onCancel: () => void;
};

const HEADER_TITLES: Record<TdmMarkerType, string> = {
  risk: 'Risco',
  hypothesis: 'Hipótese'
};

const PLACEHOLDERS: Record<TdmMarkerType, string> = {
  risk: 'Ex.: baixa adesão, atraso de recursos, equipe insuficiente...',
  hypothesis: 'Ex.: se as escolas usarem os planos, então poderão acompanhar melhor a aprendizagem...'
};

const SAVE_LABELS: Record<TdmMarkerType, string> = {
  risk: 'Salvar risco',
  hypothesis: 'Salvar hipótese'
};

const DELETE_LABELS: Record<TdmMarkerType, string> = {
  risk: 'Remover risco',
  hypothesis: 'Remover hipótese'
};

const CLEAR_LABELS: Record<TdmMarkerType, string> = {
  risk: 'Limpar risco',
  hypothesis: 'Limpar hipótese'
};

export function TdmEdgeMarkerEditor({
  markerType,
  initialText,
  onSave,
  onDelete,
  onCancel
}: TdmEdgeMarkerEditorProps) {
  const [draft, setDraft] = useState(initialText);
  const [error, setError] = useState<string | null>(null);
  const canDelete = Boolean(initialText.trim());
  const hasDraftText = Boolean(draft);

  useEffect(() => {
    setDraft(initialText);
    setError(null);
  }, [initialText, markerType]);

  const handleSave = () => {
    const trimmed = draft.trim();

    if (!trimmed) {
      setError('Escreva algo antes de salvar.');
      return;
    }

    onSave(trimmed);
  };

  const handleClearDraft = () => {
    setDraft('');
    setError(null);
  };

  return (
    <div
      className={`${styles.editor} nodrag nopan`}
      onPointerDown={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      <header className={styles.header}>
        <div className={styles.headerLead}>
          <span className={styles.headerIcon} aria-hidden="true">
            {markerType === 'risk' ? <WarningIcon /> : <HypothesisIcon />}
          </span>
          <h3 className={styles.headerTitle}>{HEADER_TITLES[markerType]}</h3>
        </div>
        <div className={styles.headerActions}>
          {canDelete ? (
            <button
              type="button"
              className={`${styles.iconButton} ${styles.iconButtonDanger}`}
              aria-label={DELETE_LABELS[markerType]}
              title={DELETE_LABELS[markerType]}
              onClick={onDelete}
            >
              <TrashIcon />
            </button>
          ) : null}
          <button
            type="button"
            className={styles.iconButton}
            aria-label="Fechar"
            title="Fechar"
            onClick={onCancel}
          >
            <CloseIcon />
          </button>
        </div>
      </header>

      {error ? <p className={styles.error}>{error}</p> : null}

      <div className={styles.textareaField}>
        <textarea
          className={styles.textarea}
          value={draft}
          placeholder={PLACEHOLDERS[markerType]}
          rows={3}
          autoFocus
          onChange={(event) => {
            setDraft(event.target.value);
            setError(null);
          }}
        />
        {hasDraftText ? (
          <TdmClearFieldButton
            ariaLabel={CLEAR_LABELS[markerType]}
            onClear={handleClearDraft}
            className={styles.clearButton}
          />
        ) : null}
      </div>

      <button type="button" className={styles.primary} onClick={handleSave}>
        {SAVE_LABELS[markerType]}
      </button>
    </div>
  );
}

function WarningIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 3.2 13.4 12.8H2.6L8 3.2Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
      <path d="M8 7.1V9.6" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
      <circle cx="8" cy="11.4" r="0.75" fill="currentColor" />
    </svg>
  );
}

function HypothesisIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.25" />
      <path d="M8 7.1V11" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
      <circle cx="8" cy="5.1" r="0.75" fill="currentColor" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3.5 4.5h9" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
      <path
        d="M6.1 4.5V3.35C6.1 2.88 6.48 2.5 6.95 2.5h2.1c.47 0 .85.38.85.85V4.5"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
      <path
        d="M5.1 6.2l.45 6.1c.07.72.68 1.25 1.4 1.25h2.1c.72 0 1.33-.53 1.4-1.25l.45-6.1"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4.8 4.8 11.2 11.2M11.2 4.8 4.8 11.2" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
    </svg>
  );
}
