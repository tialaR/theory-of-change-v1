'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState, type DragEvent } from 'react';
import { CanvasV3Node } from './canvas-v3-node';
import { CanvasHeader, CoachSidebar, StageDock } from './canvas-v3-panels';
import { icons } from './canvas-v3.icons';
import { conditionFor, STAGES, type StageId } from './canvas-v3.model';
import { useCanvasV3 } from './use-canvas-v3';
import styles from './canvas-v3.module.sass';

export function CanvasV3() {
  const router = useRouter();
  const canvas = useCanvasV3();
  const [stageDockOpen, setStageDockOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  const selectedNode = canvas.nodes.find((node) => node.id === canvas.selectedId) ?? null;
  const editingEdge = canvas.edges.find((edge) => edge.id === canvas.editingEdgeId) ?? null;
  const nodeMap = useMemo(() => new Map(canvas.nodes.map((node) => [node.id, node])), [canvas.nodes]);

  function onPaletteDragStart(event: DragEvent<HTMLButtonElement>, stage: StageId) {
    event.dataTransfer.setData('application/tdm-stage', stage);
    event.dataTransfer.effectAllowed = 'copy';
  }

  function createAtDefault(stage: StageId) {
    const index = canvas.counts[stage];
    canvas.createNode(stage, 240 + index * 36, 220 + index * 32);
  }

  function onCanvasDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const stage = event.dataTransfer.getData('application/tdm-stage') as StageId;
    if (!STAGES.some((item) => item.id === stage)) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / canvas.zoom - canvas.constants.NODE_WIDTH / 2;
    const y = (event.clientY - rect.top) / canvas.zoom - canvas.constants.NODE_HEIGHT / 2;
    canvas.createNode(stage, x, y);
  }

  function openResult() {
    canvas.notify('O resultado fica disponível quando houver uma conexão coerente.', canvas.edges.length ? 'success' : 'warning');
  }

  function openEdgeEditor(edgeId: string) {
    canvas.setEditingEdgeId(edgeId);
    canvas.setMenuId(null);
  }

  return (
    <main className={styles.page} data-focus={focusMode}>
      {!focusMode && (
        <CanvasHeader
          theoryName={canvas.theoryName}
          canUndo={Boolean(canvas.past.length)}
          canRedo={Boolean(canvas.future.length)}
          historyOpen={historyOpen}
          versions={canvas.savedVersions}
          onTheoryName={canvas.setTheoryName}
          onBack={() => router.push('/home')}
          onUndo={canvas.undo}
          onRedo={canvas.redo}
          onHistory={() => setHistoryOpen((value) => !value)}
          onSave={canvas.saveVersion}
          onRestore={(version) => { canvas.restoreVersion(version); setHistoryOpen(false); }}
        />
      )}

      <section className={styles.workspace}>
        <div className={styles.viewport} onDrop={onCanvasDrop} onDragOver={(event) => event.preventDefault()}>
          <div
            ref={canvas.canvasRef}
            className={styles.canvas}
            style={{ width: canvas.constants.CANVAS_WIDTH, height: canvas.constants.CANVAS_HEIGHT, transform: `scale(${canvas.zoom})` }}
            onPointerMove={(event) => { canvas.moveNode(event); canvas.moveConnectionDraft(event); }}
            onPointerUp={() => { canvas.finishNodeDrag(); if (canvas.connectionDraft) canvas.cancelConnection(); }}
            onPointerCancel={() => { canvas.finishNodeDrag(); if (canvas.connectionDraft) canvas.cancelConnection(); }}
            onClick={() => { canvas.setSelectedId(null); canvas.setMenuId(null); if (canvas.connectSource) canvas.cancelConnection(); }}
          >
            <svg className={styles.connections} width={canvas.constants.CANVAS_WIDTH} height={canvas.constants.CANVAS_HEIGHT}>
              <defs>
                <marker id="connection-draft-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" />
                </marker>
              </defs>
              {canvas.connectionDraft && (() => {
                const origin = nodeMap.get(canvas.connectionDraft.nodeId);
                if (!origin) return null;
                const x1 = origin.x + (canvas.connectionDraft.side === 'right' ? canvas.constants.NODE_WIDTH : 0);
                const y1 = origin.y + canvas.constants.NODE_HEIGHT / 2;
                const x2 = canvas.connectionDraft.x;
                const y2 = canvas.connectionDraft.y;
                const direction = x2 >= x1 ? 1 : -1;
                const bend = Math.max(54, Math.abs(x2 - x1) * .42);
                const path = `M ${x1} ${y1} C ${x1 + bend * direction} ${y1}, ${x2 - bend * direction} ${y2}, ${x2} ${y2}`;
                return <path className={styles.connectionDraft} d={path} markerEnd="url(#connection-draft-arrow)" />;
              })()}
              {canvas.edges.map((edge) => {
                const source = nodeMap.get(edge.source);
                const target = nodeMap.get(edge.target);
                if (!source || !target) return null;
                const x1 = source.x + canvas.constants.NODE_WIDTH;
                const y1 = source.y + canvas.constants.NODE_HEIGHT / 2;
                const x2 = target.x;
                const y2 = target.y + canvas.constants.NODE_HEIGHT / 2;
                const bend = Math.max(72, Math.abs(x2 - x1) * .42);
                const path = `M ${x1} ${y1} C ${x1 + bend} ${y1}, ${x2 - bend} ${y2}, ${x2} ${y2}`;
                const mx = (x1 + x2) / 2;
                const my = (y1 + y2) / 2;
                return (
                  <g key={edge.id} className={styles.edgeGroup} data-active={canvas.editingEdgeId === edge.id}>
                    <path className={styles.edgeHit} d={path} onClick={(event) => { event.stopPropagation(); openEdgeEditor(edge.id); }} />
                    <path className={styles.edgePath} d={path} data-qualified={Boolean(edge.risk || edge.hypothesis)} />
                    <foreignObject x={mx - 14} y={my - 14} width="28" height="28" className={styles.edgeActionWrap}>
                      <button type="button" className={styles.edgeAction} onClick={(event) => { event.stopPropagation(); openEdgeEditor(edge.id); }} data-tooltip="Qualificar passagem">{icons.chevron}</button>
                    </foreignObject>
                  </g>
                );
              })}
            </svg>

            {canvas.nodes.map((node) => (
              <CanvasV3Node
                key={node.id}
                node={node}
                selected={canvas.selectedId === node.id}
                editing={canvas.editingId === node.id}
                menuOpen={canvas.menuId === node.id}
                connecting={canvas.connectSource === node.id}
                onSelect={() => { canvas.setSelectedId(node.id); setSidebarOpen(true); }}
                onStartDrag={(event) => canvas.startNodeDrag(event, node)}
                onHandleStart={(event, side) => canvas.beginConnectionDrag(event, node.id, side)}
                onHandleEnd={(event, side) => canvas.finishConnectionDrag(event, node.id, side)}
                onToggleMenu={() => canvas.setMenuId(canvas.menuId === node.id ? null : node.id)}
                onEdit={() => { canvas.setEditingId(node.id); canvas.setMenuId(null); }}
                onDuplicate={() => canvas.duplicateNode(node.id)}
                onConnectHint={() => canvas.startConnection(node.id)}
                onDelete={() => canvas.deleteNode(node.id)}
                onCancelEdit={() => canvas.setEditingId(null)}
                onChange={(patch) => canvas.updateNode(node.id, patch)}
                onSave={() => canvas.saveNode(node.id)}
              />
            ))}

            {editingEdge && (() => {
              const source = nodeMap.get(editingEdge.source);
              const target = nodeMap.get(editingEdge.target);
              if (!source || !target) return null;
              const kind = conditionFor(source.stage, target.stage);
              if (!kind) return null;
              const x1 = source.x + canvas.constants.NODE_WIDTH;
              const y1 = source.y + canvas.constants.NODE_HEIGHT / 2;
              const x2 = target.x;
              const y2 = target.y + canvas.constants.NODE_HEIGHT / 2;
              const left = (x1 + x2) / 2;
              const top = (y1 + y2) / 2;
              const value = kind === 'risk' ? editingEdge.risk : editingEdge.hypothesis;
              return (
                <section className={styles.edgeInlineEditor} style={{ left, top }} onPointerDown={(event) => event.stopPropagation()} onClick={(event) => event.stopPropagation()}>
                  <header>
                    <div><small>Qualificar passagem</small><strong>{kind === 'risk' ? 'Risco' : 'Hipótese'}</strong></div>
                    <button type="button" onClick={() => canvas.setEditingEdgeId(null)} data-tooltip="Fechar">{icons.close}</button>
                  </header>
                  <label>
                    <span>{kind === 'risk' ? icons.risk : icons.hypothesis}{kind === 'risk' ? 'O que pode atrapalhar?' : 'O que precisa ser verdadeiro?'}</span>
                    <textarea
                      autoFocus
                      rows={2}
                      value={value}
                      placeholder={kind === 'risk' ? 'Descreva um risco desta passagem.' : 'Descreva uma hipótese desta passagem.'}
                      onChange={(event) => canvas.updateEdge(editingEdge.id, kind === 'risk' ? { risk: event.target.value } : { hypothesis: event.target.value })}
                    />
                  </label>
                  <div className={styles.edgeInlineActions}>
                    <button type="button" onClick={() => canvas.deleteEdge(editingEdge.id)}>Excluir conexão</button>
                    <button type="button" onClick={() => { canvas.setEditingEdgeId(null); canvas.notify('Passagem atualizada.', 'success'); }}>Salvar</button>
                  </div>
                </section>
              );
            })()}

            {!canvas.nodes.length && (
              <div className={styles.emptyState}>
                <strong>Comece pelo que já existe.</strong>
                <span>Abra o painel de etapas e arraste qualquer etapa para o canvas.</span>
              </div>
            )}
          </div>
        </div>

        <StageDock open={stageDockOpen} counts={canvas.counts} onToggle={() => setStageDockOpen((value) => !value)} onDragStart={onPaletteDragStart} onCreate={createAtDefault} />

        <nav className={styles.canvasToolbar} aria-label="Ferramentas do canvas">
          <button type="button" onClick={canvas.alignColumns} data-tooltip="Alinhar em colunas">{icons.columns}</button>
          <button type="button" onClick={canvas.centerFlow} data-tooltip="Centralizar fluxo">{icons.center}</button>
          <span />
          <button type="button" onClick={() => canvas.setZoom((value) => Math.min(1.35, Number((value + .1).toFixed(2))))} data-tooltip="Aproximar">{icons.zoomIn}</button>
          <button type="button" onClick={() => canvas.setZoom((value) => Math.max(.65, Number((value - .1).toFixed(2))))} data-tooltip="Afastar">{icons.zoomOut}</button>
          <button type="button" onClick={() => canvas.setZoom(1)} data-tooltip="Restaurar zoom">{icons.fit}</button>
          <span />
          <button type="button" onClick={() => setGuideOpen((value) => !value)} data-tooltip="Atalhos e guia">{icons.guide}</button>
          <button type="button" onClick={() => setFocusMode((value) => !value)} data-tooltip={focusMode ? 'Sair do modo foco' : 'Expandir canvas'}>{focusMode ? icons.collapse : icons.expand}</button>
        </nav>

        {!focusMode && (
          <CoachSidebar
            open={sidebarOpen}
            node={selectedNode}
            nodes={canvas.nodes}
            edges={canvas.edges}
            onToggle={() => setSidebarOpen((value) => !value)}
            onCreate={createAtDefault}
            onEditSelected={() => { if (selectedNode) canvas.setEditingId(selectedNode.id); }}
            onConnectSelected={() => { if (selectedNode) canvas.startConnection(selectedNode.id); }}
            onDuplicateSelected={() => { if (selectedNode) canvas.duplicateNode(selectedNode.id); }}
            onDeleteSelected={() => { if (selectedNode) canvas.deleteNode(selectedNode.id); }}
            onGuide={() => setGuideOpen(true)}
            onExamples={() => canvas.notify('Exemplos serão apresentados aqui sem interromper seu fluxo.', 'neutral')}
            onResult={openResult}
          />
        )}

        {guideOpen && (
          <section className={styles.guidePanel}>
            <header><strong>Atalhos e orientação</strong><button type="button" onClick={() => setGuideOpen(false)}>{icons.close}</button></header>
            <p>Crie em qualquer ordem. Para conectar, arraste o dot direito da origem até o dot esquerdo da próxima etapa.</p>
            <dl><div><dt>Arrastar</dt><dd>Mover card</dd></div><div><dt>Duplo clique</dt><dd>Criar etapa</dd></div><div><dt>•••</dt><dd>Abrir toolbar do card</dd></div></dl>
          </section>
        )}

        <div className={styles.notice} data-tone={canvas.notice.tone}>{canvas.notice.text}</div>
      </section>
    </main>
  );
}
