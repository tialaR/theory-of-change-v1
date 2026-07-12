'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { exampleTheory } from '../../data/example-theory';
import { TDM_STAGE_DESCRIPTIONS } from '../../domain/tdm-stages';
import { getEdgeBadges } from '../result-view/experience/result-experience-data';

function collectDescendants(nodeId: string, edges: typeof exampleTheory.edges, ids: Set<string>) {
  ids.add(nodeId);
  for (const edge of edges) {
    if (edge.source === nodeId && !ids.has(edge.target)) {
      collectDescendants(edge.target, edges, ids);
    }
  }
}

function collectAncestors(nodeId: string, edges: typeof exampleTheory.edges, ids: Set<string>) {
  ids.add(nodeId);
  for (const edge of edges) {
    if (edge.target === nodeId && !ids.has(edge.source)) {
      collectAncestors(edge.source, edges, ids);
    }
  }
}

function getFlowRelationSet(nodeId: string | null, edges: typeof exampleTheory.edges) {
  if (!nodeId) return new Set<string>();
  const ids = new Set<string>();
  collectDescendants(nodeId, edges, ids);
  collectAncestors(nodeId, edges, ids);
  return ids;
}
import {
  PublicButton,
  PublicCard,
  PublicCodePanel,
  PublicFooter,
  PublicHeader,
  PublicHero,
  PublicHomeOrb,
  PublicReveal,
  PublicSection,
  PublicShell,
  PublicTimeline
} from '@/shared/ui/lusion-resend-ds';
import { TheoryFlowBoard } from './theory-flow-board';
import styles from './public-pages.module.sass';

const GUIDE_STEPS = [
  { number: 'Passo 1', title: 'Entenda a mudança', text: 'Nomeie o problema e o resultado desejado antes de preencher o fluxo.', visual: 'Problema → resultado' },
  { number: 'Passo 2', title: 'Levante insumos', text: TDM_STAGE_DESCRIPTIONS.input, visual: 'Equipe, orçamento, dados' },
  { number: 'Passo 3', title: 'Organize atividades', text: TDM_STAGE_DESCRIPTIONS.activity, visual: 'Formação e acompanhamento' },
  { number: 'Passo 4', title: 'Defina produtos', text: TDM_STAGE_DESCRIPTIONS.output, visual: 'Oficinas e planos' },
  { number: 'Passo 5', title: 'Descreva resultados', text: TDM_STAGE_DESCRIPTIONS.outcome, visual: 'Mudança observável' },
  { number: 'Passo 6', title: 'Conecte relações', text: 'Marque riscos e hipóteses nas setas que sustentam a lógica causal.', visual: 'R / H nas conexões' },
  { number: 'Passo 7', title: 'Leia a teoria final', text: 'Revise o fluxo completo e compartilhe a narrativa com a equipe.', visual: 'Relatório visual' }
];

export function HomePage() {
  const [selectedId, setSelectedId] = useState<string | null>(exampleTheory.nodes[0]?.id ?? null);

  return (
    <PublicShell>
      <PublicHeader />
      <PublicHero
        visual={<PublicHomeOrb />}
        kicker="Teoria da Mudança"
        title="Desenhe a mudança antes de explicá-la."
        description="Um espaço visual para transformar problema, etapas, conexões, riscos e hipóteses em narrativa clara."
        actions={
          <>
            <PublicButton href="/canvas">Criar teoria</PublicButton>
            <PublicButton href="/exemplos/resultado" variant="ghost">
              Ver exemplo
            </PublicButton>
          </>
        }
      />
      <PublicSection
        eyebrow="Por que usar"
        title="Leia o caminho da intervenção."
        description="Organize etapas, evidencie relações e apresente decisões com clareza visual."
      >
        <div className={styles.homeFeatures}>
          {[
            ['01', 'Organizar etapas', 'Agrupe insumos, atividades, produtos e resultados em sequência legível.'],
            ['02', 'Evidenciar relações', 'Mostre conexões, riscos e hipóteses que sustentam o fluxo.'],
            ['03', 'Apresentar decisão', 'Transforme a teoria em relatório visual, não em documento seco.']
          ].map(([num, title, text], i) => (
            <PublicReveal key={title} delay={i * 0.05}>
              <PublicCard className={styles.homeFeatureCard}>
                <span>{num}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </PublicCard>
            </PublicReveal>
          ))}
        </div>
      </PublicSection>
      <PublicSection
        compact
        eyebrow="Prévia"
        title="Clique em um card e acompanhe o caminho."
        description="Espelho reduzido da visualização interativa — relacionados ganham foco, demais recuam."
      >
        <div className={styles.resultPreview}>
          <TheoryFlowBoard
            nodes={exampleTheory.nodes}
            edges={exampleTheory.edges}
            mode="preview"
            selectedNodeId={selectedId}
            onSelectNode={setSelectedId}
          />
        </div>
      </PublicSection>
      <PublicFooter />
    </PublicShell>
  );
}

