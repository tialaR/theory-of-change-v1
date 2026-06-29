'use client';

import { Handle, NodeProps, Position } from '@xyflow/react';
import {
  createContext,
  useContext,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
  type SyntheticEvent
} from 'react';
import { TDM_STAGE_LABELS } from '../../domain/tdm-stages';
import { getTdmStageTheme } from '../../domain/tdm-theme';
import type { TdmNode as TdmNodeModel, TdmNodeDraft } from '../../domain/tdm-types';
import styles from './tdm-node.module.sass';

type TdmNodeInteractionContextValue = {
  editingNodeId: string | null;
  onBeginEditNode: (nodeId: string) => void;
  onCancelNodeEdit: () => void;
  onUpdateNode: (nodeId: string, nextDraft: TdmNodeDraft) => boolean;
  onDeleteNode: (nodeId: string) => void;
  onDuplicateNode: (nodeId: string) => void;
};

const TdmNodeInteractionContext = createContext<TdmNodeInteractionContextValue | null>(null);

export function TdmNodeInteractionProvider({
  children,
  value
}: {
  children: ReactNode;
  value: TdmNodeInteractionContextValue;
}) {
  return <TdmNodeInteractionContext.Provider value={value}>{children}</TdmNodeInteractionContext.Provider>;
}

export function useTdmNodeInteractions() {
  const context = useContext(TdmNodeInteractionContext);

  if (!context) {
    throw new Error('TdmNodeInteractionProvider is missing.');
  }

  return context;
}

export function TdmNode({ id, data, selected }: NodeProps<TdmNodeModel>) {
  const {
    editingNodeId: contextEditingNodeId,
    onBeginEditNode,
    onCancelNodeEdit,
    onUpdateNode: contextUpdateNode,
    onDeleteNode: contextDeleteNode,
    onDuplicateNode: contextDuplicateNode
  } = useTdmNodeInteractions();
  const isEditingInline = contextEditingNodeId === id;
  const isToolbarVisible = Boolean(data.isToolbarVisible);
  const onSelectNode = data.onSelectNode;
  const onCloseToolbar = data.onCloseToolbar;
  const onStartInlineEdit = data.onStartInlineEdit ?? onBeginEditNode;
  const onUpdateNode = data.onUpdateNode ?? contextUpdateNode;
  const onDeleteNode = data.onDeleteNode ?? contextDeleteNode;
  const onDuplicateNode = data.onDuplicateNode ?? contextDuplicateNode;
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [draft, setDraft] = useState<TdmNodeDraft>({
    title: data.title,
    description: data.description,
    advancedDetails: data.advancedDetails,
    shortNotes: data.shortNotes
  });

  const canReceive = data.stage !== 'input';
  const canSend = data.stage !== 'outcome';
  const theme = getTdmStageTheme(data.stage);
  const compactDescription = data.shortNotes || data.description;
  const updateField = (field: keyof TdmNodeDraft, value: string) => {
    setErrorMessage(null);
    setDraft((currentDraft) => ({
      ...currentDraft,
      [field]: value
    }));
  };

  const beginInlineEdit = () => {
    setDraft({
      title: data.title,
      description: data.description,
      advancedDetails: data.advancedDetails,
      shortNotes: data.shortNotes
    });
    setErrorMessage(null);
    onBeginEditNode(id);
  };

  const stopToolbarEvent = (event: SyntheticEvent) => {
    event.stopPropagation();
  };

  const handleSelectNode = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    if (isEditingInline) {
      return;
    }

    onSelectNode?.(id);
  };

  const handleCloseToolbarClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onCloseToolbar?.();
  };

  const handleEditToolbarClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onStartInlineEdit(data.nodeId ?? id);
  };

  const handleDuplicateToolbarClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onDuplicateNode(data.nodeId ?? id);
  };

  const handleDeleteToolbarClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onDeleteNode(data.nodeId ?? id);
  };

  return (
    <article
      className={[styles.nodeWrapper, styles.node, styles[data.stage], isEditingInline ? styles.editing : '', selected || data.isSelected ? styles.selected : ''].filter(Boolean).join(' ')}
      style={
        {
          '--node-accent': theme.accent,
          '--node-accent-soft': theme.accentSoft,
          '--node-border': theme.border,
          '--node-glow': theme.glow,
          '--node-surface': theme.surface
        } as CSSProperties
      }
      onDoubleClick={(event) => {
        event.stopPropagation();
        beginInlineEdit();
      }}
      onPointerDown={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
      onClick={handleSelectNode}
    >
      {isToolbarVisible && !isEditingInline ? (
        <div className={`${styles.nodeToolbar} nodrag nopan`}>
          <button
            type="button"
            className={styles.nodeToolbarButton}
            onPointerDown={stopToolbarEvent}
            onMouseDown={stopToolbarEvent}
            onClick={handleCloseToolbarClick}
            aria-label="Fechar toolbar"
            title="Fechar toolbar"
          >
            <span className={styles.nodeToolbarIcon} aria-hidden="true">
              <CloseIcon />
            </span>
            <span>Fechar</span>
          </button>

          <span className={styles.nodeToolbarDivider} aria-hidden="true" />

          <button
            type="button"
            className={styles.nodeToolbarButton}
            onPointerDown={stopToolbarEvent}
            onMouseDown={stopToolbarEvent}
            onClick={handleEditToolbarClick}
            aria-label="Editar bloco"
            title="Editar bloco"
          >
            <span className={styles.nodeToolbarIcon} aria-hidden="true">
              <EditIcon />
            </span>
            <span>Editar</span>
          </button>

          <span className={styles.nodeToolbarDivider} aria-hidden="true" />

          <button
            type="button"
            className={styles.nodeToolbarButton}
            onPointerDown={stopToolbarEvent}
            onMouseDown={stopToolbarEvent}
            onClick={handleDuplicateToolbarClick}
            aria-label="Duplicar bloco"
            title="Duplicar bloco"
          >
            <span className={styles.nodeToolbarIcon} aria-hidden="true">
              <DuplicateIcon />
            </span>
            <span>Duplicar</span>
          </button>

          <span className={styles.nodeToolbarDivider} aria-hidden="true" />

          <button
            type="button"
            className={`${styles.nodeToolbarButton} ${styles.nodeToolbarButtonDanger}`}
            onPointerDown={stopToolbarEvent}
            onMouseDown={stopToolbarEvent}
            onClick={handleDeleteToolbarClick}
            aria-label="Deletar bloco"
            title="Deletar bloco"
          >
            <span className={styles.nodeToolbarIcon} aria-hidden="true">
              <TrashIcon />
            </span>
            <span>Deletar</span>
          </button>
        </div>
      ) : null}
      {isEditingInline ? (
        <div
          className={[styles.editor, 'nodrag', 'nopan'].join(' ')}
          onPointerDown={(event) => event.stopPropagation()}
          onMouseDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
        >
          <div className={styles.editorHeader}>
            <div>
              <div className={styles.stage}>{TDM_STAGE_LABELS[data.stage]}</div>
              <h3 className={styles.title}>Editar bloco</h3>
            </div>
          </div>
          <label className={styles.field}>
            <span>Título</span>
            <input
              className="nodrag nopan"
              type="text"
              value={draft.title}
              onChange={(event) => updateField('title', event.target.value)}
              placeholder="Título do bloco"
            />
          </label>
          <label className={styles.field}>
            <span>Descrição breve</span>
            <textarea
              className="nodrag nopan"
              rows={2}
              value={draft.description}
              onChange={(event) => updateField('description', event.target.value)}
              placeholder="Descrição curta"
            />
          </label>
          <label className={styles.field}>
            <span>Detalhes avançados</span>
            <textarea
              className="nodrag nopan"
              rows={2}
              value={draft.advancedDetails}
              onChange={(event) => updateField('advancedDetails', event.target.value)}
              placeholder="Detalhes complementares"
            />
          </label>
          <label className={styles.field}>
            <span>Notas curtas</span>
            <input
              className="nodrag nopan"
              type="text"
              value={draft.shortNotes}
              onChange={(event) => updateField('shortNotes', event.target.value)}
              placeholder="Notas rápidas"
            />
          </label>
          {errorMessage ? <p className={styles.errorMessage}>{errorMessage}</p> : null}
          <div className={styles.inlineEditActions}>
            <button
              type="button"
              className={[styles.primaryButton, 'nodrag', 'nopan'].join(' ')}
              onPointerDown={(event) => event.stopPropagation()}
              onMouseDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                if (!draft.title.trim()) {
                  setErrorMessage('Dê um nome para este bloco antes de salvar.');
                  return;
                }

                const didUpdate = onUpdateNode(id, draft);
                if (!didUpdate) {
                  setErrorMessage('Não foi possível salvar este bloco.');
                  return;
                }

                setErrorMessage(null);
              }}
            >
              Salvar alterações
            </button>
            <button
              type="button"
              className={[styles.secondaryButton, 'nodrag', 'nopan'].join(' ')}
              onPointerDown={(event) => event.stopPropagation()}
              onMouseDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                onCancelNodeEdit();
              }}
            >
              Fechar
            </button>
          </div>
        </div>
      ) : (
        <div className={[styles.nodeCard, styles.compactBody].join(' ')}>
          <div className={styles.headerRow}>
            <div className={styles.stage}>{TDM_STAGE_LABELS[data.stage]}</div>
          </div>
          <h3 className={styles.title}>{data.title}</h3>
          {compactDescription ? <p className={styles.description}>{compactDescription}</p> : null}
        </div>
      )}
      {canReceive ? <Handle type="target" position={Position.Left} className={styles.handle} /> : null}
      {canSend ? <Handle type="source" position={Position.Right} className={styles.handle} /> : null}
    </article>
  );
}

