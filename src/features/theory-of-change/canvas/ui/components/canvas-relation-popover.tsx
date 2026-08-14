'use client';

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
  const addLabel = runtime.t(relationKind === 'risk' ? 'tooltips.addRisk' : 'tooltips.addHypothesis');
  const editLabel = runtime.t(relationKind === 'risk' ? 'tooltips.editRisk' : 'tooltips.editHypothesis');
  const removeLabel = runtime.t(relationKind === 'risk' ? 'tooltips.removeRisk' : 'tooltips.removeHypothesis');

  return (
    <section data-edge-popover className={`${styles.edgePopover} ${styles.reactFlowEdgePopover} nodrag nopan`} data-mode={runtime.ui.relationPanelMode} data-kind="neutral" onPointerDown={(event) => event.stopPropagation()}>
      {runtime.ui.relationPanelMode === 'menu' ? (
        <div className={styles.edgeToolbar} role="toolbar" aria-label={runtime.t('relation.actions')}>
          <button type="button" data-tooltip={runtime.t('tooltips.closeRelation')} onClick={runtime.ui.clearSelection}>{icons.close}</button>
          <button type="button" className={styles.relationKindButton} data-tooltip={hasRelation ? editLabel : addLabel} onClick={runtime.openRelationForm}><span>{relationLabel}</span></button>
          {hasRelation ? <button type="button" className={styles.relationRemoveButton} data-tooltip={removeLabel} onClick={runtime.removeRelation}><span data-remove="true">{relationLabel}</span></button> : null}
          <button type="button" data-tooltip={runtime.t('tooltips.deleteConnection')} onClick={runtime.deleteConnection}>{icons.trash}</button>
        </div>
      ) : (
        <>
          <div className={styles.compactRelationHeader}><span className={styles.relationBadge}>{relationLabel}</span><strong>{runtime.t(`relations.${relationKind}`)}</strong></div>
          <label className={styles.compactRelationField}>
            <span>{runtime.t('relation.description')}</span>
            <ClearableField value={draft?.description ?? ''} onClear={() => runtime.updateRelationDraft('description', '')} label={runtime.t('node.clearDescription')} multiline size="sm">
              <textarea autoFocus value={draft?.description ?? ''} onChange={(event) => runtime.updateRelationDraft('description', event.target.value)} placeholder={runtime.t(`relations.${relationKind}Placeholder`)} />
            </ClearableField>
          </label>
          <div className={styles.edgeFormActions}><button type="button" onClick={runtime.cancelRelation}>{runtime.t('relation.cancel')}</button><button type="button" onClick={runtime.saveRelation}>{runtime.t('relation.save')}</button></div>
        </>
      )}
    </section>
  );
}
