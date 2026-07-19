'use client';

import type { MouseEvent, SyntheticEvent } from 'react';
import { TdmButton } from '@/shared/ui/tdm-button/tdm-button';
import { TdmField, TdmInput, TdmTextarea } from '@/shared/ui/tdm-field/tdm-field';
import { TdmIconButton } from '@/shared/ui/tdm-icon-button/tdm-icon-button';
import type { TdmStage } from '../../../domain/tdm-stages';
import type { TdmNodeDraft } from '../../../domain/tdm-types';
import {
  TDM_FIELD_CLEAR_LABELS,
  TDM_FIELD_PLACEHOLDERS
} from '../../form-field/tdm-form-field';
import { TdmCanvasNodeCardHeader } from '../tdm-canvas-node-card';
import styles from './tdm-canvas-node-form.module.sass';

function ClearFieldIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 12 12">
      <path d="M3 3l6 6M9 3 3 9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function stopToolbarEvent(event: SyntheticEvent) {
  event.stopPropagation();
}

function ClearDraftAdornment({
  value,
  ariaLabel,
  onClear
}: {
  value: string;
  ariaLabel: string;
  onClear: () => void;
}) {
  if (!value) {
    return null;
  }

  return (
    <TdmIconButton
      aria-label={ariaLabel}
      variant="ghost"
      size="sm"
      className="nodrag nopan"
      onPointerDown={(event) => {
        event.preventDefault();
        stopToolbarEvent(event);
      }}
      onMouseDown={stopToolbarEvent}
      onClick={(event) => {
        stopToolbarEvent(event);
        onClear();
      }}
    >
      <ClearFieldIcon />
    </TdmIconButton>
  );
}

export function TdmCanvasNodeForm({
  stage,
  draft,
  errorMessage,
  onDraftChange,
  onSave,
  onCancel
}: {
  stage: TdmStage;
  draft: TdmNodeDraft;
  errorMessage: string | null;
  onDraftChange: (nextDraft: TdmNodeDraft) => void;
  onSave: (event: MouseEvent<HTMLButtonElement>) => void;
  onCancel: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
  const updateField = (field: keyof TdmNodeDraft, value: string) => {
    onDraftChange({ ...draft, [field]: value });
  };

  const clearField = (field: keyof TdmNodeDraft) => {
    onDraftChange({ ...draft, [field]: '' });
  };

  return (
    <div className={styles.editForm}>
      <TdmCanvasNodeCardHeader stage={stage} />

      <div className={styles.editFields}>
        <TdmField
          label="Título"
          required
          size="sm"
          filled={Boolean(draft.title)}
          invalid={Boolean(errorMessage)}
          error={errorMessage}
          className={styles.field}
          trailingAdornment={
            <ClearDraftAdornment
              value={draft.title}
              ariaLabel={TDM_FIELD_CLEAR_LABELS.title}
              onClear={() => clearField('title')}
            />
          }
        >
          <TdmInput
            type="text"
            className={`nodrag nopan ${styles.control}`}
            value={draft.title}
            placeholder={TDM_FIELD_PLACEHOLDERS.title}
            onChange={(event) => updateField('title', event.target.value)}
          />
        </TdmField>

        <TdmField
          label="Descrição breve"
          size="sm"
          filled={Boolean(draft.description)}
          className={styles.field}
          trailingAdornment={
            <ClearDraftAdornment
              value={draft.description}
              ariaLabel={TDM_FIELD_CLEAR_LABELS.description}
              onClear={() => clearField('description')}
            />
          }
        >
          <TdmTextarea
            className={`nodrag nopan ${styles.control}`}
            rows={3}
            value={draft.description}
            placeholder={TDM_FIELD_PLACEHOLDERS.description}
            onChange={(event) => updateField('description', event.target.value)}
          />
        </TdmField>

        <TdmField
          label="Detalhes avançados"
          size="sm"
          filled={Boolean(draft.advancedDetails)}
          className={styles.field}
          trailingAdornment={
            <ClearDraftAdornment
              value={draft.advancedDetails}
              ariaLabel={TDM_FIELD_CLEAR_LABELS.advancedDetails}
              onClear={() => clearField('advancedDetails')}
            />
          }
        >
          <TdmTextarea
            className={`nodrag nopan ${styles.control}`}
            rows={3}
            value={draft.advancedDetails}
            placeholder={TDM_FIELD_PLACEHOLDERS.advancedDetails}
            onChange={(event) => updateField('advancedDetails', event.target.value)}
          />
        </TdmField>

        <TdmField
          label="Notas curtas"
          size="sm"
          filled={Boolean(draft.shortNotes)}
          className={styles.field}
          trailingAdornment={
            <ClearDraftAdornment
              value={draft.shortNotes}
              ariaLabel={TDM_FIELD_CLEAR_LABELS.shortNotes}
              onClear={() => clearField('shortNotes')}
            />
          }
        >
          <TdmInput
            type="text"
            className={`nodrag nopan ${styles.control}`}
            value={draft.shortNotes}
            placeholder={TDM_FIELD_PLACEHOLDERS.shortNotes}
            onChange={(event) => updateField('shortNotes', event.target.value)}
          />
        </TdmField>
      </div>

      <div className={styles.editActions}>
        <TdmButton
          type="button"
          variant="primary"
          tone={stage}
          size="sm"
          fullWidth
          className={`${styles.editAction} nodrag nopan`}
          onPointerDown={stopToolbarEvent}
          onMouseDown={stopToolbarEvent}
          onClick={onSave}
        >
          Salvar
        </TdmButton>
        <TdmButton
          type="button"
          variant="secondary"
          tone="neutral"
          size="sm"
          fullWidth
          className={`${styles.editAction} nodrag nopan`}
          onPointerDown={stopToolbarEvent}
          onMouseDown={stopToolbarEvent}
          onClick={onCancel}
        >
          Fechar
        </TdmButton>
      </div>
    </div>
  );
}
