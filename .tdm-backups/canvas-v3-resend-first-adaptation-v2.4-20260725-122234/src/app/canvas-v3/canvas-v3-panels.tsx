'use client';

import { icons } from './canvas-v3.icons';
import { STAGES, stageMeta, type CanvasEdge, type CanvasNode, type Snapshot, type StageId } from './canvas-v3.model';
import styles from './canvas-v3.module.sass';

type HeaderProps = {
  theoryName: string;
  canUndo: boolean;
  canRedo: boolean;
  historyOpen: boolean;
  versions: Snapshot[];
  onTheoryName: (value: string) => void;
  onBack: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onHistory: () => void;
  onSave: () => void;
  onRestore: (version: Snapshot) => void;
};

export function CanvasHeader(props: HeaderProps) {
  return (
    <header className={styles.topbar}>
      <div className={styles.brandArea}>
        <button type="button" className={styles.backButton} onClick={props.onBack} data-tooltip="Voltar para o início">{icons.back}</button>
        <img className={styles.brandLogo} src="/brand/tmd-construtor-header-canonical.webp" alt="TMD Construtor" />
        <input className={styles.theoryNameInput} value={props.theoryName} onChange={(event) => props.onTheoryName(event.target.value)} aria-label="Nome da teoria" />
      </div>
      <div className={styles.topActions}>
        <button type="button" onClick={props.onUndo} disabled={!props.canUndo} data-tooltip="Desfazer">{icons.undo}</button>
        <button type="button" onClick={props.onRedo} disabled={!props.canRedo} data-tooltip="Refazer">{icons.redo}</button>
        <div className={styles.historyWrap}>
          <button type="button" className={styles.textAction} onClick={props.onHistory} data-tooltip="Histórico">{icons.history}<span>Histórico</span></button>
          {props.historyOpen && (
            <div className={styles.historyPanel}>
              <strong>Versões salvas</strong>
              {!props.versions.length && <p>Nenhuma versão salva ainda.</p>}
              {props.versions.map((version) => (
                <button key={version.id} type="button" onClick={() => props.onRestore(version)}>
                  <span>{version.label}</span><small>{new Date(version.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</small>
                </button>
              ))}
            </div>
          )}
        </div>
        <button type="button" className={styles.saveButton} onClick={props.onSave} data-tooltip="Salvar versão">{icons.save}<span>Salvar</span></button>
      </div>
    </header>
  );
}

type StageDockProps = {
  open: boolean;
  counts: Record<StageId, number>;
  onToggle: () => void;
  onDragStart: (event: React.DragEvent<HTMLButtonElement>, stage: StageId) => void;
  onCreate: (stage: StageId) => void;
};

export function StageDock(props: StageDockProps) {
  return (
    <aside className={styles.stageDock} data-open={props.open} aria-label="Adicionar etapas">
      <button type="button" className={styles.stageDockToggle} onClick={props.onToggle} data-tooltip={props.open ? 'Recolher etapas' : 'Adicionar etapas'}>
        <span className={styles.stageStack}><i /><i /><i /></span>
        {props.open && <span>Adicionar etapa</span>}
        {props.open ? icons.close : icons.plus}
      </button>
      {props.open && (
        <div className={styles.stageList}>
          {STAGES.map((stage) => (
            <button key={stage.id} type="button" draggable onDragStart={(event) => props.onDragStart(event, stage.id)} onDoubleClick={() => props.onCreate(stage.id)} data-stage={stage.id} data-tooltip={`Arraste ${stage.label} para o canvas`}>
              <span className={styles.stageDot} /><span>{stage.label}</span><small>{props.counts[stage.id]}</small>
            </button>
          ))}
        </div>
      )}
    </aside>
  );
}

type SidebarProps = {
  open: boolean;
  node: CanvasNode | null;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  onToggle: () => void;
  onCreate: (stage: StageId) => void;
  onEditSelected: () => void;
  onConnectSelected: () => void;
  onGuide: () => void;
  onExamples: () => void;
  onResult: () => void;
};

export function CoachSidebar(props: SidebarProps) {
  const currentStage = props.node?.stage ?? 'input';
  const meta = stageMeta(currentStage);
  const stageCount = props.nodes.filter((node) => node.stage === currentStage).length;
  const connectedCount = props.node ? props.edges.filter((edge) => edge.source === props.node?.id || edge.target === props.node?.id).length : 0;

  return (
    <aside className={styles.coachSidebar} data-open={props.open}>
      <button type="button" className={styles.sidebarToggle} onClick={props.onToggle} data-tooltip={props.open ? 'Fechar orientação' : 'Abrir orientação'}>{props.open ? icons.close : icons.chevron}</button>
      {props.open && (
        <div className={styles.sidebarContent}>
          <div className={styles.sidebarIntro}>
            <small>Construtor de Teoria da Mudança</small>
            <h2>{meta.label}</h2>
            <p>{meta.hint}</p>
          </div>

          <section className={styles.sidebarPrimary}>
            <span>Agora</span>
            <strong>{meta.question}</strong>
            <button type="button" onClick={() => props.onCreate(currentStage)}>{icons.plus}<span>Adicionar {meta.label.toLowerCase()}</span></button>
          </section>

          {props.node && (
            <section className={styles.sidebarSelection}>
              <span>Card selecionado</span>
              <strong>{props.node.title}</strong>
              <p>{props.node.description}</p>
              <div className={styles.sidebarSelectionActions}>
                <button type="button" onClick={props.onEditSelected}>{icons.edit}<span>Editar no card</span></button>
                {meta.next && <button type="button" onClick={props.onConnectSelected}>{icons.connect}<span>Conectar a {meta.next}</span></button>}
              </div>
              <small>{stageCount} nesta etapa · {connectedCount} conexões neste card</small>
            </section>
          )}

          <section className={styles.sidebarCoherence}>
            <span>Coerência causal</span>
            <p>Crie em qualquer ordem. As conexões seguem Insumo → Atividade → Produto → Resultado.</p>
          </section>

          <nav className={styles.sidebarLinks}>
            <button type="button" onClick={props.onGuide}>{icons.guide}<span>Guia</span></button>
            <button type="button" onClick={props.onExamples}>{icons.example}<span>Exemplos</span></button>
            <button type="button" onClick={props.onResult}>{icons.result}<span>Ver resultado</span></button>
          </nav>
        </div>
      )}
    </aside>
  );
}
