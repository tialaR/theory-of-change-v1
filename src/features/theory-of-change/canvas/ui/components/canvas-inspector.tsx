'use client';

import { motion } from 'motion/react';

import { CANVAS_STAGES } from '../../domain/canvas-stage.constants';
import { canvasIcons as icons } from '../canvas-icons';
import styles from '../canvas-workspace/canvas-workspace.module.sass';
import { useCanvasRuntime } from '../runtime/canvas-runtime-context';
import { ClearableField } from './clearable-field';

function NodeInspector() {
  const runtime = useCanvasRuntime();
  const node = runtime.selectedNode;
  if (!node) return null;
  const copy = runtime.stageCopy(node.data.stage);
  const advancedKey = `node:${node.id}`;
  const connections = runtime.flow.edges.filter((edge) => edge.source === node.id || edge.target === node.id).length;

  return (
    <div className={styles.inspectorContent} data-stage={node.data.stage}>
      <div className={styles.inspectorSummary}>
        <span className={styles.inspectorStageDot} />
        <div><strong>{copy.label}</strong><small>{runtime.t('inspector.selectedBlock')}</small></div>
      </div>
      <label>
        {runtime.t('node.title')}
        <ClearableField value={node.data.title} onClear={() => runtime.updateSelectedNode('title', '')} label={runtime.t('node.clearTitle')}>
          <input value={node.data.title} onChange={(event) => runtime.updateSelectedNode('title', event.target.value)} placeholder={copy.titlePlaceholder} />
        </ClearableField>
      </label>
      <label>
        {runtime.t('node.description')}
        <ClearableField value={node.data.description} onClear={() => runtime.updateSelectedNode('description', '')} label={runtime.t('node.clearDescription')} multiline>
          <textarea value={node.data.description} onChange={(event) => runtime.updateSelectedNode('description', event.target.value)} placeholder={copy.descriptionPlaceholder} />
        </ClearableField>
      </label>
      <div className={styles.inspectorAdvanced} data-open={runtime.ui.inspectorAdvancedOpenKey === advancedKey}>
        <button type="button" className={styles.advancedToggle} aria-expanded={runtime.ui.inspectorAdvancedOpenKey === advancedKey} onClick={() => runtime.ui.setInspectorAdvancedOpenKey((current) => current === advancedKey ? null : advancedKey)}>
          <span className={styles.advancedChevron} aria-hidden="true">{icons.chevron}</span>
          <span>{runtime.t('node.advanced')}</span>
        </button>
        {runtime.ui.inspectorAdvancedOpenKey === advancedKey ? (
          <ClearableField value={node.data.advancedDetails} onClear={() => runtime.updateSelectedNode('advancedDetails', '')} label={runtime.t('node.clearAdvanced')} multiline>
            <textarea className={styles.advancedField} value={node.data.advancedDetails} onChange={(event) => runtime.updateSelectedNode('advancedDetails', event.target.value)} placeholder={copy.advancedPlaceholder} />
          </ClearableField>
        ) : null}
      </div>
      <div className={styles.logicCard}>
        <span>{runtime.t('inspector.causalLogic')}</span>
        <strong>{runtime.t('inspector.validConnections', { count: connections })}</strong>
        <p>{runtime.t('inspector.causalHelp')}</p>
      </div>
      <button type="button" className={styles.inspectorAction} onClick={() => { runtime.ui.setSaveState('dirty'); runtime.ui.notify(runtime.t('notices.stageUpdated', { stage: copy.singular })); }}>
        {icons.save}<span>{runtime.t('inspector.save')}</span>
      </button>
      <div className={styles.inspectorSecondaryActions}>
        <button type="button" onClick={() => runtime.duplicateNode(node.id)}>{icons.duplicate}<span>{runtime.t('inspector.duplicate')}</span></button>
        <button type="button" onClick={() => runtime.deleteNode(node.id)}>{icons.trash}<span>{runtime.t('inspector.delete')}</span></button>
      </div>
    </div>
  );
}

