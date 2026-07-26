'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState, type DragEvent } from 'react';
import { CanvasV3Node } from './canvas-v3-node';
import { CanvasHeader, CoachSidebar, StageDock } from './canvas-v3-panels';
import { icons } from './canvas-v3.icons';
import { STAGES, type StageId } from './canvas-v3.model';
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
    canvas.notify('A visualização do resultado será liberada quando houver ao menos uma conexão coerente.', canvas.edges.length ? 'success' : 'warning');
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
            onPointerMove={canvas.moveNode}
            onPointerUp={canvas.finishNodeDrag}
            onPointerCancel={canvas.finishNodeDrag}
            onClick={() => { canvas.setSelectedId(null); canvas.setMenuId(null); }}
          >
            <svg className={styles.connections} width={canvas.constants.CANVAS_WIDTH} height={canvas.constants.CANVAS_HEIGHT}>
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
                    <path className={styles.edgeHit} d={path} onClick={(event) => { event.stopPropagation(); canvas.setEditingEdgeId(edge.id); }} />
                    <path className={styles.edgePath} d={path} data-qualified={Boolean(edge.risk || edge.hypothesis)} />
                    <foreignObject x={mx - 14} y={my - 14} width="28" height="28" className={styles.edgeActionWrap}>
                      <button type="button" className={styles.edgeAction} onClick={(event) => { event.stopPropagation(); canvas.setEditingEdgeId(edge.id); }} title="Qualificar conexão">{icons.chevron}</button>
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
                onSelect={() => canvas.setSelectedId(node.id)}
                onStartDrag={(event) => canvas.startNodeDrag(event, node)}
                onInput={() => canvas.completeConnection(node.id)}
                onOutput={() => canvas.startConnection(node.id)}
                onToggleMenu={() => canvas.setMenuId(canvas.menuId === node.id ? null : node.id)}
                onEdit={() => { canvas.setEditingId(node.id); canvas.setMenuId(null); }}
                onDuplicate={() => canvas.duplicateNode(node.id)}
                onDelete={() => canvas.deleteNode(node.id)}
                onChange={(patch) => canvas.updateNode(node.id, patch)}
                onSave={() => canvas.saveNode(node.id)}
              />
            ))}

            {!canvas.nodes.length && (
              <div className={styles.emptyState}>
                <strong>Comece pelo que já existe.</strong>
                <span>Abra o painel de etapas no topo esquerdo e arraste qualquer etapa para o canvas.</span>
              </div>
            )}
          </div>
        </div>

        <StageDock
          open={stageDockOpen}
          counts={canvas.counts}
          onToggle={() => setStageDockOpen((value) => !value)}
          onDragStart={onPaletteDragStart}
          onCreate={createAtDefault}
        />

        <nav className={styles.canvasToolbar} aria-label="Ferramentas do canvas">
          <button type="button" onClick={canvas.alignColumns} title="Alinhar em colunas">{icons.columns}</button>
          <button type="button" onClick={canvas.centerFlow} title="Centralizar fluxo">{icons.center}</button>
          <span />
          <button type="button" onClick={() => canvas.setZoom((value) => Math.min(1.35, Number((value + .1).toFixed(2))))} title="Aproximar">{icons.zoomIn}</button>
          <button type="button" onClick={() => canvas.setZoom((value) => Math.max(.65, Number((value - .1).toFixed(2))))} title="Afastar">{icons.zoomOut}</button>
          <button type="button" onClick={() => canvas.setZoom(1)} title="Restaurar zoom">{icons.fit}</button>
          <span />
          <button type="button" onClick={() => setGuideOpen((value) => !value)} title="Atalhos e guia">{icons.guide}</button>
          <button type="button" onClick={() => setFocusMode((value) => !value)} title={focusMode ? 'Sair do modo foco' : 'Expandir canvas'}>{focusMode ? icons.collapse : icons.expand}</button>
        </nav>

        {!focusMode && (
          <CoachSidebar
            open={sidebarOpen}
            node={selectedNode}
            nodes={canvas.nodes}
            edges={canvas.edges}
            onToggle={() => setSidebarOpen((value) => !value)}
            onCreate={createAtDefault}
            onGuide={() => setGuideOpen(true)}
            onExamples={() => canvas.notify('Exemplos serão apresentados aqui sem interromper seu fluxo.', 'neutral')}
            onResult={openResult}
          />
        )}

        {editingEdge && (
          <section className={styles.edgeInspector}>
            <header>
              <div><small>Qualificar passagem</small><strong>Risco e hipótese</strong></div>
              <button type="button" onClick={() => canvas.setEditingEdgeId(null)} title="Fechar">{icons.close}</button>
            </header>
            <label><span>{icons.risk} Risco desta passagem</span><textarea rows={3} value={editingEdge.risk} placeholder="O que pode atrapalhar esta conexão?" onChange={(event) => canvas.updateEdge(editingEdge.id, { risk: event.target.value })} /></label>
            <label><span>{icons.hypothesis} Hipótese desta passagem</span><textarea rows={3} value={editingEdge.hypothesis} placeholder="O que precisa ser verdadeiro para funcionar?" onChange={(event) => canvas.updateEdge(editingEdge.id, { hypothesis: event.target.value })} /></label>
            <div><button type="button" onClick={() => canvas.deleteEdge(editingEdge.id)}>Excluir conexão</button><button type="button" onClick={() => { canvas.setEditingEdgeId(null); canvas.notify('Passagem atualizada.', 'success'); }}>Concluir</button></div>
          </section>
        )}

        {guideOpen && (
          <section className={styles.guidePanel}>
            <header><strong>Atalhos e orientação</strong><button type="button" onClick={() => setGuideOpen(false)}>{icons.close}</button></header>
            <p>Crie etapas em qualquer ordem. Para conectar, clique no ponto direito do card de origem e depois no ponto esquerdo do card seguinte.</p>
            <dl><div><dt>Arrastar</dt><dd>Mover card</dd></div><div><dt>Duplo clique</dt><dd>Criar etapa pelo painel</dd></div><div><dt>•••</dt><dd>Editar, duplicar, conectar ou excluir</dd></div></dl>
          </section>
        )}

        <div className={styles.notice} data-tone={canvas.notice.tone}>{canvas.notice.text}</div>
      </section>
    </main>
  );
}
