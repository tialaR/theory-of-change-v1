'use client';

import { CANVAS_STAGES, getCanvasStageMeta } from '../../domain/canvas-stage.constants';
import { CANVAS_FIELD_PLACEHOLDERS, CANVAS_TOOLTIP_LABELS } from '../../domain/canvas-ui.constants';
import { canvasIcons as icons } from '../canvas-icons';
import styles from '../canvas-workspace/canvas-workspace.module.sass';
import { useCanvasRuntime } from '../runtime/canvas-runtime-context';
import { ClearableField } from './clearable-field';

function NodeInspector() {
  const runtime = useCanvasRuntime();
  const node = runtime.selectedNode;
  if (!node) return null;
  const advancedKey = `node:${node.id}`;
  const connections = runtime.flow.edges.filter((edge) => edge.source === node.id || edge.target === node.id).length;

  return (
    <div className={styles.inspectorContent} data-stage={node.data.stage}>
      <div className={styles.inspectorSummary}>
        <span className={styles.inspectorStageDot} />
        <div>
          <strong>{getCanvasStageMeta(node.data.stage).label}</strong>
          <small>Bloco selecionado</small>
        </div>
      </div>
      <label>
        Título
        <ClearableField
          value={node.data.title}
          onClear={() => runtime.updateSelectedNode('title', '')}
          label="Apagar título"
        >
          <input
            value={node.data.title}
            onChange={(event) => runtime.updateSelectedNode('title', event.target.value)}
            placeholder={CANVAS_FIELD_PLACEHOLDERS.stage[node.data.stage].title}
          />
        </ClearableField>
      </label>
      <label>
        Descrição
        <ClearableField
          value={node.data.description}
          onClear={() => runtime.updateSelectedNode('description', '')}
          label="Apagar descrição"
          multiline
        >
          <textarea
            value={node.data.description}
            onChange={(event) => runtime.updateSelectedNode('description', event.target.value)}
            placeholder={CANVAS_FIELD_PLACEHOLDERS.stage[node.data.stage].description}
          />
        </ClearableField>
      </label>
      <div
        className={styles.inspectorAdvanced}
        data-open={runtime.ui.inspectorAdvancedOpenKey === advancedKey}
      >
        <button
          type="button"
          className={styles.advancedToggle}
          aria-expanded={runtime.ui.inspectorAdvancedOpenKey === advancedKey}
          onClick={() => runtime.ui.setInspectorAdvancedOpenKey((current) => current === advancedKey ? null : advancedKey)}
        >
          <span className={styles.advancedChevron} aria-hidden="true">{icons.chevron}</span>
          <span>Detalhes avançados</span>
        </button>
        {runtime.ui.inspectorAdvancedOpenKey === advancedKey ? (
          <ClearableField
            value={node.data.advancedDetails}
            onClear={() => runtime.updateSelectedNode('advancedDetails', '')}
            label="Apagar detalhes avançados"
            multiline
          >
            <textarea
              className={styles.advancedField}
              value={node.data.advancedDetails}
              onChange={(event) => runtime.updateSelectedNode('advancedDetails', event.target.value)}
              placeholder={CANVAS_FIELD_PLACEHOLDERS.stage[node.data.stage].advancedDetails}
            />
          </ClearableField>
        ) : null}
      </div>
      <div className={styles.logicCard}>
        <span>Lógica causal</span>
        <strong>{connections} conexões válidas</strong>
        <p>Use o dot direito como origem e o dot esquerdo como destino. Ações incoerentes são bloqueadas sem alterar o mapa.</p>
      </div>
      <button
        type="button"
        className={styles.inspectorAction}
        onClick={() => {
          runtime.ui.setSaveState('dirty');
          runtime.ui.notify(`${getCanvasStageMeta(node.data.stage).singular} atualizado.`);
        }}
      >
        {icons.save}<span>Salvar</span>
      </button>
      <div className={styles.inspectorSecondaryActions}>
        <button type="button" onClick={() => runtime.duplicateNode(node.id)}>
          {icons.duplicate}<span>Duplicar</span>
        </button>
        <button type="button" onClick={() => runtime.deleteNode(node.id)}>
          {icons.trash}<span>Excluir</span>
        </button>
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

  return (
    <div className={styles.inspectorContent} data-stage="neutral">
      <div className={styles.inspectorSummary}>
        <span className={styles.inspectorStageDot} />
        <div>
          <strong>{relationKind === 'risk' ? 'Risco' : 'Hipótese'}</strong>
          <small>
            {runtime.selectedEdgeSource ? getCanvasStageMeta(runtime.selectedEdgeSource.data.stage).singular : ''}
            {' → '}
            {runtime.selectedEdgeTarget ? getCanvasStageMeta(runtime.selectedEdgeTarget.data.stage).singular : ''}
          </small>
        </div>
      </div>
      <label>
        Descrição
        <ClearableField
          value={draft.description}
          onClear={() => runtime.updateRelationDraft('description', '')}
          label="Apagar descrição"
          multiline
        >
          <textarea
            value={draft.description}
            onChange={(event) => runtime.updateRelationDraft('description', event.target.value)}
            placeholder={relationKind === 'risk'
              ? CANVAS_FIELD_PLACEHOLDERS.relation.risk
              : CANVAS_FIELD_PLACEHOLDERS.relation.hypothesis}
          />
        </ClearableField>
      </label>
      <button type="button" className={styles.inspectorAction} onClick={runtime.saveRelation}>
        {icons.save}<span>Salvar</span>
      </button>
      <div className={styles.inspectorSecondaryActions}>
        {edge.data?.relationKind ? (
          <button type="button" onClick={runtime.removeRelation}>
            {icons.trash}<span>Excluir {relationKind === 'risk' ? 'risco' : 'hipótese'}</span>
          </button>
        ) : null}
        <button type="button" onClick={runtime.deleteConnection}>
          {icons.trash}<span>Excluir conexão</span>
        </button>
      </div>
    </div>
  );
}

function CanvasProgress() {
  const runtime = useCanvasRuntime();
  return (
    <div className={styles.progressPanel}>
      <div>
        <span>Estrutura da teoria</span>
        <small>{runtime.flow.nodes.length} blocos · {runtime.flow.edges.length} conexões</small>
      </div>
      {CANVAS_STAGES.map((stage) => (
        <div className={styles.progressRow} key={stage.id} data-stage={stage.id}>
          <span />
          <strong>{stage.label}</strong>
          <em>{runtime.flow.counts[stage.id]}</em>
        </div>
      ))}
    </div>
  );
}

export function CanvasInspector() {
  const runtime = useCanvasRuntime();
  if (runtime.ui.fullCanvasMode || !runtime.ui.inspectorOpen) return null;

  const title = runtime.selectedNode
    ? getCanvasStageMeta(runtime.selectedNode.data.stage).singular
    : runtime.selectedEdge
      ? 'Conexão'
      : 'Canvas';

  return (
    <aside className={styles.inspector}>
      <div className={styles.inspectorHeader}>
        <div><span>Inspector</span><strong>{title}</strong></div>
        <button
          type="button"
          onClick={() => runtime.ui.setInspectorOpen(false)}
          aria-label="Fechar inspector"
          title={CANVAS_TOOLTIP_LABELS.closeInspector}
          data-tooltip={CANVAS_TOOLTIP_LABELS.closeInspector}
        >
          {icons.close}
        </button>
      </div>
      {runtime.selectedNode ? <NodeInspector /> : null}
      {!runtime.selectedNode && runtime.selectedEdge ? <EdgeInspector /> : null}
      {!runtime.selectedNode && !runtime.selectedEdge ? (
        <div className={styles.emptyInspector}>Selecione um bloco ou uma conexão.</div>
      ) : null}
      <CanvasProgress />
    </aside>
  );
}

export function CanvasInspectorReopen() {
  const runtime = useCanvasRuntime();
  if (runtime.ui.fullCanvasMode || runtime.ui.inspectorOpen) return null;

  return (
    <div className={styles.workspaceTopRightControls}>
      <button
        type="button"
        className={styles.inspectorReopen}
        onClick={() => runtime.ui.setInspectorOpen(true)}
        aria-label={CANVAS_TOOLTIP_LABELS.openInspector}
        data-tooltip={CANVAS_TOOLTIP_LABELS.openInspector}
        title={CANVAS_TOOLTIP_LABELS.openInspector}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M15 4v16M18 9l3 3-3 3" />
        </svg>
      </button>
    </div>
  );
}