function EdgeInspector() {
  const runtime = useCanvasRuntime();
  const edge = runtime.selectedEdge;
  const relationKind = runtime.selectedRelationKind;
  const draft = runtime.ui.relationDraft;
  if (!edge || !relationKind || !draft) return null;
  const relationLabel = runtime.t(`relations.${relationKind}`);

  return (
    <div className={styles.inspectorContent} data-stage="neutral">
      <div className={styles.inspectorSummary}>
        <span className={styles.inspectorStageDot} />
        <div>
          <strong>{relationLabel}</strong>
          <small>
            {runtime.selectedEdgeSource ? runtime.stageCopy(runtime.selectedEdgeSource.data.stage).singular : ''}
            {' → '}
            {runtime.selectedEdgeTarget ? runtime.stageCopy(runtime.selectedEdgeTarget.data.stage).singular : ''}
          </small>
        </div>
      </div>
      <label>
        {runtime.t('node.description')}
        <ClearableField value={draft.description} onClear={() => runtime.updateRelationDraft('description', '')} label={runtime.t('node.clearDescription')} multiline>
          <textarea value={draft.description} onChange={(event) => runtime.updateRelationDraft('description', event.target.value)} placeholder={runtime.t(`relations.${relationKind}Placeholder`)} />
        </ClearableField>
      </label>
      <div className={styles.inspectorRelationActions}>
        <button type="button" className={styles.inspectorAction} onClick={runtime.saveRelation}>{icons.save}<span>{runtime.t('inspector.save')}</span></button>
      </div>
      <div className={styles.inspectorSecondaryActions}>
        {edge.data?.relationKind ? <button type="button" onClick={runtime.removeRelation}>{icons.trash}<span>{runtime.t('inspector.deleteRelation', { relation: relationLabel.toLowerCase() })}</span></button> : null}
        <button type="button" onClick={runtime.deleteConnection}>{icons.trash}<span>{runtime.t('inspector.deleteConnection')}</span></button>
      </div>
    </div>
  );
}

function CanvasProgress() {
  const runtime = useCanvasRuntime();
  return (
    <div className={styles.progressPanel}>
      <div><span>{runtime.t('inspector.structure')}</span><small>{runtime.t('inspector.structureSummary', { nodes: runtime.flow.nodes.length, edges: runtime.flow.edges.length })}</small></div>
      {CANVAS_STAGES.map((stage) => (
        <div className={styles.progressRow} key={stage} data-stage={stage}>
          <span /><strong>{runtime.stageCopy(stage).label}</strong><em>{runtime.flow.counts[stage]}</em>
        </div>
      ))}
    </div>
  );
}

export function CanvasInspector() {
  const runtime = useCanvasRuntime();
  const visible = runtime.ui.inspectorOpen && !runtime.ui.fullCanvasMode;
  const title = runtime.selectedNode
    ? runtime.stageCopy(runtime.selectedNode.data.stage).singular
    : runtime.selectedEdge ? runtime.t('inspector.connection') : runtime.t('inspector.canvas');

  return (
    <motion.aside
      className={styles.inspector}
      data-open={visible}
      data-canvas-inspector
      initial={false}
      animate={{
        x: visible ? 0 : 'calc(100% + 1.5rem)',
        opacity: visible ? 1 : 0
      }}
      transition={{ duration: 0.46, ease: [0.22, 1, 0.36, 1] }}
      aria-hidden={!visible}
    >
      <div className={styles.inspectorHeader}>
        <div><span>{runtime.t('inspector.title')}</span><strong>{title}</strong></div>
        <button type="button" onClick={runtime.closeInspector} aria-label={runtime.t('inspector.close')} title={runtime.t('tooltips.closeInspector')} data-tooltip={runtime.t('tooltips.closeInspector')}>{icons.close}</button>
      </div>
      {runtime.selectedNode ? <NodeInspector /> : null}
      {!runtime.selectedNode && runtime.selectedEdge ? <EdgeInspector /> : null}
      {!runtime.selectedNode && !runtime.selectedEdge ? <div className={styles.emptyInspector}>{runtime.t('inspector.empty')}</div> : null}
      <CanvasProgress />
    </motion.aside>
  );
}

export function CanvasInspectorReopen() {
  const runtime = useCanvasRuntime();
  if (runtime.ui.inspectorOpen || runtime.ui.fullCanvasMode) return null;

  return (
    <div className={styles.workspaceTopRightControls}>
      <button
        type="button"
        className={styles.inspectorReopen}
        data-inspector-toggle
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation();
          runtime.openInspector();
        }}
        aria-label={runtime.t('tooltips.openInspector')}
        data-tooltip={runtime.t('tooltips.openInspector')}
        title={runtime.t('tooltips.openInspector')}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M15 4v16M18 9l3 3-3 3" /></svg>
      </button>
    </div>
  );
}
