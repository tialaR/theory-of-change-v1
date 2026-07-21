'use client';

import { Handle, NodeProps, Position, useUpdateNodeInternals } from '@xyflow/react';
import {
  createContext,
  memo,
  useContext,
  useEffect,
  useState,
  type CSSProperties,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  type SyntheticEvent
} from 'react';
import { TdmIconButton } from '@/shared/ui/tdm-icon-button/tdm-icon-button';
import type { TdmNode as TdmNodeModel, TdmNodeDraft } from '../../../domain/tdm-types';
import { TdmCanvasNodeCard } from '../tdm-canvas-node-card';
import { TdmCanvasNodeForm } from '../tdm-canvas-node-form';
import { TDM_CANVAS_NODE_STAGE_ACCENTS } from './tdm-canvas-node-stage';
import styles from './tdm-canvas-node.module.sass';
import type {
  TdmCanvasNodeShellProps,
  TdmCanvasNodeVisualMode
} from './tdm-canvas-node.types';

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

function TdmCanvasNodeShell({
  mode,
  stage,
  selected,
  connectionTarget,
  toolbarOpen,
  stageAccent,
  className,
  style,
  children,
  onPointerDownCapture,
  onDoubleClick
}: TdmCanvasNodeShellProps) {
  const shellClassName = [
    styles.node,
    styles[stage],
    mode === 'edit' ? styles.editing : '',
    toolbarOpen && mode !== 'edit' ? styles.toolbarOpen : '',
    selected ? styles.selected : '',
    connectionTarget ? styles.connectionTarget : '',
    className
  ]
    .filter(Boolean)
    .join(' ');

  const shellStyle = {
    ...style,
    '--stage-color': stageAccent.color,
    '--stage-soft': stageAccent.soft
  } as CSSProperties;

  return (
    <article
      className={shellClassName}
      style={shellStyle}
      data-mode={mode}
      onPointerDownCapture={onPointerDownCapture}
      onDoubleClick={onDoubleClick}
    >
      {children}
    </article>
  );
}

function stopToolbarEvent(event: SyntheticEvent) {
  event.stopPropagation();
}

