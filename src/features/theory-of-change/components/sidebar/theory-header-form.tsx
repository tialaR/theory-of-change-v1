'use client';

import { useRef } from 'react';
import { TdmClearFieldButton, TdmFormField } from '../form-field/tdm-form-field';
import fieldStyles from '../form-field/tdm-form-field.module.sass';
import styles from './theory-header-form.module.sass';

export const THEORY_DEFAULT_DESCRIPTION =
  'Teoria em construção que descreve como nossas ações levarão às mudanças desejadas.';

export function TheoryHeaderForm({
  theoryName,
  theoryDescription,
  onTheoryNameChange,
  onTheoryDescriptionChange
}: {
  theoryName: string;
  theoryDescription: string;
  onTheoryNameChange: (nextValue: string) => void;
  onTheoryDescriptionChange: (nextValue: string) => void;
}) {
  const nameInputRef = useRef<HTMLInputElement>(null);

  const trimName = () => {
    const trimmed = theoryName.trim();
    if (trimmed !== theoryName) onTheoryNameChange(trimmed);
  };

  return (
    <div className={styles.formCard}>
      <div className={fieldStyles.form}>
        <label className={fieldStyles.field}>
          <span className={fieldStyles.fieldLabel}>Sua teoria da mudança</span>
          <div className={fieldStyles.fieldControl}>
            <input
              ref={nameInputRef}
              className={fieldStyles.formInput}
              type="text"
              value={theoryName}
              placeholder="Nova teoria da mudança"
              aria-label="Nome da teoria da mudança"
              onChange={(event) => onTheoryNameChange(event.target.value)}
              onBlur={trimName}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  trimName();
                  nameInputRef.current?.blur();
                }
              }}
            />
            {theoryName ? (
              <TdmClearFieldButton
                ariaLabel="Limpar nome da teoria"
                onClear={() => onTheoryNameChange('')}
              />
            ) : null}
          </div>
        </label>
        <TdmFormField
          label="Descrição (opcional)"
          multiline
          rows={3}
          value={theoryDescription}
          placeholder={THEORY_DEFAULT_DESCRIPTION}
          clearAriaLabel="Limpar descrição da teoria"
          onChange={onTheoryDescriptionChange}
          onClear={() => onTheoryDescriptionChange('')}
        />
      </div>
    </div>
  );
}
