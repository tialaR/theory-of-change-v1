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
  PublicCodePanel,
  PublicFooter,
  PublicHeader,
  PublicHero,
  PublicReveal,
  PublicSection,
  PublicShell,
  PublicTimeline
} from '@/shared/ui/lusion-resend-ds';
import { ExampleOverviewCard } from '@/features/theory-of-change/components/example-overview-card';
import { ExamplePreviewsSection, DedicatedExamplePreview } from '@/features/theory-of-change/components/resend-public/example-previews';
import { PublicIconButton } from '@/shared/ui/public-icon-button';
import {
  ContextLabelBookOpenIcon,
  ContextLabelEyeIcon,
  ContextLabelFileTextIcon,
  ContextLabelGitBranchIcon,
  ContextLabelLayoutGridIcon,
  ContextLabelLibraryIcon,
  ContextLabelNetworkIcon,
  ContextLabelSparklesIcon,
  ContextLabelWorkflowIcon
} from '@/shared/ui/tdm-context-label';
import { TdmKicker } from '@/shared/ui/tdm-kicker';
import { TdmPublicFeatureCard } from '@/shared/ui/tdm-public-feature-card';
import { TdmSurface } from '@/shared/ui/tdm-surface/tdm-surface';
import { HomeOnboardingPreview } from './home-onboarding-preview';
import { HomeBrandLogo } from './home-brand-logo';
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

const FLOW_CONTEXT_CARDS = [
  {
    number: '01',
    title: 'Insumos iniciam o caminho',
    text: 'Recursos e capacidades entram primeiro para sustentar as ações da intervenção.'
  },
  {
    number: '02',
    title: 'Atividades transformam recursos',
    text: 'As ações organizam o uso dos insumos e aproximam a teoria dos produtos.'
  },
  {
    number: '03',
    title: 'Produtos registram entregas',
    text: 'As entregas concretas mostram o que foi realizado antes dos resultados.'
  },
  {
    number: '04',
    title: 'Resultados fecham a leitura',
    text: 'As mudanças esperadas aparecem como efeito do caminho construído pelas etapas.'
  }
] as const;

function CtaChevronIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="m6 3.5 4.5 4.5L6 12.5" />
    </svg>
  );
}

export function HomePage() {
  return (
    <PublicShell sectionRhythm>
      <PublicHeader ctaLabel="Começar agora" ctaTrailingIcon={<CtaChevronIcon />} />
      <PublicHero
        visual={<HomeBrandLogo variant="hero" />}
        title="Desenhe a mudança antes de explicá-la."
        description="Um espaço visual para transformar problema, etapas, conexões, riscos e hipóteses em narrativa clara."
        actions={
          <>
            <PublicButton
              href="/canvas"
              variant="primary"
              size="hero"
              trailingIcon={<CtaChevronIcon />}
            >
              Começar agora
            </PublicButton>
            <PublicButton href="/exemplos/resultado" variant="text">
              Ver exemplo
            </PublicButton>

          </>
        }
      />
      <PublicSection
        eyebrow={
          <TdmKicker icon={ContextLabelSparklesIcon}>
            Por que usar
          </TdmKicker>
        }
        title="Leia o caminho da intervenção."
        description="Organize etapas, evidencie relações e apresente decisões com clareza visual."
      >
        <div className={styles.homeFeatures}>
          {[
            ['01', 'Organizar etapas', 'Agrupe insumos, atividades, produtos e resultados em sequência legível.'],
            ['02', 'Evidenciar relações', 'Mostre conexões, riscos e hipóteses que sustentam o fluxo.'],
            ['03', 'Apresentar decisão', 'Transforme a teoria em relatório visual, não em documento seco.']
          ].map(([num, title, text], i) => (
            <PublicReveal key={title} delay={i * 0.05} className={styles.featureCardReveal}>
              <TdmPublicFeatureCard
                eyebrow={num}
                title={title}
                description={text}
                size="compact"
                interactive
              />
            </PublicReveal>
          ))}
        </div>
      </PublicSection>
      <PublicSection
        compact
        eyebrow={
          <TdmKicker icon={ContextLabelEyeIcon}>
            PRÉVIA GUIADA
          </TdmKicker>
        }
        title="Veja a teoria ganhar forma."
      >
        <div className={styles.resultPreview}>
          <HomeOnboardingPreview density="embedded" />
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
        kicker={
          <TdmKicker icon={ContextLabelBookOpenIcon}>
            Guia de aprendizado
          </TdmKicker>
        }
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
    <PublicShell headerContentGap sectionRhythm>
      <PublicHeader />
      <PublicHero
        compact
        kicker={
          <TdmKicker icon={ContextLabelLayoutGridIcon}>
            EXEMPLOS
          </TdmKicker>
        }
        title="Explore exemplos guiados."
        description="Veja prévias animadas da teoria antes de abrir a experiência completa."
        actions={<PublicButton href="#examples-experiences">Ver exemplos</PublicButton>}
      />
      <div id="examples-experiences" data-public-chapter="true">
        <ExamplePreviewsSection />
      </div>
      <PublicFooter />
    </PublicShell>
  );
}

