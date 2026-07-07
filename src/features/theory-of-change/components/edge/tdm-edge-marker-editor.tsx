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

const EYEBROWS: Record<TdmMarkerType, string> = {
  risk: 'Qualificar passagem',
  hypothesis: 'Explicitar lógica causal'
};

const TITLES: Record<TdmMarkerType, string> = {
  risk: 'Risco desta passagem',
  hypothesis: 'Hipótese desta passagem'
};

const SUBTITLES: Record<TdmMarkerType, string> = {
  risk: 'O que pode atrapalhar esta conexão?',
  hypothesis: 'Por que esta conexão deve funcionar?'
};

const SUPPORT_TEXT: Record<TdmMarkerType, string> = {
  risk: 'Escreva livremente uma situação que pode dificultar essa passagem.',
  hypothesis: 'Escreva livremente a lógica que liga a entrega ao resultado.'
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
      setError('Escreva algo antes de salvar.');
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
      <p className={styles.eyebrow}>{EYEBROWS[markerType]}</p>
      <h3 className={styles.title}>{TITLES[markerType]}</h3>
      <p className={styles.subtitle}>{SUBTITLES[markerType]}</p>
      <p className={styles.support}>{SUPPORT_TEXT[markerType]}</p>
      {error ? <p className={styles.error}>{error}</p> : null}
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
      <div className={styles.actions}>
        <button type="button" className={`${styles.button} ${styles.ghost}`} onClick={onCancel}>
          Cancelar
        </button>
        {initialText.trim() ? (
          <button type="button" className={`${styles.button} ${styles.danger}`} onClick={onDelete}>
            {DELETE_LABELS[markerType]}
          </button>
        ) : null}
        <button type="button" className={`${styles.button} ${styles.primary}`} onClick={handleSave}>
          {SAVE_LABELS[markerType]}
        </button>
      </div>
    </div>
  );
}
