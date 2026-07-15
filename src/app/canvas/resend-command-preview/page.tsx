'use client';

import { useState, type ReactNode } from 'react';
import styles from './resend-command-preview.module.sass';

type LabTab = 'experiencia' | 'componentes' | 'estados' | 'tipografia' | 'referencias';

const TABS: { id: LabTab; label: string }[] = [
  { id: 'experiencia', label: 'Experiência' },
  { id: 'componentes', label: 'Componentes' },
  { id: 'estados', label: 'Estados' },
  { id: 'tipografia', label: 'Tipografia & Ícones' },
  { id: 'referencias', label: 'Referências' }
];

function Icon({
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

const icons = {
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

const EXPERIENCE_NODES = [
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

function GalleryItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.galleryItem}>
      <span className={styles.galleryLabel}>{label}</span>
      <div className={styles.gallerySurface}>{children}</div>
    </div>
  );
}

function EditorialNode({
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

function CommandPlate({
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

function ActionBarDemo() {
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

function RiskModal() {
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

function HypothesisModal() {
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

function LeftRailDemo() {
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

function MiniMapDemo() {
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

function CoachInspectorSection() {
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

function ResultCard({ ready }: { ready?: boolean }) {
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

function StateFrame({
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

function ExperienceTab() {
  return (
    <div className={styles.experience}>
      <div className={styles.canvas} aria-hidden="true" />

      <div className={styles.commandPlate}>
        <CommandPlate />
        <CommandPlate tone="neutral" compact />
        <p className={styles.commandPlateHint}>
          Depois de Resultados vem: <strong>Conectar lógica</strong>
        </p>
      </div>

      <svg className={styles.edges} viewBox="0 0 1200 800" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <marker
            id="arrow-lab"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="4"
            markerHeight="4"
            orient="auto-start-reverse"
          >
            <path
              d="M1 1 L9 5 L1 9"
              fill="none"
              stroke="rgba(188,192,204,0.45)"
              strokeWidth="1.4"
            />
          </marker>
        </defs>
        <path
          d="M210 280 C290 250, 320 230, 400 220"
          fill="none"
          stroke="rgba(188,192,204,0.28)"
          strokeWidth="1.1"
          strokeDasharray="3 7"
          markerEnd="url(#arrow-lab)"
        />
        <path
          d="M520 240 C600 280, 640 340, 700 360"
          fill="none"
          stroke="rgba(188,192,204,0.24)"
          strokeWidth="1.1"
          strokeDasharray="3 7"
          markerEnd="url(#arrow-lab)"
        />
        <path
          d="M760 360 C820 300, 860 260, 920 250"
          fill="none"
          stroke="rgba(188,192,204,0.22)"
          strokeWidth="1.1"
          strokeDasharray="3 7"
          markerEnd="url(#arrow-lab)"
        />
      </svg>

      <span className={`${styles.edgeBadge} ${styles.badgeR}`}>R</span>
      <span className={`${styles.edgeBadge} ${styles.badgeH}`}>H</span>

      <div className={styles.actionBarExp}>
        <ActionBarDemo />
      </div>

      <div className={styles.nodes}>
        {EXPERIENCE_NODES.map((node) => (
          <EditorialNode key={node.stage} {...node} />
        ))}
      </div>

      <div className={styles.riskPanelExp}>
        <RiskModal />
      </div>

      <div className={styles.hypothesisChip}>
        <div className={styles.hypothesisChipTitle}>Explicitar lógica causal</div>
        <div className={styles.hypothesisChipSub}>Hipótese desta passagem</div>
      </div>

      <div className={styles.leftRailExp}>
        <LeftRailDemo />
      </div>

      <aside className={styles.checklist} aria-label="Checklist técnico">
        <div className={styles.checklistTitle}>Resend Command Visual Lab</div>
        <ul className={styles.checklistList}>
          <li>zero pill em botões</li>
          <li>cor de etapa só como sinal</li>
          <li>risco/hipótese neutros</li>
          <li>Command Plate não é header</li>
          <li>sidebar é coach inspector</li>
          <li>nodes são editoriais</li>
          <li>edges são lógica fina</li>
          <li>fase Conectar é neutra</li>
        </ul>
      </aside>

      <div className={styles.miniMapExp}>
        <MiniMapDemo />
      </div>

      <aside className={styles.sidebar} aria-label="Coach Inspector">
        <div className={styles.sidebarScroll}>
          <header className={styles.sidebarHeader}>
            <h1 className={styles.sidebarTitle}>Construtor de Teoria da Mudança</h1>
            <p className={styles.sidebarLead}>
              Mapeie como recursos viram ações, entregas e resultados.
            </p>
          </header>

          <div className={styles.divider} />

          <CoachInspectorSection />

          <div className={styles.divider} />

          <section className={styles.section}>
            <div className={styles.sectionLabel}>Entenda</div>
            <div className={styles.sectionTitle}>Insumos</div>
            <p className={styles.sectionBody}>
              Recursos que precisam existir antes da ação começar.
            </p>
            <p className={styles.guideQ}>Pergunta-guia: O que precisa estar disponível?</p>
            <p className={styles.examples}>Exemplos: equipe, orçamento, dados, parceiros.</p>
          </section>

          <div className={styles.divider} />

          <section className={styles.section}>
            <div className={styles.sectionLabel}>Etapas</div>
            <ol className={styles.steps}>
              <li className={styles.step} data-active="true">
                <span className={styles.stepNum}>1</span>
                Insumos
              </li>
              <li className={styles.step}>
                <span className={styles.stepNum}>2</span>
                Atividades
              </li>
              <li className={styles.step}>
                <span className={styles.stepNum}>3</span>
                Produtos
              </li>
              <li className={styles.step}>
                <span className={styles.stepNum}>4</span>
                Resultados
              </li>
              <li className={styles.step} data-neutral="true">
                <span className={styles.stepNum}>5</span>
                Conectar lógica
              </li>
            </ol>
          </section>

          <div className={styles.divider} />

          <section className={styles.connectBlock}>
            <div className={styles.sectionLabel}>Fase Conectar</div>
            <p className={styles.connectHint}>
              Depois de Resultados, o próximo passo é: <strong>Conectar lógica</strong>
            </p>
            <button type="button" className={`${styles.btn} ${styles.btnLg} ${styles.btnPrimaryNeutral}`}>
              {icons.connection}
              Conectar lógica da teoria
            </button>
          </section>

          <div className={styles.divider} />

          <section className={styles.section}>
            <div className={styles.sectionLabel}>Inspector</div>
            <div className={styles.inspectorRow}>
              <button type="button" className={styles.inspectorLink}>
                {icons.add}
                Criar bloco
              </button>
              <button type="button" className={styles.inspectorLink}>
                {icons.edit}
                Editar bloco
              </button>
            </div>
          </section>

          <div className={styles.divider} />

          <section className={styles.section}>
            <div className={styles.sectionLabel}>Formulário</div>
            <div className={styles.form}>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Título</span>
                <input
                  className={`${styles.input} ${styles.inputFocusMock}`}
                  type="text"
                  placeholder="Nome do insumo"
                  defaultValue="Equipe técnica"
                  readOnly
                />
              </label>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Descrição breve</span>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="Uma linha que resume o bloco"
                  readOnly
                />
              </label>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Detalhes avançados</span>
                <textarea
                  className={styles.textarea}
                  placeholder="Contexto, critérios ou observação metodológica"
                  readOnly
                />
              </label>
            </div>
          </section>

          <div className={styles.divider} />

          <section className={`${styles.section} ${styles.resultBlock}`}>
            <div className={styles.sectionLabel}>Resultado</div>
            <div className={styles.sectionTitle}>Resultado da sua teoria</div>
            <p className={styles.sectionBody}>
              Revise etapas, conexões, riscos e hipóteses.
            </p>
            <button type="button" className={`${styles.btn} ${styles.btnLg} ${styles.btnPrimaryNeutral}`}>
              Visualizar resultado
              {icons.chevron}
            </button>
          </section>
        </div>
      </aside>
    </div>
  );
}

function ComponentsTab() {
  return (
    <div className={styles.labScroll}>
      <header className={styles.labHeader}>
        <h2 className={styles.labTitle}>Componentes</h2>
        <p className={styles.labLead}>
          Galeria isolada da linguagem Resend Command Canvas.
        </p>
      </header>

      <div className={styles.galleryGrid}>
        <GalleryItem label="Command Plate compact">
          <CommandPlate compact />
        </GalleryItem>

        <GalleryItem label="Command Plate expanded">
          <CommandPlate />
        </GalleryItem>

        <GalleryItem label="Editorial Node normal">
          <EditorialNode
            staticPos
            stage="activity"
            stageLabel="Atividades"
            title="Capacitação local"
            desc="Ação realizada com os recursos disponíveis."
          />
        </GalleryItem>

        <GalleryItem label="Editorial Node selected">
          <EditorialNode
            staticPos
            stage="input"
            stageLabel="Insumos"
            title="Equipe técnica"
            desc="Recurso necessário para a política acontecer."
            selected
          />
        </GalleryItem>

        <GalleryItem label="Editorial Node editing">
          <EditorialNode
            staticPos
            stage="product"
            stageLabel="Produtos"
            title="Material formativo"
            desc="Entrega concreta gerada pela atividade."
            selected
            editing
          />
        </GalleryItem>

        <GalleryItem label="Coach Inspector section">
          <CoachInspectorSection />
        </GalleryItem>

        <GalleryItem label="Input">
          <input
            className={`${styles.input} ${styles.inputFocusMock}`}
            type="text"
            defaultValue="Equipe técnica"
            readOnly
          />
        </GalleryItem>

        <GalleryItem label="Textarea">
          <textarea
            className={styles.textarea}
            placeholder="Contexto, critérios ou observação metodológica"
            readOnly
          />
        </GalleryItem>

        <GalleryItem label="CTA neutral">
          <button type="button" className={`${styles.btn} ${styles.btnLg} ${styles.btnPrimaryNeutral}`}>
            Conectar lógica da teoria
          </button>
        </GalleryItem>

        <GalleryItem label="CTA contextual">
          <button type="button" className={`${styles.btn} ${styles.btnLg} ${styles.btnPrimaryContextual}`}>
            {icons.add}
            Adicionar insumo
          </button>
        </GalleryItem>

        <GalleryItem label="CTA danger">
          <button type="button" className={`${styles.btn} ${styles.btnLg} ${styles.btnDanger}`}>
            {icons.delete}
            Remover bloco
          </button>
        </GalleryItem>

        <GalleryItem label="Action bar">
          <ActionBarDemo />
        </GalleryItem>

        <GalleryItem label="Risk modal">
          <RiskModal />
        </GalleryItem>

        <GalleryItem label="Hypothesis modal">
          <HypothesisModal />
        </GalleryItem>

        <GalleryItem label="Quick links">
          <div className={styles.supportRow}>
            <button type="button" className={styles.supportLink}>
              {icons.example}
              Exemplos
            </button>
            <button type="button" className={styles.supportLink}>
              {icons.guide}
              Guia
            </button>
          </div>
        </GalleryItem>

        <GalleryItem label="Result card">
          <ResultCard ready />
        </GalleryItem>

        <GalleryItem label="Left rail">
          <LeftRailDemo />
        </GalleryItem>

        <GalleryItem label="Minimap">
          <MiniMapDemo />
        </GalleryItem>
      </div>
    </div>
  );
}

function StatesTab() {
  return (
    <div className={styles.labScroll}>
      <header className={styles.labHeader}>
        <h2 className={styles.labTitle}>Estados</h2>
        <p className={styles.labLead}>
          Sequência visual do canvas — incluindo a fase neutra Conectar lógica.
        </p>
      </header>

      <div className={styles.statesGrid}>
        <StateFrame label="Empty canvas">
          <div className={styles.stateCanvas}>
            <p className={styles.stateEmpty}>Canvas vazio · pronto para o primeiro bloco</p>
          </div>
        </StateFrame>

        <StateFrame label="1 node">
          <div className={styles.stateCanvas}>
            <EditorialNode
              staticPos
              stage="input"
              stageLabel="Insumos"
              title="Novo insumo"
              desc="Primeiro bloco no canvas."
            />
          </div>
        </StateFrame>

        <StateFrame label="Node selected">
          <div className={styles.stateCanvas}>
            <div className={styles.stateStack}>
              <ActionBarDemo />
              <EditorialNode
                staticPos
                stage="input"
                stageLabel="Insumos"
                title="Equipe técnica"
                desc="Bloco selecionado."
                selected
              />
            </div>
          </div>
        </StateFrame>

        <StateFrame label="Editing node">
          <div className={styles.stateCanvas}>
            <EditorialNode
              staticPos
              stage="activity"
              stageLabel="Atividades"
              title="Capacitação local"
              desc="Editando descrição do bloco."
              selected
              editing
            />
          </div>
        </StateFrame>

        <StateFrame label="Connecting phase">
          <div className={styles.stateCanvas}>
            <div className={styles.stateConnecting}>
              <EditorialNode
                staticPos
                stage="input"
                stageLabel="Insumos"
                title="Equipe"
                desc="Origem"
              />
              <div className={styles.connectLine} />
              <EditorialNode
                staticPos
                stage="activity"
                stageLabel="Atividades"
                title="Ação"
                desc="Destino"
                selected
              />
            </div>
            <span className={styles.connectHintChip}>Arraste para conectar</span>
          </div>
        </StateFrame>

        <StateFrame label="Risk open">
          <div className={styles.stateCanvas}>
            <RiskModal />
          </div>
        </StateFrame>

        <StateFrame label="Hypothesis open">
          <div className={styles.stateCanvas}>
            <HypothesisModal />
          </div>
        </StateFrame>

        <StateFrame label="Result blocked">
          <div className={styles.stateCanvas}>
            <ResultCard />
          </div>
        </StateFrame>

        <StateFrame label="Result ready">
          <div className={styles.stateCanvas}>
            <ResultCard ready />
          </div>
        </StateFrame>

        <StateFrame label="Connect phase active" wide>
          <div className={styles.stateCanvas} data-connect="true">
            <CommandPlate tone="neutral" />
            <section className={styles.connectBlock}>
              <div className={styles.sectionLabel}>Conectar lógica</div>
              <p className={styles.connectHint}>
                Depois de Resultados: fase neutra branco/prata — sem cor de etapa.
              </p>
              <button type="button" className={`${styles.btn} ${styles.btnLg} ${styles.btnPrimaryNeutral}`}>
                {icons.connection}
                Conectar lógica da teoria
              </button>
            </section>
            <ol className={styles.steps}>
              <li className={styles.step}>
                <span className={styles.stepNum}>4</span>
                Resultados
              </li>
              <li className={styles.step} data-neutral="true" data-active="true">
                <span className={styles.stepNum}>5</span>
                Conectar lógica
              </li>
            </ol>
          </div>
        </StateFrame>
      </div>
    </div>
  );
}

function TypographyTab() {
  const iconExamples: { label: string; icon: ReactNode }[] = [
    { label: 'fácil de usar', icon: icons.easy },
    { label: 'anexos', icon: icons.attach },
    { label: 'alta visibilidade', icon: icons.visibility },
    { label: 'entrega e acesso', icon: icons.delivery },
    { label: 'criar', icon: icons.add },
    { label: 'editar', icon: icons.edit },
    { label: 'duplicar', icon: icons.duplicate },
    { label: 'deletar', icon: icons.delete },
    { label: 'camadas', icon: icons.layers },
    { label: 'conexão', icon: icons.connection },
    { label: 'guia', icon: icons.guide },
    { label: 'exemplos', icon: icons.example },
    { label: 'fechar', icon: icons.close },
    { label: 'chevron', icon: icons.chevron }
  ];

  return (
    <div className={styles.labScroll}>
      <header className={styles.labHeader}>
        <h2 className={styles.labTitle}>Tipografia & Ícones</h2>
        <p className={styles.labLead}>
          Branco/prata translúcido — nunca #FFFFFF puro. Ícones finos, 16–18px.
        </p>
      </header>

      <section className={styles.typeGuide}>
        <div className={styles.typeRow}>
          <span className={styles.galleryLabel}>display / title</span>
          <h3 className={styles.typeDisplay}>Construtor de Teoria da Mudança</h3>
        </div>
        <div className={styles.typeRow}>
          <span className={styles.galleryLabel}>label técnico</span>
          <span className={styles.typeLabel}>Insumos · 2/2/1/1 · Conexões</span>
        </div>
        <div className={styles.typeRow}>
          <span className={styles.galleryLabel}>node title</span>
          <span className={styles.typeNodeTitle}>Equipe técnica</span>
        </div>
        <div className={styles.typeRow}>
          <span className={styles.galleryLabel}>body</span>
          <p className={styles.typeBody}>
            Mapeie como recursos viram ações, entregas e resultados mensuráveis.
          </p>
        </div>
        <div className={styles.typeRow}>
          <span className={styles.galleryLabel}>muted</span>
          <p className={styles.typeMuted}>Texto de apoio que não some no fundo escuro.</p>
        </div>
        <div className={styles.typeRow}>
          <span className={styles.galleryLabel}>button</span>
          <span className={styles.typeButton}>Conectar lógica da teoria</span>
        </div>
        <div className={styles.typeRow}>
          <span className={styles.galleryLabel}>helper text</span>
          <p className={styles.typeHelper}>
            Depois de Resultados vem a fase neutra: Conectar lógica.
          </p>
        </div>
      </section>

      <section className={styles.iconGuide}>
        <h3 className={styles.sectionTitle}>Ícones</h3>
        <p className={styles.sectionBody}>
          SVG inline · stroke 1.55 · sem container gigante · cor translúcida.
        </p>
        <div className={styles.iconGrid}>
          {iconExamples.map((item) => (
            <div key={item.label} className={styles.iconCard}>
              <span className={styles.iconGlyph}>{item.icon}</span>
              <span className={styles.iconCardLabel}>{item.label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ReferencesTab() {
  return (
    <div className={styles.labScroll}>
      <header className={styles.labHeader}>
        <h2 className={styles.labTitle}>Referências</h2>
        <p className={styles.labLead}>Regra visual do Resend Command Canvas.</p>
      </header>

      <article className={styles.refsCard}>
        <h3 className={styles.typeDisplay}>Resend Command Canvas</h3>
        <ul className={styles.refsList}>
          <li>preto profundo</li>
          <li>prata</li>
          <li>luz no topo</li>
          <li>borda fina</li>
          <li>bottom desaparecendo</li>
          <li>cor de etapa só como sinal</li>
          <li>CTA neutro por padrão</li>
          <li>risco/hipótese neutros</li>
          <li>zero pill</li>
          <li>zero neon</li>
          <li>zero botão chapado</li>
        </ul>

        <div className={styles.refsRules}>
          <div>
            <h4 className={styles.sectionTitle}>Radius</h4>
            <p className={styles.typeMuted}>
              micro 0.5rem · botões 0.625–0.75rem · inputs 0.75rem · cards 0.875–1rem ·
              dots circulares · nunca 999rem em botões/inputs/cards/toolbar
            </p>
          </div>
          <div>
            <h4 className={styles.sectionTitle}>CTAs</h4>
            <p className={styles.typeMuted}>
              retangulares · gradiente branco/prata no neutro · acento sutil contextual ·
              nunca chapado
            </p>
          </div>
          <div>
            <h4 className={styles.sectionTitle}>Inputs</h4>
            <p className={styles.typeMuted}>
              borda fina · menos peso · mais respiro · foco sutil
            </p>
          </div>
          <div>
            <h4 className={styles.sectionTitle}>Tipografia</h4>
            <p className={styles.typeMuted}>
              sem #fff puro · títulos com gradiente branco/prata · labels menos espaçados ·
              muted legível
            </p>
          </div>
        </div>
      </article>
    </div>
  );
}

export default function ResendCommandPreviewPage() {
  const [tab, setTab] = useState<LabTab>('experiencia');

  return (
    <main className={styles.page}>
      <nav className={styles.labSwitch} aria-label="Resend Command Visual Lab">
        <div className={styles.labSwitchBrand}>
          <span className={styles.labSwitchDot} />
          <span className={styles.labSwitchName}>Resend Command Visual Lab</span>
        </div>
        <div className={styles.labTabs} role="tablist">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              className={styles.labTab}
              data-active={tab === item.id ? 'true' : undefined}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      <div className={styles.labBody}>
        {tab === 'experiencia' && <ExperienceTab />}
        {tab === 'componentes' && <ComponentsTab />}
        {tab === 'estados' && <StatesTab />}
        {tab === 'tipografia' && <TypographyTab />}
        {tab === 'referencias' && <ReferencesTab />}
      </div>
    </main>
  );
}
