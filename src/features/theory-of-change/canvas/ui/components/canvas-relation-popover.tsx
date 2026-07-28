'use client';

import { CANVAS_FIELD_PLACEHOLDERS, CANVAS_TOOLTIP_LABELS } from '../../domain/canvas-ui.constants';
import { canvasIcons as icons } from '../canvas-icons';
import styles from '../canvas-workspace/canvas-workspace.module.sass';
import { useCanvasRuntime } from '../runtime/canvas-runtime-context';
import { ClearableField } from './clearable-field';

export function CanvasRelationPopover() {
  const runtime = useCanvasRuntime();
  const edge = runtime.selectedEdge;
  const relationKind = runtime.selectedRelationKind;
  const draft = runtime.ui.relationDraft;

  if (!edge || !relationKind || !runtime.ui.relationPopoverOpen) return null;

  const hasRelation = Boolean(edge.data?.relationKind);
  const relationLabel = relationKind === 'risk' ? 'R' : 'H';
  const addLabel = relationKind === 'risk'
    ? CANVAS_TOOLTIP_LABELS.addRisk
    : CANVAS_TOOLTIP_LABELS.addHypothesis;
  const editLabel = relationKind === 'risk'
    ? CANVAS_TOOLTIP_LABELS.editRisk
    : CANVAS_TOOLTIP_LABELS.editHypothesis;
  const removeLabel = relationKind === 'risk'
    ? CANVAS_TOOLTIP_LABELS.removeRisk
    : CANVAS_TOOLTIP_LABELS.removeHypothesis;

  return (
    <section
      data-edge-popover
      className={`${styles.edgePopover} ${styles.reactFlowEdgePopover} nodrag nopan`}
      data-mode={runtime.ui.relationPanelMode}
      data-kind="neutral"
      onPointerDown={(event) => event.stopPropagation()}
    >
      {runtime.ui.relationPanelMode === 'menu' ? (
        <div className={styles.edgeToolbar} role="toolbar" aria-label="Ações da conexão">
          <button
            type="button"
            data-tooltip={CANVAS_TOOLTIP_LABELS.closeRelation}
            onClick={runtime.ui.clearSelection}
          >
            {icons.close}
          </button>
          <button
            type="button"
            className={styles.relationKindButton}
            data-tooltip={hasRelation ? editLabel : addLabel}
            onClick={runtime.openRelationForm}
          >
            <span>{relationLabel}</span>
          </button>
          {hasRelation ? (
            <button
              type="button"
              className={styles.relationRemoveButton}
              data-tooltip={removeLabel}
              onClick={runtime.removeRelation}
            >
              <span data-remove="true">{relationLabel}</span>
            </button>
          ) : null}
          <button
            type="button"
            data-tooltip={CANVAS_TOOLTIP_LABELS.deleteConnection}
            onClick={runtime.deleteConnection}
          >
            {icons.trash}
          </button>
        </div>
      ) : (
        <>
          <div className={styles.compactRelationHeader}>
            <span className={styles.relationBadge}>{relationLabel}</span>
            <strong>{relationKind === 'risk' ? 'Risco' : 'Hipótese'}</strong>
          </div>
          <label className={styles.compactRelationField}>
            <span>Descrição</span>
            <ClearableField
              value={draft?.description ?? ''}
              onClear={() => runtime.updateRelationDraft('description', '')}
              label="Apagar descrição"
              multiline
              size="sm"
            >
              <textarea
                autoFocus
                value={draft?.description ?? ''}
                onChange={(event) => runtime.updateRelationDraft('description', event.target.value)}
                placeholder={relationKind === 'risk'
                  ? CANVAS_FIELD_PLACEHOLDERS.relation.risk
                  : CANVAS_FIELD_PLACEHOLDERS.relation.hypothesis}
              />
            </ClearableField>
          </label>
          <div className={styles.edgeFormActions}>
            <button type="button" onClick={() => runtime.ui.setRelationPanelMode('menu')}>Cancelar</button>
            <button type="button" onClick={runtime.saveRelation}>Salvar</button>
          </div>
        </>
      )}
    </section>
  );
}
