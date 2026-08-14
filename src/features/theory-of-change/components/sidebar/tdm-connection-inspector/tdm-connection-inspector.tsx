'use client';

import type { ReactNode } from 'react';
import { TdmButton } from '@/shared/ui/tdm-button/tdm-button';
import { TdmField, TdmInput } from '@/shared/ui/tdm-field';
import { TdmIconButton } from '@/shared/ui/tdm-icon-button/tdm-icon-button';
import styles from './tdm-connection-inspector.module.sass';

function ConnectionIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="4" cy="8" r="2.25" stroke="currentColor" strokeWidth="1.35" />
      <circle cx="12" cy="8" r="2.25" stroke="currentColor" strokeWidth="1.35" />
      <path d="M6.25 8h3.5" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3.5 8.25 6.4 11.1 12.5 4.9"
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 3.25v9.5M3.25 8h9.5" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
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

function ClearIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M3 3l6 6M9 3 3 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function RouteArrowIcon() {
  return (
    <svg viewBox="0 0 28 12" fill="none" aria-hidden="true" className={styles.routeArrowIcon}>
      <path d="M1 6h22.5" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
      <path d="M20.5 2.25 25.5 6l-5 3.75" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ConnectionRouteSummary({ sourceLabel, targetLabel }: { sourceLabel: string; targetLabel: string }) {
  return (
    <div className={styles.route} role="group" aria-label={`${sourceLabel} para ${targetLabel}`}>
      <span className={styles.routeNode}>{sourceLabel}</span>
      <span className={styles.routeArrow} aria-hidden="true">
        <RouteArrowIcon />
      </span>
      <span className={styles.routeNode}>{targetLabel}</span>
    </div>
  );
}

function resolveStatusTitle(statusTitle: string) {
  if (statusTitle.startsWith('Conexão válida')) {
    return 'Conexão válida';
  }
  return statusTitle;
}

export function TdmConnectionInspector({
  sourceLabel,
  targetLabel,
  statusTitle = 'Conexão válida',
  statusSupport,
  canAddRisk,
  canAddHypothesis,
  onAddRisk,
  onAddHypothesis,
  onDelete
}: {
  sourceLabel: string;
  targetLabel: string;
  statusTitle?: string;
  statusSupport?: string;
  canAddRisk?: boolean;
  canAddHypothesis?: boolean;
  onAddRisk?: () => void;
  onAddHypothesis?: () => void;
  onDelete: () => void;
}) {
  const support =
    statusSupport ||
    (canAddRisk
      ? 'Você pode documentar o risco desta passagem.'
      : canAddHypothesis
        ? 'Você pode documentar a hipótese desta passagem.'
        : 'Você pode documentar o risco ou a hipótese desta passagem.');

  return (
    <div className={styles.inspector}>
      <header className={styles.header}>
        <span className={styles.headerIcon} aria-hidden="true">
          <ConnectionIcon />
        </span>
        <h3 className={styles.title}>Editar conexão entre:</h3>
      </header>

      <ConnectionRouteSummary sourceLabel={sourceLabel} targetLabel={targetLabel} />

      <div className={styles.status}>
        <span className={styles.statusIcon} aria-hidden="true">
          <CheckIcon />
        </span>
        <div className={styles.statusCopy}>
          <p className={styles.statusTitle}>{resolveStatusTitle(statusTitle)}</p>
          <p className={styles.statusSupport}>{support}</p>
        </div>
      </div>

      <div className={styles.actions}>
        {canAddRisk ? (
          <TdmButton
            variant="secondary"
            tone="neutral"
            size="sm"
            className={styles.actionButton}
            leadingIcon={<PlusIcon />}
            onClick={onAddRisk}
          >
            Adicionar risco
          </TdmButton>
        ) : null}
        {canAddHypothesis ? (
          <TdmButton
            variant="secondary"
            tone="neutral"
            size="sm"
            className={styles.actionButton}
            leadingIcon={<PlusIcon />}
            onClick={onAddHypothesis}
          >
            Adicionar hipótese
          </TdmButton>
        ) : null}
        <TdmButton
          variant="destructive"
          tone="danger"
          size="sm"
          className={styles.actionButton}
          leadingIcon={<TrashIcon />}
          onClick={onDelete}
        >
          Excluir conexão
        </TdmButton>
      </div>
    </div>
  );
}

export function TdmMarkerInspector({
  markerType,
  sourceLabel,
  targetLabel,
  markerText,
  isEditingExisting,
  onDraftChange,
  onSubmit,
  onDelete
}: {
  markerType: 'risk' | 'hypothesis';
  sourceLabel: string;
  targetLabel: string;
  markerText: string;
  /** Persisted marker on the edge — not the live draft. */
  isEditingExisting: boolean;
  onDraftChange: (nextValue: string) => void;
  onSubmit: () => void;
  onDelete: () => void;
}) {
  const isRisk = markerType === 'risk';
  const title = isRisk ? 'Editar risco entre:' : 'Editar hipótese entre:';
  const fieldLabel = isRisk ? 'Risco' : 'Hipótese';
  const placeholder = isRisk
    ? 'Ex.: baixa adesão, atraso de recursos, equipe insuficiente...'
    : 'Ex.: se as escolas usarem os planos, então poderão acompanhar melhor a aprendizagem...';
  const clearLabel = isRisk ? 'Limpar risco' : 'Limpar hipótese';
  // Create flow keeps current CTAs; edit uses the shared save label.
  const saveLabel = isEditingExisting ? 'Salvar alterações' : isRisk ? 'Salvar risco' : 'Salvar hipótese';
  const deleteLabel = isRisk ? 'Excluir risco' : 'Excluir hipótese';
  const headerIcon: ReactNode = isRisk ? <WarningIcon /> : <HypothesisIcon />;

  return (
    <div className={styles.inspector} data-marker-type={markerType}>
      <header className={styles.header}>
        <span className={styles.headerIcon} aria-hidden="true">
          {headerIcon}
        </span>
        <h3 className={styles.title}>{title}</h3>
      </header>

      <ConnectionRouteSummary sourceLabel={sourceLabel} targetLabel={targetLabel} />

      <TdmField
        label={fieldLabel}
        size="sm"
        filled={Boolean(markerText)}
        className={styles.markerField}
        trailingAdornment={
          markerText ? (
            <TdmIconButton aria-label={clearLabel} variant="ghost" size="sm" onClick={() => onDraftChange('')}>
              <ClearIcon />
            </TdmIconButton>
          ) : null
        }
      >
        <TdmInput
          value={markerText}
          placeholder={placeholder}
          aria-label={fieldLabel}
          onChange={(event) => onDraftChange(event.target.value)}
        />
      </TdmField>

      <div className={styles.actions}>
        <TdmButton variant="primary" tone="neutral" size="sm" className={styles.actionButton} onClick={onSubmit}>
          {saveLabel}
        </TdmButton>
        <TdmButton
          variant="destructive"
          tone="danger"
          size="sm"
          className={styles.actionButton}
          leadingIcon={<TrashIcon />}
          onClick={onDelete}
        >
          {deleteLabel}
        </TdmButton>
      </div>
    </div>
  );
}