export function GuidePage() {
  return (
    <PublicShell>
      <PublicHeader />
      <PublicHero
        compact
        kicker="Guia de aprendizado"
        title="Construa a teoria etapa por etapa."
        description="Cada passo revela uma fase do processo com texto curto e contexto visual."
        actions={<PublicButton href="/canvas">Abrir canvas</PublicButton>}
      />
      <PublicTimeline steps={GUIDE_STEPS} />
      <PublicFooter />
    </PublicShell>
  );
}

export function ExamplesPage() {
  return (
    <PublicShell>
      <PublicHeader />
      <PublicHero
        compact
        visual={<PublicHomeOrb />}
        kicker="Exemplos"
        title="Explore uma teoria pronta."
        description="Abra o relatório, navegue pela visualização interativa ou vá direto ao canvas."
        actions={<PublicButton href="/exemplos/resultado">Ver resultado</PublicButton>}
      />
      <PublicSection compact title="Rotas principais" description="Cada card tem uma função clara no produto.">
        <div className={styles.galleryGrid}>
          {[
            ['01', 'Resultado conectado', 'Relatório com prévia, conexões e exportação.', '/exemplos/resultado'],
            ['02', 'Visualização interativa', 'Clique em cards, foque relações e leia R/H.', '/exemplos/resultado/interativo'],
            ['03', 'Criar teoria', 'Editor principal para montar sua própria teoria.', '/canvas']
          ].map(([num, title, text, href], i) => (
            <PublicReveal key={title} delay={i * 0.05}>
              <Link href={href} className={styles.galleryCard}>
                <span>{num}</span>
                <h3>{title}</h3>
                <p>{text}</p>
                <em>Abrir →</em>
                {href === '/exemplos/resultado' ? (
                  <div className={styles.galleryPreview}>
                    <TheoryFlowBoard
                      nodes={exampleTheory.nodes}
                      edges={exampleTheory.edges}
                      mode="preview"
                    />
                  </div>
                ) : null}
              </Link>
            </PublicReveal>
          ))}
        </div>
      </PublicSection>
      <PublicFooter />
    </PublicShell>
  );
}

export function ResultPage() {
  const [selectedId, setSelectedId] = useState<string | null>(exampleTheory.nodes[0]?.id ?? null);

  return (
    <PublicShell>
      <PublicHeader />
      <PublicHero
        compact
        kicker="Resultado"
        title="Leitura executiva com prévia viva."
        description="Contexto à esquerda, fluxo compacto à direita. A exploração completa fica na rota interativa."
      />
      <div className={styles.resultLayout}>
        <PublicReveal>
          <div className={styles.resultContext}>
            <p className={styles.inspectorKicker}>Exemplo</p>
            <h3>{exampleTheory.title}</h3>
            <p>
              Política educacional com formação de professores, acompanhamento nas escolas e melhoria
              no uso de dados. Clique nos cards da prévia para ver relações.
            </p>
            <PublicButton href="/exemplos/resultado/interativo">Abrir visualização interativa</PublicButton>
          </div>
        </PublicReveal>
        <PublicReveal delay={0.05}>
          <div className={styles.resultPreview}>
            <TheoryFlowBoard
              nodes={exampleTheory.nodes}
              edges={exampleTheory.edges}
              mode="preview"
              selectedNodeId={selectedId}
              onSelectNode={setSelectedId}
            />
          </div>
        </PublicReveal>
      </div>
      <div className={styles.exportBar}>
        {['PDF', 'PNG', 'SVG'].map((format) => (
          <button key={format} type="button">
            Exportar {format}
          </button>
        ))}
      </div>
      <PublicSection
        compact
        eyebrow="Relações causais"
        title="O que cada seta está dizendo."
        description="Origem, destino e atenção em risco ou hipótese."
      >
        <div className={styles.relationGrid}>
          {exampleTheory.edges.map((edge, index) => {
            const source = exampleTheory.nodes.find((n) => n.id === edge.source);
            const target = exampleTheory.nodes.find((n) => n.id === edge.target);
            const badges = getEdgeBadges(edge);
            const badgeLabel = badges.map((b) => b.label).join('/');
            return (
              <PublicReveal key={edge.id} delay={index * 0.03}>
                <PublicCard className={styles.relationCard}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <h3>
                    {source?.title} → {target?.title}
                  </h3>
                  <p>
                    {badges.length
                      ? badges[0].text
                      : 'Relação causal direta entre etapas do fluxo.'}
                  </p>
                  {badgeLabel ? <em>{badgeLabel}</em> : null}
                </PublicCard>
              </PublicReveal>
            );
          })}
        </div>
      </PublicSection>
      <PublicFooter />
    </PublicShell>
  );
}

