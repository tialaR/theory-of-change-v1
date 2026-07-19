'use client';

import { useRef } from 'react';
import { TdmField, TdmInput, TdmTextarea } from '@/shared/ui/tdm-field/tdm-field';
import { TdmIconButton } from '@/shared/ui/tdm-icon-button/tdm-icon-button';
import styles from './theory-header-form.module.sass';

export const THEORY_DEFAULT_DESCRIPTION =
  'Teoria em construção que descreve como nossas ações levarão às mudanças desejadas.';

function ClearFieldIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 12 12">
      <path d="M3 3l6 6M9 3 3 9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

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
      <TdmField
        label="Sua teoria da mudança"
        filled={Boolean(theoryName)}
        className={styles.panelField}
        trailingAdornment={
          theoryName ? (
            <TdmIconButton
              aria-label="Limpar nome da teoria"
              variant="ghost"
              size="sm"
              onPointerDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              onMouseDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                onTheoryNameChange('');
              }}
            >
              <ClearFieldIcon />
            </TdmIconButton>
          ) : null
        }
      >
        <TdmInput
          ref={nameInputRef}
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
      </TdmField>

      <TdmField
        label="Descrição (opcional)"
        filled={Boolean(theoryDescription)}
        className={styles.panelField}
        trailingAdornment={
          theoryDescription ? (
            <TdmIconButton
              aria-label="Limpar descrição da teoria"
              variant="ghost"
              size="sm"
              onPointerDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              onMouseDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                onTheoryDescriptionChange('');
              }}
            >
              <ClearFieldIcon />
            </TdmIconButton>
          ) : null
        }
      >
        <TdmTextarea
          rows={3}
          value={theoryDescription}
          placeholder={THEORY_DEFAULT_DESCRIPTION}
          aria-label="Descrição da teoria da mudança"
          onChange={(event) => onTheoryDescriptionChange(event.target.value)}
        />
      </TdmField>
    </div>
  );
}
