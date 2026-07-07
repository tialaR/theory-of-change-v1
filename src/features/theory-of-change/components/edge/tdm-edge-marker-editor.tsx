'use client';

import { useEffect, useState } from 'react';
import type { TdmMarkerType } from '../../domain/tdm-types';
import styles from './tdm-edge-marker-editor.module.sass';

type TdmEdgeMarkerEditorProps = {
  markerType: TdmMarkerType;
  initialText: string;
  onSave: (text: string) => void;
  onDelete: () => void;
  onCancel: () => void;
};

const TITLES: Record<TdmMarkerType, string> = {
  risk: 'Risco desta passagem',
  hypothesis: 'Hipótese desta passagem'
};

const PLACEHOLDERS: Record<TdmMarkerType, string> = {
  risk: 'Descreva o risco desta passagem...',
  hypothesis: 'Descreva a hipótese desta passagem...'
};

const SAVE_LABELS: Record<TdmMarkerType, string> = {
  risk: 'Salvar risco',
  hypothesis: 'Salvar hipótese'
};

const DELETE_LABELS: Record<TdmMarkerType, string> = {
  risk: 'Excluir risco',
  hypothesis: 'Excluir hipótese'
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

  useEffect(() => {
    setDraft(initialText);
    setError(null);
  }, [initialText, markerType]);

  const handleSave = () => {
    const trimmed = draft.trim();

    if (!trimmed) {
      setError('Descreva o conteúdo antes de salvar.');
      return;
    }

    onSave(trimmed);
  };

  return (
    <div
      className={`${styles.editor} nodrag nopan`}
      onPointerDown={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      <h3 className={styles.title}>{TITLES[markerType]}</h3>
      {error ? <p className={styles.error}>{error}</p> : null}
      <textarea
        className={styles.textarea}
        value={draft}
        placeholder={PLACEHOLDERS[markerType]}
        rows={4}
        onChange={(event) => {
          setDraft(event.target.value);
          setError(null);
        }}
      />
      <div className={styles.actions}>
        <button type="button" className={`${styles.button} ${styles.primary}`} onClick={handleSave}>
          {SAVE_LABELS[markerType]}
        </button>
        {initialText.trim() ? (
          <button type="button" className={`${styles.button} ${styles.danger}`} onClick={onDelete}>
            {DELETE_LABELS[markerType]}
          </button>
        ) : null}
        <button type="button" className={`${styles.button} ${styles.ghost}`} onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </div>
  );
}