function CloseIcon() {
  return (
    <svg className={styles.nodeToolbarSvgClose} viewBox="0 0 39 39" fill="none" aria-hidden="true">
      <path
        d="M10.5 10.5L28.5 28.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M28.5 10.5L10.5 28.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg className={styles.nodeToolbarSvg} viewBox="0 0 43 43" fill="none" aria-hidden="true">
      <path
        d="M11.2 30.9L12.4 24.4L26.2 10.6C28.3 8.5 31.8 8.5 33.9 10.6C36 12.7 36 16.2 33.9 18.3L20.1 32.1L13.6 33.3C12.1 33.6 10.9 32.4 11.2 30.9Z"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24.3 12.7L31.8 20.2"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DuplicateIcon() {
  return (
    <svg className={styles.nodeToolbarSvg} viewBox="0 0 43 43" fill="none" aria-hidden="true">
      <rect
        x="9"
        y="14"
        width="18"
        height="22"
        rx="2.8"
        stroke="currentColor"
        strokeWidth="2.3"
      />
      <rect
        x="16"
        y="7"
        width="18"
        height="22"
        rx="2.8"
        stroke="currentColor"
        strokeWidth="2.3"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className={styles.nodeToolbarSvg} viewBox="0 0 43 43" fill="none" aria-hidden="true">
      <path
        d="M11 14.5H32"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M18 14.5V10.8C18 9.4 19.1 8.3 20.5 8.3H22.5C23.9 8.3 25 9.4 25 10.8V14.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M14.2 18.5L15.5 32.2C15.7 34.2 17.3 35.7 19.3 35.7H23.7C25.7 35.7 27.3 34.2 27.5 32.2L28.8 18.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
