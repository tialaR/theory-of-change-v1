'use client';

import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import styles from './resend-command-preview-v2.module.sass';
import { previewIcons as icons } from './resend-command-preview-v2.icons';
import {
  INITIAL_EDGES,
  INITIAL_NODES,
  STAGES,
  canConnect,
  stageMeta,
  type CanvasEdge,
  type CanvasNode,
  type CanvasSnapshot,
  type StageId
} from './resend-command-preview-v2.model';

const NODE_WIDTH = 238;
const NODE_HEIGHT = 126;
const CANVAS_WIDTH = 1480;
const CANVAS_HEIGHT = 820;

type DragState = {
  id: string;
  offsetX: number;
  offsetY: number;
};

export function ResendCommandPreviewV2() {
  const [nodes, setNodes] = useState<CanvasNode[]>(INITIAL_NODES);
  const [edges, setEdges] = useState<CanvasEdge[]>(INITIAL_EDGES);
  const [history, setHistory] = useState<CanvasSnapshot[]>([]);
  const [future, setFuture] = useState<CanvasSnapshot[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>('node-activity-1');
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [connectSource, setConnectSource] = useState<string | null>(null);
  const [notice, setNotice] = useState('Canvas pronto para editar.');
  const [saveState, setSaveState] = useState<'saved' | 'dirty' | 'saving'>('saved');
  const dragRef = useRef<DragState | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const idCounterRef = useRef(10);

  const selectedNode = nodes.find((node) => node.id === selectedId) ?? null;

  const counts = useMemo(() => {
    return STAGES.reduce<Record<StageId, number>>((result, stage) => {
      result[stage.id] = nodes.filter((node) => node.stage === stage.id).length;
      return result;
    }, { input: 0, activity: 0, product: 0, outcome: 0 });
  }, [nodes]);

  function capture() {
    setHistory((items) => [...items, { nodes, edges }].slice(-24));
    setFuture([]);
    setSaveState('dirty');
  }

  function addNode(stage: StageId) {
    capture();
    const meta = stageMeta(stage);
    const count = counts[stage] + 1;
    idCounterRef.current += 1;
    const next: CanvasNode = {
      id: `node-${stage}-${idCounterRef.current}`,
      stage,
      title: `${meta.singular} ${count}`,
      description: meta.hint,
      x: 220 + count * 46,
      y: 190 + (STAGES.findIndex((item) => item.id === stage) % 2) * 190
    };
    setNodes((items) => [...items, next]);
    setSelectedId(next.id);
    setInspectorOpen(true);
    setCreatorOpen(false);
    setNotice(`${meta.singular} adicionado. Agora você pode posicioná-lo livremente.`);
  }

  function updateSelected(field: 'title' | 'description', value: string) {
    if (!selectedId) return;
    setNodes((items) => items.map((node) => node.id === selectedId ? { ...node, [field]: value } : node));
    setSaveState('dirty');
  }

  function startDrag(event: ReactPointerEvent<HTMLElement>, node: CanvasNode) {
    const target = event.target as HTMLElement;
    if (target.closest('button, input, textarea')) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    dragRef.current = {
      id: node.id,
      offsetX: event.clientX - rect.left - node.x,
      offsetY: event.clientY - rect.top - node.y
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelectedId(node.id);
  }

  function moveDrag(event: ReactPointerEvent<HTMLElement>) {
    const drag = dragRef.current;
    const canvas = canvasRef.current;
    if (!drag || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(24, Math.min(CANVAS_WIDTH - NODE_WIDTH - 24, event.clientX - rect.left - drag.offsetX));
    const y = Math.max(72, Math.min(CANVAS_HEIGHT - NODE_HEIGHT - 24, event.clientY - rect.top - drag.offsetY));
    setNodes((items) => items.map((node) => node.id === drag.id ? { ...node, x, y } : node));
    setSaveState('dirty');
  }

  function endDrag() {
    if (dragRef.current) {
      setNotice('Posição atualizada.');
      dragRef.current = null;
    }
  }

  function beginConnection(nodeId: string) {
    if (!connectSource) {
      setConnectSource(nodeId);
      setNotice('Selecione o próximo bloco da cadeia lógica.');
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
      setNotice(`Conexão bloqueada: ${stageMeta(source.stage).label} só conecta à etapa seguinte.`);
      setConnectSource(null);
      return;
    }
    if (edges.some((edge) => edge.source === source.id && edge.target === target.id)) {
      setNotice('Essa conexão já existe.');
      setConnectSource(null);
      return;
    }
    capture();
    idCounterRef.current += 1;
    setEdges((items) => [...items, { id: `edge-${idCounterRef.current}`, source: source.id, target: target.id }]);
    setConnectSource(null);
    setNotice('Conexão criada e validada pela regra causal.');
  }

  function undo() {
    const previous = history.at(-1);
    if (!previous) return;
    setFuture((items) => [{ nodes, edges }, ...items]);
    setHistory((items) => items.slice(0, -1));
    setNodes(previous.nodes);
    setEdges(previous.edges);
    setNotice('Última alteração desfeita.');
    setSaveState('dirty');
  }

  function redo() {
    const next = future[0];
    if (!next) return;
    setHistory((items) => [...items, { nodes, edges }]);
    setFuture((items) => items.slice(1));
    setNodes(next.nodes);
    setEdges(next.edges);
    setNotice('Alteração refeita.');
    setSaveState('dirty');
  }

  function save() {
    setSaveState('saving');
    setNotice('Salvando versão local…');
    window.setTimeout(() => {
      setSaveState('saved');
      setNotice('Tudo salvo.');
    }, 680);
  }

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.brandGroup}>
          <div className={styles.brandMark} aria-hidden="true"><span /><span /><span /></div>
          <div>
            <strong>TMD Construtor</strong>
            <span>Canvas de Teoria da Mudança · V2</span>
          </div>
        </div>

        <div className={styles.documentState} data-state={saveState}>
          <span className={styles.stateDot} />
          {saveState === 'saved' ? 'Salvo' : saveState === 'saving' ? 'Salvando…' : 'Alterações não salvas'}
        </div>

        <div className={styles.topActions}>
          <button type="button" onClick={undo} disabled={!history.length} title="Desfazer">{icons.undo}</button>
          <button type="button" onClick={redo} disabled={!future.length} title="Refazer">{icons.redo}</button>
          <button type="button" onClick={() => setHistoryOpen((value) => !value)} data-active={historyOpen}>{icons.history}<span>Histórico</span></button>
          <button type="button" className={styles.saveButton} onClick={save}>{icons.save}<span>Salvar</span></button>
        </div>
      </header>

      <section className={styles.workspace}>
        <aside className={styles.rail} aria-label="Ferramentas do canvas">
          <button type="button" data-active="true" title="Selecionar">{icons.cursor}</button>
          <button type="button" data-active={Boolean(connectSource)} onClick={() => setConnectSource(selectedId)} title="Conectar">{icons.connect}</button>
          <span className={styles.railDivider} />
          <button type="button" title="Aproximar">{icons.zoomIn}</button>
          <button type="button" title="Afastar">{icons.zoomOut}</button>
          <button type="button" title="Centralizar">{icons.fit}</button>
        </aside>

        <div className={styles.canvasViewport}>
          <div
            ref={canvasRef}
            className={styles.canvas}
            style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
            onPointerMove={moveDrag}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          >
            <svg className={styles.connections} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} aria-hidden="true">
              {edges.map((edge) => {
                const source = nodes.find((node) => node.id === edge.source);
                const target = nodes.find((node) => node.id === edge.target);
                if (!source || !target) return null;
                const x1 = source.x + NODE_WIDTH;
                const y1 = source.y + NODE_HEIGHT / 2;
                const x2 = target.x;
                const y2 = target.y + NODE_HEIGHT / 2;
                const bend = Math.max(54, Math.abs(x2 - x1) * 0.45);
                return <path key={edge.id} d={`M ${x1} ${y1} C ${x1 + bend} ${y1}, ${x2 - bend} ${y2}, ${x2} ${y2}`} />;
              })}
            </svg>

            <div className={styles.stageGuide}>
              {STAGES.map((stage) => <span key={stage.id} data-stage={stage.id}>{stage.label}</span>)}
            </div>

            {nodes.map((node) => (
              <article
                key={node.id}
                className={styles.node}
                data-stage={node.stage}
                data-selected={selectedId === node.id}
                data-connecting={connectSource === node.id}
                style={{ transform: `translate3d(${node.x}px, ${node.y}px, 0)` }}
                onPointerDown={(event) => startDrag(event, node)}
                onClick={() => { setSelectedId(node.id); setInspectorOpen(true); }}
              >
                <button type="button" className={styles.nodeHandle} aria-label={`Conectar ${node.title}`} onClick={(event) => { event.stopPropagation(); beginConnection(node.id); }} />
                <div className={styles.nodeMeta}><span>{stageMeta(node.stage).singular}</span><button type="button" aria-label="Mais opções">{icons.more}</button></div>
                <h2>{node.title}</h2>
                <p>{node.description}</p>
                <div className={styles.nodeFooter}><span>{icons.connect} Conectar</span><small>Arraste para mover</small></div>
              </article>
            ))}

            <section className={styles.creator} data-open={creatorOpen} data-stage={selectedNode?.stage ?? 'input'}>
              <button type="button" className={styles.creatorToggle} onClick={() => setCreatorOpen((value) => !value)} aria-expanded={creatorOpen}>
                <span className={styles.creatorIcon}><i /><i /><i /></span>
                {creatorOpen && <span className={styles.creatorHeading}><strong>Adicionar ao canvas</strong><small>Escolha qualquer etapa</small></span>}
                <span className={styles.creatorChevron}>{creatorOpen ? icons.collapse : icons.expand}</span>
              </button>
              {creatorOpen && (
                <div className={styles.creatorBody}>
                  {STAGES.map((stage) => (
                    <button type="button" key={stage.id} data-stage={stage.id} onClick={() => addNode(stage.id)}>
                      <span className={styles.stageGlyph}>{icons.add}</span>
                      <span><strong>{stage.singular}</strong><small>{stage.hint}</small></span>
                      <em>{counts[stage.id]}</em>
                    </button>
                  ))}
                  <p>{icons.lock}<span>Riscos e hipóteses permanecem disponíveis somente entre relações válidas.</span></p>
                </div>
              )}
            </section>

            <div className={styles.notice} role="status"><span />{notice}</div>
          </div>
        </div>

        <aside className={styles.inspector} data-open={inspectorOpen}>
          <div className={styles.inspectorHeader}>
            <div><span>Inspector</span><strong>{selectedNode ? stageMeta(selectedNode.stage).singular : 'Canvas'}</strong></div>
            <button type="button" onClick={() => setInspectorOpen(false)} aria-label="Fechar inspector">{icons.close}</button>
          </div>

          {selectedNode ? (
            <div className={styles.inspectorContent} data-stage={selectedNode.stage}>
              <div className={styles.inspectorSummary}><span className={styles.inspectorStageDot} /><div><strong>{stageMeta(selectedNode.stage).label}</strong><small>Bloco selecionado</small></div></div>
              <label>Título<input value={selectedNode.title} onChange={(event) => updateSelected('title', event.target.value)} /></label>
              <label>Descrição<textarea value={selectedNode.description} onChange={(event) => updateSelected('description', event.target.value)} /></label>
              <div className={styles.logicCard}>
                <span>Lógica causal</span>
                <strong>{edges.filter((edge) => edge.source === selectedNode.id || edge.target === selectedNode.id).length} conexões válidas</strong>
                <p>Conecte somente à etapa seguinte. Tentativas incoerentes são bloqueadas antes de alterar o mapa.</p>
              </div>
              <button type="button" className={styles.inspectorAction} onClick={() => beginConnection(selectedNode.id)}>{icons.connect}<span>{connectSource ? 'Concluir conexão' : 'Criar conexão'}</span></button>
            </div>
          ) : <div className={styles.emptyInspector}>Selecione um bloco para editar.</div>}

          <div className={styles.progressPanel}>
            <div><span>Estrutura da teoria</span><small>{nodes.length} blocos · {edges.length} conexões</small></div>
            {STAGES.map((stage) => <div className={styles.progressRow} key={stage.id} data-stage={stage.id}><span /><strong>{stage.label}</strong><em>{counts[stage.id]}</em></div>)}
          </div>
        </aside>

        {!inspectorOpen && <button type="button" className={styles.inspectorReopen} onClick={() => setInspectorOpen(true)}>{icons.chevron}<span>Abrir inspector</span></button>}

        {historyOpen && (
          <aside className={styles.historyPanel}>
            <div className={styles.historyHeader}><div><span>Histórico</span><strong>Esta sessão</strong></div><button type="button" onClick={() => setHistoryOpen(false)}>{icons.close}</button></div>
            <ol>
              <li><span>{icons.check}</span><div><strong>Estado atual</strong><small>{nodes.length} blocos no canvas</small></div></li>
              {history.slice().reverse().map((_, index) => <li key={index}><span>{index + 1}</span><div><strong>Alteração registrada</strong><small>Versão {history.length - index}</small></div></li>)}
            </ol>
          </aside>
        )}
      </section>
    </main>
  );
}
