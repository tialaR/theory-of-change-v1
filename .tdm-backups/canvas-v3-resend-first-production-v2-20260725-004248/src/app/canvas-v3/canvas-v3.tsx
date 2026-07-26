'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMemo, useRef, useState, type DragEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { icons } from './canvas-v3.icons';
import { canConnect, stageMeta, STAGES, type CanvasEdge, type CanvasNode, type CanvasSnapshot, type StageId } from './canvas-v3.model';
import styles from './canvas-v3.module.sass';

const NODE_WIDTH = 260;
const NODE_HEIGHT = 164;
const CANVAS_WIDTH = 1800;
const CANVAS_HEIGHT = 980;

type DragState = { id: string; offsetX: number; offsetY: number };
type DialogState = { kind: 'edit' | 'risk' | 'hypothesis'; nodeId?: string; edgeId?: string } | null;

function nextId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function CanvasV3() {
  const router = useRouter();
  const [nodes, setNodes] = useState<CanvasNode[]>([]);
  const [edges, setEdges] = useState<CanvasEdge[]>([]);
  const [history, setHistory] = useState<CanvasSnapshot[]>([]);
  const [future, setFuture] = useState<CanvasSnapshot[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [connectSource, setConnectSource] = useState<string | null>(null);
  const [dialog, setDialog] = useState<DialogState>(null);
  const [notice, setNotice] = useState('Arraste uma etapa para começar.');
  const [zoom, setZoom] = useState(1);
  const dragRef = useRef<DragState | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);

  const selectedNode = nodes.find((node) => node.id === selectedId) ?? null;
  const selectedEdge = dialog?.edgeId ? edges.find((edge) => edge.id === dialog.edgeId) ?? null : null;

  const counts = useMemo(() => {
    return STAGES.reduce<Record<StageId, number>>((result, stage) => {
      result[stage.id] = nodes.filter((node) => node.stage === stage.id).length;
      return result;
    }, { input: 0, activity: 0, product: 0, outcome: 0 });
  }, [nodes]);

  function capture() {
    setHistory((items) => [...items, { nodes, edges }].slice(-30));
    setFuture([]);
  }

  function createNode(stage: StageId, x: number, y: number) {
    capture();
    const meta = stageMeta(stage);
    const count = counts[stage] + 1;
    const node: CanvasNode = {
      id: nextId(`node-${stage}`),
      stage,
      title: `${meta.label} ${count}`,
      description: meta.hint,
      x: Math.max(32, Math.min(CANVAS_WIDTH - NODE_WIDTH - 32, x)),
      y: Math.max(32, Math.min(CANVAS_HEIGHT - NODE_HEIGHT - 32, y))
    };
    setNodes((items) => [...items, node]);
    setSelectedId(node.id);
    setNotice(`${meta.label} adicionado.`);
  }

  function onPaletteDragStart(event: DragEvent<HTMLButtonElement>, stage: StageId) {
    event.dataTransfer.setData('application/tdm-stage', stage);
    event.dataTransfer.effectAllowed = 'copy';
  }

  function onCanvasDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const stage = event.dataTransfer.getData('application/tdm-stage') as StageId;
    if (!STAGES.some((item) => item.id === stage)) return;
    const rect = event.currentTarget.getBoundingClientRect();
    createNode(stage, (event.clientX - rect.left) / zoom - NODE_WIDTH / 2, (event.clientY - rect.top) / zoom - NODE_HEIGHT / 2);
  }

  function startDrag(event: ReactPointerEvent<HTMLElement>, node: CanvasNode) {
    const target = event.target as HTMLElement;
    if (target.closest('button, input, textarea')) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    dragRef.current = {
      id: node.id,
      offsetX: (event.clientX - rect.left) / zoom - node.x,
      offsetY: (event.clientY - rect.top) / zoom - node.y
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelectedId(node.id);
  }

  function moveDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const canvas = canvasRef.current;
    if (!drag || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(24, Math.min(CANVAS_WIDTH - NODE_WIDTH - 24, (event.clientX - rect.left) / zoom - drag.offsetX));
    const y = Math.max(24, Math.min(CANVAS_HEIGHT - NODE_HEIGHT - 24, (event.clientY - rect.top) / zoom - drag.offsetY));
    setNodes((items) => items.map((node) => node.id === drag.id ? { ...node, x, y } : node));
  }

  function endDrag() {
    if (!dragRef.current) return;
    dragRef.current = null;
    setNotice('Posição atualizada.');
  }

  function beginConnection(nodeId: string) {
    if (!connectSource) {
      setConnectSource(nodeId);
      setSelectedId(nodeId);
      setNotice('Agora clique no ponto do próximo card.');
      return;
    }
    if (connectSource === nodeId) {
      setConnectSource(null);
      setNotice('Conexão cancelada.');
      return;
    }
    const source = nodes.find((node) => node.id === connectSource);
    const target = nodes.find((node) => node.id === nodeId);
    if (!source || !target) return;
    if (!canConnect(source.stage, target.stage)) {
      setNotice('Conexão bloqueada. Conecte apenas à etapa causal seguinte.');
      setConnectSource(null);
      return;
    }
    if (edges.some((edge) => edge.source === source.id && edge.target === target.id)) {
      setNotice('Essa conexão já existe.');
      setConnectSource(null);
      return;
    }
    capture();
    setEdges((items) => [...items, { id: nextId('edge'), source: source.id, target: target.id, risk: '', hypothesis: '' }]);
    setConnectSource(null);
    setNotice('Conexão criada. Clique na linha para registrar risco ou hipótese.');
  }

  function duplicateNode(node: CanvasNode) {
    capture();
    const copy = { ...node, id: nextId(`node-${node.stage}`), x: node.x + 36, y: node.y + 36, title: `${node.title} (cópia)` };
    setNodes((items) => [...items, copy]);
    setSelectedId(copy.id);
    setNotice('Card duplicado.');
  }

  function deleteNode(nodeId: string) {
    capture();
    setNodes((items) => items.filter((node) => node.id !== nodeId));
    setEdges((items) => items.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    setSelectedId(null);
    setNotice('Card excluído.');
  }

  function updateNode(nodeId: string, field: 'title' | 'description', value: string) {
    setNodes((items) => items.map((node) => node.id === nodeId ? { ...node, [field]: value } : node));
  }

  function updateEdge(edgeId: string, field: 'risk' | 'hypothesis', value: string) {
    setEdges((items) => items.map((edge) => edge.id === edgeId ? { ...edge, [field]: value } : edge));
  }

  function undo() {
    const previous = history.at(-1);
    if (!previous) return;
    setFuture((items) => [{ nodes, edges }, ...items]);
    setHistory((items) => items.slice(0, -1));
    setNodes(previous.nodes);
    setEdges(previous.edges);
    setNotice('Alteração desfeita.');
  }

  function redo() {
    const next = future[0];
    if (!next) return;
    setHistory((items) => [...items, { nodes, edges }]);
    setFuture((items) => items.slice(1));
    setNodes(next.nodes);
    setEdges(next.edges);
    setNotice('Alteração refeita.');
  }

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.brandArea}>
          <button type="button" className={styles.backButton} onClick={() => router.push('/home')} data-tooltip="Voltar para o início">{icons.back}</button>
          <Image className={styles.brandLogo} src="/tdm-construtor-header-canonical.webp" alt="TMD Construtor" width={252} height={56} priority />
        </div>
        <div className={styles.topActions}>
          <button type="button" onClick={undo} disabled={!history.length} data-tooltip="Desfazer">{icons.undo}</button>
          <button type="button" onClick={redo} disabled={!future.length} data-tooltip="Refazer">{icons.redo}</button>
          <button type="button" className={styles.saveButton} onClick={() => setNotice('Canvas salvo localmente nesta sessão.')} data-tooltip="Salvar canvas">{icons.save}<span>Salvar</span></button>
        </div>
      </header>

      <section className={styles.workspace}>
        <div className={styles.viewport} onDrop={onCanvasDrop} onDragOver={(event) => event.preventDefault()}>
          <div
            ref={canvasRef}
            className={styles.canvas}
            style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT, transform: `scale(${zoom})` }}
            onPointerMove={moveDrag}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onClick={() => setSelectedId(null)}
          >
            <svg className={styles.connections} width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>
              {edges.map((edge) => {
                const source = nodes.find((node) => node.id === edge.source);
                const target = nodes.find((node) => node.id === edge.target);
                if (!source || !target) return null;
                const x1 = source.x + NODE_WIDTH;
                const y1 = source.y + NODE_HEIGHT / 2;
                const x2 = target.x;
                const y2 = target.y + NODE_HEIGHT / 2;
                const bend = Math.max(60, Math.abs(x2 - x1) * .44);
                return (
                  <g key={edge.id} className={styles.edgeGroup} onClick={(event) => { event.stopPropagation(); setDialog({ kind: 'risk', edgeId: edge.id }); }}>
                    <path className={styles.edgeHit} d={`M ${x1} ${y1} C ${x1 + bend} ${y1}, ${x2 - bend} ${y2}, ${x2} ${y2}`} />
                    <path className={styles.edgePath} data-has-note={Boolean(edge.risk || edge.hypothesis)} d={`M ${x1} ${y1} C ${x1 + bend} ${y1}, ${x2 - bend} ${y2}, ${x2} ${y2}`} />
                  </g>
                );
              })}
            </svg>

            {nodes.map((node) => (
              <article
                key={node.id}
                className={styles.node}
                data-stage={node.stage}
                data-selected={selectedId === node.id}
                data-connecting={connectSource === node.id}
                style={{ transform: `translate3d(${node.x}px, ${node.y}px, 0)` }}
                onPointerDown={(event) => startDrag(event, node)}
                onClick={(event) => { event.stopPropagation(); setSelectedId(node.id); }}
              >
                <button type="button" className={styles.inputHandle} onClick={(event) => { event.stopPropagation(); beginConnection(node.id); }} data-tooltip="Receber conexão" aria-label="Receber conexão" />
                <button type="button" className={styles.outputHandle} onClick={(event) => { event.stopPropagation(); beginConnection(node.id); }} data-tooltip="Criar conexão" aria-label="Criar conexão" />
                <div className={styles.nodeMeta}><span>{stageMeta(node.stage).label}</span><span>{icons.more}</span></div>
                <h2>{node.title}</h2>
                <p>{node.description}</p>
                <div className={styles.nodeFooter}><span>{icons.connect} Conectar</span><small>Arraste para mover</small></div>

                {selectedId === node.id && (
                  <div className={styles.nodeToolbar} onPointerDown={(event) => event.stopPropagation()}>
                    <button type="button" onClick={() => setDialog({ kind: 'edit', nodeId: node.id })} data-tooltip="Editar card">{icons.edit}</button>
                    <button type="button" onClick={() => duplicateNode(node)} data-tooltip="Duplicar card">{icons.duplicate}</button>
                    <button type="button" onClick={() => beginConnection(node.id)} data-tooltip="Conectar etapa">{icons.connect}</button>
                    <button type="button" onClick={() => setNotice('Crie uma conexão e clique na linha para adicionar risco.')} data-tooltip="Adicionar risco">{icons.risk}</button>
                    <button type="button" onClick={() => setNotice('Crie uma conexão e clique na linha para adicionar hipótese.')} data-tooltip="Adicionar hipótese">{icons.hypothesis}</button>
                    <button type="button" onClick={() => deleteNode(node.id)} data-tooltip="Excluir card">{icons.trash}</button>
                  </div>
                )}
              </article>
            ))}

            {!nodes.length && (
              <div className={styles.emptyState}>
                <strong>Seu canvas começa limpo.</strong>
                <span>Arraste uma etapa do painel compacto para qualquer ponto do espaço.</span>
              </div>
            )}
          </div>
        </div>

        <aside className={styles.stageDock} aria-label="Etapas disponíveis">
          {STAGES.map((stage) => (
            <button key={stage.id} type="button" draggable onDragStart={(event) => onPaletteDragStart(event, stage.id)} onDoubleClick={() => createNode(stage.id, 240 + counts[stage.id] * 28, 220 + counts[stage.id] * 24)} data-stage={stage.id} data-tooltip={`Arrastar ${stage.label}`}>
              <span className={styles.stageDot} />
              <span>{stage.label}</span>
            </button>
          ))}
        </aside>

        <nav className={styles.canvasToolbar} aria-label="Ferramentas do canvas">
          <button type="button" data-active={!connectSource} onClick={() => setConnectSource(null)} data-tooltip="Selecionar">{icons.cursor}</button>
          <button type="button" data-active={Boolean(connectSource)} onClick={() => selectedId && beginConnection(selectedId)} disabled={!selectedId} data-tooltip="Conectar card selecionado">{icons.connect}</button>
          <span />
          <button type="button" onClick={() => setZoom((value) => Math.min(1.35, Number((value + .1).toFixed(2))))} data-tooltip="Aproximar">{icons.zoomIn}</button>
          <button type="button" onClick={() => setZoom((value) => Math.max(.65, Number((value - .1).toFixed(2))))} data-tooltip="Afastar">{icons.zoomOut}</button>
          <button type="button" onClick={() => setZoom(1)} data-tooltip="Restaurar visualização">{icons.fit}</button>
        </nav>

        <div className={styles.notice}>{notice}</div>
      </section>

      {dialog?.kind === 'edit' && selectedNode && (
        <div className={styles.dialogBackdrop} onMouseDown={() => setDialog(null)}>
          <section className={styles.dialog} onMouseDown={(event) => event.stopPropagation()}>
            <header><div><small>{stageMeta(selectedNode.stage).label}</small><h2>Editar card</h2></div><button type="button" onClick={() => setDialog(null)}>{icons.close}</button></header>
            <label>Título<input value={selectedNode.title} onChange={(event) => updateNode(selectedNode.id, 'title', event.target.value)} /></label>
            <label>Descrição<textarea value={selectedNode.description} onChange={(event) => updateNode(selectedNode.id, 'description', event.target.value)} rows={4} /></label>
            <button type="button" className={styles.primaryAction} onClick={() => { setDialog(null); setNotice('Card atualizado.'); }}>{icons.save} Salvar alterações</button>
          </section>
        </div>
      )}

      {dialog && dialog.kind !== 'edit' && selectedEdge && (
        <div className={styles.dialogBackdrop} onMouseDown={() => setDialog(null)}>
          <section className={styles.dialog} onMouseDown={(event) => event.stopPropagation()}>
            <header><div><small>CONEXÃO CAUSAL</small><h2>Riscos e hipóteses</h2></div><button type="button" onClick={() => setDialog(null)}>{icons.close}</button></header>
            <label>Risco<textarea value={selectedEdge.risk} onChange={(event) => updateEdge(selectedEdge.id, 'risk', event.target.value)} rows={3} placeholder="O que pode comprometer esta conexão?" /></label>
            <label>Hipótese<textarea value={selectedEdge.hypothesis} onChange={(event) => updateEdge(selectedEdge.id, 'hypothesis', event.target.value)} rows={3} placeholder="O que precisa ser verdadeiro para esta conexão funcionar?" /></label>
            <button type="button" className={styles.primaryAction} onClick={() => { setDialog(null); setNotice('Risco e hipótese salvos.'); }}>{icons.save} Salvar conexão</button>
          </section>
        </div>
      )}
    </main>
  );
}
