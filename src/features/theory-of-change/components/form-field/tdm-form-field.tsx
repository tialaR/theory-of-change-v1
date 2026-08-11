'use client';

import type { PointerEvent } from 'react';
import { TdmField, TdmInput, TdmTextarea } from '@/shared/ui/tdm-field';
import { TdmIconButton } from '@/shared/ui/tdm-icon-button/tdm-icon-button';
import type { TdmNodeDraft } from '../../domain/tdm-types';
import fieldStyles from './tdm-form-field.module.sass';

export const TDM_FIELD_PLACEHOLDERS = {
  title: 'Nome do bloco',
  description: 'Descreva rapidamente este bloco.',
  advancedDetails: 'Detalhes complementares do bloco.',
  shortNotes: 'Notas de apoio...'
} as const;

export const TDM_FIELD_CLEAR_LABELS: Record<keyof TdmNodeDraft, string> = {
  title: 'Limpar título',
  description: 'Limpar descrição breve',
  advancedDetails: 'Limpar detalhes avançados',
  shortNotes: 'Limpar notas curtas'
};

export type TdmFormFieldClassNames = {
  field?: string;
  label?: string;
  control?: string;
  input?: string;
  textarea?: string;
  clearButton?: string;
  clearIcon?: string;
};

function ClearFieldIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 12 12">
      <path d="M3 3l6 6M9 3 3 9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function TdmClearFieldButton({
  ariaLabel,
  onClear,
  className,
  iconClassName
}: {
  ariaLabel: string;
  onClear: () => void;
  className?: string;
  iconClassName?: string;
}) {
  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <button
      type="button"
      className={[fieldStyles.clearFieldButton, className].filter(Boolean).join(' ')}
      aria-label={ariaLabel}
      onPointerDown={handlePointerDown}
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.stopPropagation();
        onClear();
      }}
    >
      <svg className={iconClassName} aria-hidden="true" viewBox="0 0 12 12">
        <path d="M3 3l6 6M9 3 3 9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </button>
  );
}

export function TdmFormField({
  label,
  value,
  placeholder,
  clearAriaLabel,
  multiline = false,
  rows = 3,
  inputClassName,
  classNames,
  onChange,
  onClear
}: {
  label: string;
  value: string;
  placeholder?: string;
  clearAriaLabel: string;
  multiline?: boolean;
  rows?: number;
  inputClassName?: string;
  classNames?: TdmFormFieldClassNames;
  onChange: (nextValue: string) => void;
  onClear: () => void;
}) {
  return (
    <TdmField
      label={label}
      size="sm"
      filled={Boolean(value)}
      className={[fieldStyles.field, classNames?.field].filter(Boolean).join(' ')}
      trailingAdornment={
        value ? (
          <TdmIconButton
            aria-label={clearAriaLabel}
            variant="ghost"
            size="sm"
            className={classNames?.clearButton}
            onPointerDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            onMouseDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              onClear();
            }}
          >
            <ClearFieldIcon />
          </TdmIconButton>
        ) : null
      }
    >
      {multiline ? (
        <TdmTextarea
          className={[fieldStyles.formTextarea, classNames?.textarea, inputClassName].filter(Boolean).join(' ')}
          rows={rows}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <TdmInput
          className={[fieldStyles.formInput, classNames?.input, inputClassName].filter(Boolean).join(' ')}
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </TdmField>
  );
}

export function TdmBlockFormFields({
  draft,
  onDraftChange,
  inputClassName,
  classNames
}: {
  draft: TdmNodeDraft;
  onDraftChange: (nextDraft: TdmNodeDraft) => void;
  inputClassName?: string;
  classNames?: TdmFormFieldClassNames;
}) {
  const updateField = (field: keyof TdmNodeDraft, value: string) => {
    onDraftChange({ ...draft, [field]: value });
  };

  const clearField = (field: keyof TdmNodeDraft) => {
    onDraftChange({ ...draft, [field]: '' });
  };

  return (
    <div className={fieldStyles.form}>
      <TdmFormField
        label="Título"
        value={draft.title}
        placeholder={TDM_FIELD_PLACEHOLDERS.title}
        clearAriaLabel={TDM_FIELD_CLEAR_LABELS.title}
        inputClassName={inputClassName}
        classNames={classNames}
        onChange={(value) => updateField('title', value)}
        onClear={() => clearField('title')}
      />
      <TdmFormField
        label="Descrição breve"
        value={draft.description}
        placeholder={TDM_FIELD_PLACEHOLDERS.description}
        clearAriaLabel={TDM_FIELD_CLEAR_LABELS.description}
        multiline
        inputClassName={inputClassName}
        classNames={classNames}
        onChange={(value) => updateField('description', value)}
        onClear={() => clearField('description')}
      />
      <TdmFormField
        label="Detalhes avançados"
        value={draft.advancedDetails}
        placeholder={TDM_FIELD_PLACEHOLDERS.advancedDetails}
        clearAriaLabel={TDM_FIELD_CLEAR_LABELS.advancedDetails}
        multiline
        inputClassName={inputClassName}
        classNames={classNames}
        onChange={(value) => updateField('advancedDetails', value)}
        onClear={() => clearField('advancedDetails')}
      />
      <TdmFormField
        label="Notas curtas"
        value={draft.shortNotes}
        placeholder={TDM_FIELD_PLACEHOLDERS.shortNotes}
        clearAriaLabel={TDM_FIELD_CLEAR_LABELS.shortNotes}
        inputClassName={inputClassName}
        classNames={classNames}
        onChange={(value) => updateField('shortNotes', value)}
        onClear={() => clearField('shortNotes')}
      />
    </div>
  );
}