export const TdmCanvasNode = memo(function TdmCanvasNode({ id, data, selected }: NodeProps<TdmNodeModel>) {
  const {
    editingNodeId: contextEditingNodeId,
    onBeginEditNode,
    onCancelNodeEdit,
    onUpdateNode: contextUpdateNode,
    onDeleteNode: contextDeleteNode,
    onDuplicateNode: contextDuplicateNode
  } = useTdmNodeInteractions();
  const updateNodeInternals = useUpdateNodeInternals();
  const isEditingInline = contextEditingNodeId === id;
  const mode: TdmCanvasNodeVisualMode = isEditingInline ? 'edit' : 'compact';
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
  const compactDescription = data.shortNotes || data.description;
  const stageAccent = TDM_CANVAS_NODE_STAGE_ACCENTS[data.stage];
  const isSelected = selected || Boolean(data.isSelected);
  const nodeKey = data.nodeId ?? id;

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      updateNodeInternals(id);
    });

    return () => cancelAnimationFrame(frame);
  }, [id, isEditingInline, updateNodeInternals]);

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

  const handleSelectPointerDown = (event: PointerEvent<HTMLElement>) => {
    if (event.button !== 0) {
      return;
    }

    const target = event.target as HTMLElement | null;
    if (target?.closest('.nodrag, .nopan, button, a, input, textarea, select, label, [role="button"]')) {
      // Keep selection when interacting with form chrome; do not re-fire.
      if (!isSelected) {
        onSelectNode?.(id);
      }
      return;
    }

    if (!isSelected) {
      onSelectNode?.(id);
    }
  };

  const handleCloseToolbarClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onCloseToolbar?.();
  };

  const handleEditToolbarClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onStartInlineEdit(nodeKey);
  };

  const handleDuplicateToolbarClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onDuplicateNode(nodeKey);
  };

  const handleDeleteToolbarClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onDeleteNode(nodeKey);
  };

  const handleSaveClick = (event: MouseEvent<HTMLButtonElement>) => {
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
  };

  const handleCancelClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onCancelNodeEdit();
  };

  const handleDraftChange = (nextDraft: TdmNodeDraft) => {
    setErrorMessage(null);
    setDraft(nextDraft);
  };

  return (
    <TdmCanvasNodeShell
      mode={mode}
      stage={data.stage}
      selected={isSelected}
      connectionTarget={Boolean(data.isValidConnectionTarget)}
      toolbarOpen={isToolbarVisible && !isEditingInline}
      stageAccent={stageAccent}
      onPointerDownCapture={handleSelectPointerDown}
      onDoubleClick={(event) => {
        event.stopPropagation();
        beginInlineEdit();
      }}
    >
      {isToolbarVisible && !isEditingInline ? (
        <div className={`${styles.toolbar} nodrag nopan`} data-export-exclude="true">
          <TdmIconButton
            type="button"
            variant="ghost"
            size="sm"
            className={styles.toolbarButton}
            aria-label="Fechar toolbar"
            tooltip="Fechar toolbar"
            tooltipSkin="canvas"
            onPointerDown={stopToolbarEvent}
            onMouseDown={stopToolbarEvent}
            onClick={handleCloseToolbarClick}
          >
            <CloseIcon />
          </TdmIconButton>

          <span className={styles.toolbarDivider} aria-hidden="true" />

          <TdmIconButton
            type="button"
            variant="ghost"
            size="sm"
            className={styles.toolbarButton}
            aria-label="Editar bloco"
            tooltip="Editar bloco"
            tooltipSkin="canvas"
            onPointerDown={stopToolbarEvent}
            onMouseDown={stopToolbarEvent}
            onClick={handleEditToolbarClick}
          >
            <EditIcon />
          </TdmIconButton>

          <span className={styles.toolbarDivider} aria-hidden="true" />

          <TdmIconButton
            type="button"
            variant="ghost"
            size="sm"
            className={styles.toolbarButton}
            aria-label="Duplicar bloco"
            tooltip="Duplicar bloco"
            tooltipSkin="canvas"
            onPointerDown={stopToolbarEvent}
            onMouseDown={stopToolbarEvent}
            onClick={handleDuplicateToolbarClick}
          >
            <DuplicateIcon />
          </TdmIconButton>

          <span className={styles.toolbarDivider} aria-hidden="true" />

          <TdmIconButton
            type="button"
            variant="destructive"
            size="sm"
            className={`${styles.toolbarButton} ${styles.toolbarDelete}`}
            aria-label="Deletar bloco"
            tooltip="Deletar bloco"
            tooltipSkin="canvas"
            onPointerDown={stopToolbarEvent}
            onMouseDown={stopToolbarEvent}
            onClick={handleDeleteToolbarClick}
          >
            <TrashIcon />
          </TdmIconButton>
        </div>
      ) : null}

      {isEditingInline ? (
        <TdmCanvasNodeForm
          stage={data.stage}
          draft={draft}
          errorMessage={errorMessage}
          onDraftChange={handleDraftChange}
          onSave={handleSaveClick}
          onCancel={handleCancelClick}
        />
      ) : (
        <TdmCanvasNodeCard
          stage={data.stage}
          title={data.title}
          description={compactDescription || undefined}
        />
      )}

      {canReceive ? (
        <Handle type="target" position={Position.Left} className={styles.handle} data-export-exclude="true" />
      ) : null}
      {canSend ? (
        <Handle type="source" position={Position.Right} className={styles.handle} data-export-exclude="true" />
      ) : null}
    </TdmCanvasNodeShell>
  );
});

function CloseIcon() {
  return (
    <svg className={styles.toolbarSvg} viewBox="0 0 39 39" fill="none" aria-hidden="true">
      <path d="M10.5 10.5L28.5 28.5" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" />
      <path d="M28.5 10.5L10.5 28.5" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg className={styles.toolbarSvg} viewBox="0 0 43 43" fill="none" aria-hidden="true">
      <path
        d="M11.2 30.9L12.4 24.4L26.2 10.6C28.3 8.5 31.8 8.5 33.9 10.6C36 12.7 36 16.2 33.9 18.3L20.1 32.1L13.6 33.3C12.1 33.6 10.9 32.4 11.2 30.9Z"
        stroke="currentColor"
        strokeWidth="1.55"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M24.3 12.7L31.8 20.2" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" />
    </svg>
  );
}

function DuplicateIcon() {
  return (
    <svg className={styles.toolbarSvg} viewBox="0 0 43 43" fill="none" aria-hidden="true">
      <rect x="9" y="14" width="18" height="22" rx="2.8" stroke="currentColor" strokeWidth="1.55" />
      <rect x="16" y="7" width="18" height="22" rx="2.8" stroke="currentColor" strokeWidth="1.55" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className={styles.toolbarSvg} viewBox="0 0 43 43" fill="none" aria-hidden="true">
      <path d="M11 14.5H32" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" />
      <path
        d="M18 14.5V10.8C18 9.4 19.1 8.3 20.5 8.3H22.5C23.9 8.3 25 9.4 25 10.8V14.5"
        stroke="currentColor"
        strokeWidth="1.55"
        strokeLinecap="round"
      />
      <path
        d="M14.2 18.5L15.5 32.2C15.7 34.2 17.3 35.7 19.3 35.7H23.7C25.7 35.7 27.3 34.2 27.5 32.2L28.8 18.5"
        stroke="currentColor"
        strokeWidth="1.55"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