export function InteractivePage() {
  const [selectedId, setSelectedId] = useState<string | null>(exampleTheory.nodes[0]?.id ?? null);
  const [zoom, setZoom] = useState(1);
  const reduced = useReducedMotion();
  const related = useMemo(
    () => getFlowRelationSet(selectedId, exampleTheory.edges),
    [selectedId]
  );
  const selectedNode = exampleTheory.nodes.find((n) => n.id === selectedId);

  useEffect(() => {
    document.body.classList.add('public-page-scroll');
    return () => document.body.classList.remove('public-page-scroll');
  }, []);

  const resetView = () => {
    setZoom(1);
    setSelectedId(exampleTheory.nodes[0]?.id ?? null);
  };

  return (
    <div data-public-page="true" className={styles.interactiveShell}>
      <header className={styles.interactiveTopbar}>
        <Link href="/exemplos/resultado" className={styles.interactiveBrand}>
          <span aria-hidden="true" />
          <strong>{exampleTheory.title}</strong>
        </Link>
        <div className={styles.interactiveControls}>
          <button
            type="button"
            className={styles.toolBtn}
            aria-label="Aumentar zoom"
            onClick={() => setZoom((z) => Math.min(1.4, Number((z + 0.1).toFixed(2))))}
          >
            +
          </button>
          <span className={styles.zoomLabel}>{Math.round(zoom * 100)}%</span>
          <button
            type="button"
            className={styles.toolBtn}
            aria-label="Diminuir zoom"
            onClick={() => setZoom((z) => Math.max(0.7, Number((z - 0.1).toFixed(2))))}
          >
            −
          </button>
          <button type="button" className={styles.toolBtn} onClick={() => setZoom(1)}>
            Centralizar
          </button>
          <button type="button" className={styles.toolBtn} onClick={resetView}>
            Reiniciar
          </button>
          <Link href="/exemplos/resultado" className={styles.closeLink}>
            Fechar
          </Link>
        </div>
      </header>
      <motion.div
        className={styles.interactiveMain}
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reduced ? 0.01 : 0.4 }}
      >
        <div className={styles.interactiveViewport}>
          <TheoryFlowBoard
            nodes={exampleTheory.nodes}
            edges={exampleTheory.edges}
            mode="interactive"
            selectedNodeId={selectedId}
            onSelectNode={setSelectedId}
            zoom={zoom}
          />
        </div>
        <aside className={styles.inspector}>
          <p className={styles.inspectorKicker}>Explorar conexões</p>
          <h2>{selectedNode?.title ?? 'Selecione um card'}</h2>
          <p>
            {selectedNode?.description ??
              'Clique em qualquer card para destacar relações e reduzir o peso visual do restante.'}
          </p>
          <div className={styles.legend}>
            <span>
              <b>R</b> Risco
            </span>
            <span>
              <b>H</b> Hipótese
            </span>
            <span>{selectedId ? `${Math.max(0, related.size - 1)} relacionados` : 'Sem filtro'}</span>
          </div>
        </aside>
      </motion.div>
    </div>
  );
}

export function ReferencesPage() {
  return (
    <PublicShell>
      <PublicHeader />
      <PublicHero
        compact
        kicker="Referências"
        title="Base visual e técnica."
        description="Organize as referências por uso: experiência, arquitetura e lógica da Teoria da Mudança."
        actions={<PublicButton href="/guia-de-aprendizado">Ver guia</PublicButton>}
      />
      <PublicSection compact title="Biblioteca" description="Cada bloco explica por que aquela base existe no produto.">
        <div className={styles.refGrid}>
          {[
            ['Design', 'Experiência dark, header fino, hero editorial, grade sutil e cards com presença.', '/docs/visual-experience-guidelines.md'],
            ['Arquitetura Frontend', 'Rotas públicas isoladas do canvas, DS independente e feature scoped.', '/docs/frontend-architecture-guidelines.md'],
            ['Teoria da Mudança', 'Etapas, conexões, riscos e hipóteses como núcleo da lógica de negócio.', '/guia-de-aprendizado'],
            ['Inspirações Visuais', 'Home cinematográfica e rotas internas com scroll narrativo e motion suave.', '/']
          ].map(([title, text, href], i) => (
            <PublicReveal key={title} delay={i * 0.04}>
              <PublicCard className={styles.refCard}>
                <h3>{title}</h3>
                <p>{text}</p>
                <Link href={href}>Abrir →</Link>
              </PublicCard>
            </PublicReveal>
          ))}
        </div>
      </PublicSection>
      <PublicSection compact>
        <PublicCodePanel
          title="Estrutura pública"
          code={`rotasPublicas = [
  "/",
  "/guia-de-aprendizado",
  "/exemplos",
  "/exemplos/resultado",
  "/exemplos/resultado/interativo",
  "/referencias"
]

// /canvas preservado — migrado por último`}
        />
      </PublicSection>
      <PublicFooter />
    </PublicShell>
  );
}
