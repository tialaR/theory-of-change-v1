'use client';

import { useEffect, type MouseEvent as ReactMouseEvent } from 'react';
import { Handle, Position, useUpdateNodeInternals, type NodeProps } from '@xyflow/react';
import type { CanvasStageNode } from '../../react-flow/canvas-flow.types';
import { canvasIcons as icons } from '../canvas-icons';
import styles from '../canvas-workspace/canvas-workspace.module.sass';
import { useCanvasRuntime } from '../runtime/canvas-runtime-context';
import { ClearableField } from './clearable-field';

export function CanvasStageNodeComponent({ id, data }: NodeProps<CanvasStageNode>) {
  const runtime = useCanvasRuntime();
  const copy = runtime.stageCopy(data.stage);
  const updateNodeInternals = useUpdateNodeInternals();
  const isEditing = runtime.ui.editingNodeId === id && Boolean(runtime.ui.nodeDraft);
  const toolbarOpen = runtime.ui.activeToolbarNodeId === id;
  const selected = runtime.ui.selectedNodeId === id;
  const draft = runtime.ui.nodeDraft;

  useEffect(() => { updateNodeInternals(id); }, [id, isEditing, runtime.ui.cardAdvancedOpenId, updateNodeInternals]);
  function stopPropagation(event: ReactMouseEvent<HTMLElement>) { event.stopPropagation(); }

  return (
    <article className={`${styles.node} ${styles.reactFlowNode}`} data-canvas-node data-node-card-id={id} data-stage={data.stage} data-selected={selected} data-editing={isEditing} onClick={() => runtime.ui.selectNode(id)}>
      {toolbarOpen ? (
        <div className={`${styles.nodeToolbar} nodrag nopan`} data-node-toolbar-id={id} role="toolbar" aria-label={runtime.t('node.actionsAria', { title: data.title })}>
          <button type="button" onClick={(event) => { event.stopPropagation(); runtime.ui.setActiveToolbarNodeId(null); }} data-tooltip={runtime.t('tooltips.closeToolbar')}>{icons.close}</button>
          <button type="button" onClick={(event) => { event.stopPropagation(); const node = runtime.flow.nodes.find((item) => item.id === id); if (node) runtime.ui.openNodeEditor(node); }} data-tooltip={runtime.t('tooltips.edit')}>{icons.edit}</button>
          <button type="button" onClick={(event) => { event.stopPropagation(); runtime.duplicateNode(id); }} data-tooltip={runtime.t('tooltips.duplicate')}>{icons.duplicate}</button>
          <button type="button" onClick={(event) => { event.stopPropagation(); runtime.deleteNode(id); }} data-tooltip={runtime.t('tooltips.delete')}>{icons.trash}</button>
        </div>
      ) : null}

      <Handle id="target" type="target" position={Position.Left} className={`${styles.nodeHandle} ${styles.nodeHandleTarget}`} aria-label={runtime.t('node.targetAria', { title: data.title })} data-tooltip={runtime.t('tooltips.target')} data-canvas-handle="target" data-canvas-node-id={id} />
      <Handle id="source" type="source" position={Position.Right} className={`${styles.nodeHandle} ${styles.nodeHandleSource}`} aria-label={runtime.t('node.sourceAria', { title: data.title })} data-tooltip={runtime.t('tooltips.source')} data-canvas-handle="source" data-canvas-node-id={id} />

      <div className={styles.nodeMeta}>
        <span>{copy.singular}</span>
        <button type="button" className="nodrag nopan" aria-label={runtime.t('node.more')} data-tooltip={runtime.t('tooltips.more')} onClick={(event) => { event.stopPropagation(); runtime.ui.setActiveToolbarNodeId((current) => current === id ? null : id); }}>{icons.more}</button>
      </div>

      {isEditing && draft ? (
        <div className={`${styles.nodeEditor} nodrag nopan`} onClick={stopPropagation}>
          <label><span>{runtime.t('node.title')}</span><ClearableField value={draft.title} onClear={() => runtime.ui.setNodeDraft({ ...draft, title: '' })} label={runtime.t('node.clearTitle')} size="sm"><input value={draft.title} onChange={(event) => runtime.ui.setNodeDraft({ ...draft, title: event.target.value })} placeholder={copy.titlePlaceholder} /></ClearableField></label>
          <label><span>{runtime.t('node.description')}</span><ClearableField value={draft.description} onClear={() => runtime.ui.setNodeDraft({ ...draft, description: '' })} label={runtime.t('node.clearDescription')} multiline size="sm"><textarea value={draft.description} onChange={(event) => runtime.ui.setNodeDraft({ ...draft, description: event.target.value })} placeholder={copy.descriptionPlaceholder} /></ClearableField></label>
          <div className={styles.nodeAdvanced} data-open={runtime.ui.cardAdvancedOpenId === id}>
            <button type="button" className={`${styles.advancedToggle} nodrag nopan`} aria-expanded={runtime.ui.cardAdvancedOpenId === id} onClick={(event) => { event.stopPropagation(); runtime.ui.setCardAdvancedOpenId((current) => current === id ? null : id); }}><span className={styles.advancedChevron} aria-hidden="true">{icons.chevron}</span><span>{runtime.t('node.advanced')}</span></button>
            {runtime.ui.cardAdvancedOpenId === id ? <ClearableField value={draft.advancedDetails} onClear={() => runtime.ui.setNodeDraft({ ...draft, advancedDetails: '' })} label={runtime.t('node.clearAdvanced')} multiline size="sm"><textarea className={styles.advancedField} value={draft.advancedDetails} onChange={(event) => runtime.ui.setNodeDraft({ ...draft, advancedDetails: event.target.value })} placeholder={copy.advancedPlaceholder} /></ClearableField> : null}
          </div>
          <div className={styles.nodeEditorActions}><button type="button" className="nodrag nopan" onClick={runtime.ui.closeNodeEditor}><span>{runtime.t('node.cancel')}</span></button><button type="button" className="nodrag nopan" onClick={() => runtime.saveNodeEditor(id)}><span>{runtime.t('node.save')}</span></button></div>
        </div>
      ) : (
        <><h2>{data.title}</h2><p>{data.description}</p><div className={styles.nodeFooter}><span>{runtime.t('node.connect')}</span><small>{runtime.t('node.drag')}</small></div></>
      )}
    </article>
  );
}
