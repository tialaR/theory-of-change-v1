import type { ReactNode } from 'react';
import styles from './resend-command-preview.module.sass'; 
export type LabTab = 'experiencia' | 'componentes' | 'estados' | 'tipografia' | 'referencias';
export const TABS: { id: LabTab; label: string }[] = [
  { id: 'experiencia', label: 'Experiência' },
  { id: 'componentes', label: 'Componentes' },
  { id: 'estados', label: 'Estados' },
  { id: 'tipografia', label: 'Tipografia & Ícones' },
  { id: 'referencias', label: 'Referências' }
];
export function Icon({
  children,
  size = 16,
  className,
  stroke = 1.55
}: {
  children: ReactNode;
  size?: 16 | 18;
  className?: string;
  stroke?: number;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? (size === 18 ? styles.iconMd : styles.icon)}
    >
      {children}
    </svg>
  );
}
export const icons = {
  add: (
    <Icon>
      <path d="M12 5v14M5 12h14" />
    </Icon>
  ),
  edit: (
    <Icon>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </Icon>
  ),
  duplicate: (
    <Icon>
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M4 16V6a2 2 0 0 1 2-2h10" />
    </Icon>
  ),
  delete: (
    <Icon>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
    </Icon>
  ),
  layers: (
    <Icon>
      <path d="m12 2 9 5-9 5-9-5Z" />
      <path d="m3 12 9 5 9-5" />
      <path d="m3 17 9 5 9-5" />
    </Icon>
  ),
  guide: (
    <Icon>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </Icon>
  ),
  example: (
    <Icon>
      <path d="M8 6h11" />
      <path d="M8 12h11" />
      <path d="M8 18h11" />
      <path d="M4 6h.01M4 12h.01M4 18h.01" />
    </Icon>
  ),
  connection: (
    <Icon>
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <path d="M8.2 11.2 15.5 7.2M8.2 12.8 15.5 16.8" />
    </Icon>
  ),
  close: (
    <Icon>
      <path d="M6 6l12 12M18 6 6 18" />
    </Icon>
  ),
  chevron: (
    <Icon>
      <path d="m9 6 6 6-6 6" />
    </Icon>
  ),
  easy: (
    <Icon>
      <path d="M4 12h16" />
      <path d="M8 8l-4 4 4 4" />
      <path d="M16 8l4 4-4 4" />
    </Icon>
  ),
  attach: (
    <Icon>
      <path d="M15.5 7.5 8.4 14.6a2.5 2.5 0 0 0 3.5 3.5l8.1-8.1a4 4 0 0 0-5.7-5.7L6.5 12" />
    </Icon>
  ),
  visibility: (
    <Icon>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </Icon>
  ),
  delivery: (
    <Icon>
      <path d="M3 7h11v10H3z" />
      <path d="M14 10h4l3 3v4h-7" />
      <circle cx="7" cy="18" r="1.5" />
      <circle cx="17" cy="18" r="1.5" />
    </Icon>
  )
};
export const EXPERIENCE_NODES = [
  {
    stage: 'input' as const,
    stageLabel: 'Insumos',
    title: 'Equipe técnica',
    desc: 'Recurso necessário para a política acontecer.',
    selected: true
  },
  {
    stage: 'activity' as const,
    stageLabel: 'Atividades',
    title: 'Capacitação local',
    desc: 'Ação realizada com os recursos disponíveis.',
    selected: false
  },
  {
    stage: 'product' as const,
    stageLabel: 'Produtos',
    title: 'Material formativo',
    desc: 'Entrega concreta gerada pela atividade.',
    selected: false
  },
  {
    stage: 'outcome' as const,
    stageLabel: 'Resultados',
    title: 'Adesão ampliada',
    desc: 'Mudança esperada após as entregas.',
    selected: false
  }
];
export function GalleryItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.galleryItem}>
      <span className={styles.galleryLabel}>{label}</span>
      <div className={styles.gallerySurface}>{children}</div>
    </div>
  );
}
export function EditorialNode({
  stage,
  stageLabel,
  title,
  desc,
  selected,
  editing,
  staticPos
}: {
  stage: 'input' | 'activity' | 'product' | 'outcome';
  stageLabel: string;
  title: string;
  desc: string;
  selected?: boolean;
  editing?: boolean;
  staticPos?: boolean;
}) {
  return (
    <article
      className={`${styles.node} ${staticPos ? styles.nodeStatic : ''}`}
      data-stage={stage}
      data-selected={selected ? 'true' : undefined}
      data-editing={editing ? 'true' : undefined}
    >
      <div className={`${styles.handle} ${styles.handleLeft}`} />
      <div className={styles.nodeStage}>{stageLabel}</div>
      <h2 className={styles.nodeTitle}>{title}</h2>
      {editing ? (
        <input
          className={styles.nodeEditInput}
          type="text"
          defaultValue={desc}
          readOnly
        />
      ) : (
        <p className={styles.nodeDesc}>{desc}</p>
      )}
      <div className={`${styles.handle} ${styles.handleRight}`} />
    </article>
  );
}
export function CommandPlate({
  compact,
  tone = 'stage'
}: {
  compact?: boolean;
  tone?: 'stage' | 'neutral';
}) {
  return (
    <div
      className={`${styles.commandPlateInner} ${compact ? styles.commandPlateCompact : styles.commandPlateExpanded}`}
      data-tone={tone}
    >
      <span className={styles.commandPlateDot} data-tone={tone} />
      <span className={styles.commandPlateText}>
        {tone === 'neutral' ? 'Conectar' : 'Insumos'}
        <span className={styles.commandPlateSep}>·</span>
        2/2/1/1
        <span className={styles.commandPlateSep}>·</span>
        {tone === 'neutral' ? 'Revisar' : 'Conexões'}
      </span>
    </div>
  );
}
export function ActionBarDemo() {
  return (
    <div className={styles.actionBar} role="toolbar" aria-label="Ações do bloco">
      <button type="button" className={styles.actionItem}>
        {icons.close}
        Fechar
      </button>
      <button type="button" className={styles.actionItem}>
        {icons.edit}
        Editar
      </button>
      <button type="button" className={styles.actionItem}>
        {icons.duplicate}
        Duplicar
      </button>
      <button type="button" className={styles.actionItem} data-danger="true">
        {icons.delete}
        Deletar
      </button>
    </div>
  );
}
export function RiskModal() {
  return (
    <aside className={styles.riskPanel} aria-label="Qualificar passagem">
      <div className={styles.riskEyebrow}>Qualificar passagem</div>
      <h3 className={styles.riskTitle}>Risco desta passagem</h3>
      <p className={styles.riskSub}>O que pode atrapalhar esta conexão?</p>
      <textarea
        className={styles.riskTextarea}
        defaultValue=""
        placeholder="Ex.: baixa adesão, atraso de recursos, equipe insuficiente..."
        readOnly
      />
      <div className={styles.riskActions}>
        <button type="button" className={`${styles.btn} ${styles.btnSm} ${styles.btnSecondary}`}>
          Cancelar
        </button>
        <button type="button" className={`${styles.btn} ${styles.btnSm} ${styles.btnPrimaryNeutral}`}>
          Salvar risco
        </button>
      </div>
    </aside>
  );
}
export function HypothesisModal() {
  return (
    <aside className={styles.hypothesisPanel} aria-label="Explicitar lógica causal">
      <div className={styles.riskEyebrow}>Explicitar lógica causal</div>
      <h3 className={styles.riskTitle}>Hipótese desta passagem</h3>
      <p className={styles.riskSub}>Por que esta conexão deve funcionar?</p>
      <textarea
        className={styles.riskTextarea}
        defaultValue=""
        placeholder="Ex.: se a capacitação ocorrer, a adesão local aumenta..."
        readOnly
      />
      <div className={styles.riskActions}>
        <button type="button" className={`${styles.btn} ${styles.btnSm} ${styles.btnSecondary}`}>
          Cancelar
        </button>
        <button type="button" className={`${styles.btn} ${styles.btnSm} ${styles.btnPrimaryNeutral}`}>
          Salvar hipótese
        </button>
      </div>
    </aside>
  );
}
export function LeftRailDemo() {
  return (
    <nav className={styles.leftRail} aria-label="Ferramentas">
      <button type="button" className={styles.railBtn} aria-label="Camadas">
        {icons.layers}
      </button>
      <button type="button" className={styles.railBtn} aria-label="Conexões">
        {icons.connection}
      </button>
      <button type="button" className={styles.railBtn} aria-label="Adicionar">
        {icons.add}
      </button>
      <button type="button" className={styles.railBtn} aria-label="Guia">
        {icons.guide}
      </button>
    </nav>
  );
}
export function MiniMapDemo() {
  return (
    <div className={styles.miniMap} aria-hidden="true">
      <div className={styles.miniMapLabel}>Mapa</div>
      <div className={styles.miniMapDots}>
        <span className={styles.miniDot} data-stage="input" />
        <span className={styles.miniDot} data-stage="activity" />
        <span className={styles.miniDot} data-stage="product" />
        <span className={styles.miniDot} data-stage="outcome" />
        <span className={styles.miniViewport} />
      </div>
    </div>
  );
}
export function CoachInspectorSection() {
  return (
    <section className={styles.coachSnippet}>
      <div className={styles.sectionLabel}>Agora</div>
      <div className={styles.sectionTitle}>Crie seu primeiro insumo.</div>
      <p className={styles.sectionBody}>Arraste para o canvas ou use o formulário.</p>
      <button type="button" className={`${styles.btn} ${styles.btnLg} ${styles.btnPrimaryContextual}`}>
        {icons.add}
        Adicionar insumo
      </button>
    </section>
  );
}
export function ResultCard({ ready }: { ready?: boolean }) {
  return (
    <section className={styles.resultCard} data-ready={ready ? 'true' : undefined}>
      <div className={styles.sectionLabel}>Resultado</div>
      <div className={styles.sectionTitle}>
        {ready ? 'Resultado pronto' : 'Resultado bloqueado'}
      </div>
      <p className={styles.sectionBody}>
        {ready
          ? 'Revise etapas, conexões, riscos e hipóteses.'
          : 'Complete as etapas e conexões para liberar o resultado.'}
      </p>
      <button
        type="button"
        className={`${styles.btn} ${styles.btnLg} ${styles.btnPrimaryNeutral}`}
        disabled={!ready}
      >
        Visualizar resultado
        {icons.chevron}
      </button>
    </section>
  );
}
export function StateFrame({
  label,
  children,
  wide
}: {
  label: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={`${styles.stateFrame} ${wide ? styles.stateFrameWide : ''}`}>
      <span className={styles.galleryLabel}>{label}</span>
      <div className={styles.stateSurface}>{children}</div>
    </div>
  );
}