export function FlowPage() {
  return (
    <PublicShell headerContentGap sectionRhythm>
      <PublicHeader />
      <PublicHero
        compact
        kicker={
          <TdmKicker icon={ContextLabelWorkflowIcon}>
            Fluxo
          </TdmKicker>
        }
        title="Visão do fluxo com prévia viva."
        description="Entenda como insumos, atividades, produtos e resultados se conectam antes de abrir a experiência completa."
      />
      <div className={styles.resultLayout} data-public-chapter="true">
        <PublicReveal>
          <ExampleOverviewCard
            eyebrow="Exemplo"
            title="Rascunho da teoria de mudança"
            description="Veja como insumos, atividades, produtos e resultados se organizam em uma sequência causal antes da leitura final."
            primaryHref="/exemplos/visao-do-fluxo/interativo"
            primaryLabel="Abrir experiência interativa"
          />
        </PublicReveal>
        <PublicReveal delay={0.05}>
          <TdmSurface as="div" variant="base" padding="none" radius="lg" className={styles.resultPreview}>
            <DedicatedExamplePreview type="flow" />
          </TdmSurface>
        </PublicReveal>
      </div>
      <PublicSection
        compact
        eyebrow={
          <TdmKicker icon={ContextLabelNetworkIcon}>
            Visão do fluxo
          </TdmKicker>
        }
        title="O caminho antes da leitura final."
        description="A prévia mostra como cada etapa alimenta a próxima, revelando a lógica causal em construção."
      >
        <div className={styles.relationGrid}>
          {FLOW_CONTEXT_CARDS.map((card, index) => (
            <PublicReveal key={card.number} delay={index * 0.03} className={styles.featureCardReveal}>
              <TdmPublicFeatureCard
                eyebrow={card.number}
                title={card.title}
                description={card.text}
                size="compact"
                interactive
              />
            </PublicReveal>
          ))}
        </div>
      </PublicSection>
      <PublicFooter />
    </PublicShell>
  );
}

export function ResultPage() {
  return (
    <PublicShell headerContentGap sectionRhythm>
      <PublicHeader />
      <PublicHero
        compact
        kicker={
          <TdmKicker icon={ContextLabelFileTextIcon}>
            Resultado
          </TdmKicker>
        }
        title="Leitura executiva com prévia viva."
        description="Contexto à esquerda, prévia abstrata à direita. A exploração completa fica na rota interativa."
      />
      <div className={styles.resultChapter} data-public-chapter="true">
        <div className={styles.resultLayout}>
          <PublicReveal>
            <ExampleOverviewCard
              eyebrow="Exemplo"
              title={exampleTheory.title}
              description="Política educacional com formação de professores, acompanhamento nas escolas e melhoria no uso de dados. A prévia resume a estrutura conectada antes da leitura interativa."
              primaryHref="/exemplos/resultado/interativo"
              primaryLabel="Abrir visualização interativa"
            />
          </PublicReveal>
          <PublicReveal delay={0.05}>
            <TdmSurface as="div" variant="base" padding="none" radius="lg" className={styles.resultPreview}>
              <DedicatedExamplePreview type="result" />
            </TdmSurface>
          </PublicReveal>
        </div>
      </div>
      <PublicSection
        compact
        eyebrow={
          <TdmKicker icon={ContextLabelGitBranchIcon}>
            Relações causais
          </TdmKicker>
        }
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
              <PublicReveal key={edge.id} delay={index * 0.03} className={styles.featureCardReveal}>
                <TdmPublicFeatureCard
                  eyebrow={String(index + 1).padStart(2, '0')}
                  title={`${source?.title} → ${target?.title}`}
                  description={
                    badges.length
                      ? badges[0].text
                      : 'Relação causal direta entre etapas do fluxo.'
                  }
                  badge={badgeLabel || undefined}
                  size="compact"
                  interactive
                />
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
        <Link href="/exemplos/visao-do-fluxo" className={styles.interactiveBrand}>
          <span aria-hidden="true" />
          <strong>{exampleTheory.title}</strong>
        </Link>
        <div className={styles.interactiveControls}>
          <PublicIconButton
            aria-label="Aumentar zoom"
            onClick={() => setZoom((z) => Math.min(1.4, Number((z + 0.1).toFixed(2))))}
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M8 3.25v9.5M3.25 8h9.5" />
            </svg>
          </PublicIconButton>
          <span className={styles.zoomLabel}>{Math.round(zoom * 100)}%</span>
          <PublicIconButton
            aria-label="Diminuir zoom"
            onClick={() => setZoom((z) => Math.max(0.7, Number((z - 0.1).toFixed(2))))}
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M3.25 8h9.5" />
            </svg>
          </PublicIconButton>
          <PublicButton type="button" variant="text" onClick={() => setZoom(1)}>
            Centralizar
          </PublicButton>
          <PublicButton type="button" variant="text" onClick={resetView}>
            Reiniciar
          </PublicButton>
          <PublicButton href="/exemplos/visao-do-fluxo" variant="text">
            Fechar
          </PublicButton>
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
    <PublicShell headerContentGap sectionRhythm>
      <PublicHeader />
      <PublicHero
        compact
        kicker={
          <TdmKicker icon={ContextLabelLibraryIcon}>
            Referências
          </TdmKicker>
        }
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
            <PublicReveal key={title} delay={i * 0.04} className={styles.featureCardReveal}>
              <TdmPublicFeatureCard
                title={title}
                description={text}
                actionLabel="Abrir →"
                href={href}
                size="compact"
              />
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
  "/exemplos/visao-do-fluxo",
  "/exemplos/visao-do-fluxo/interativo",
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
