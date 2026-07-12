'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import {
  ExperienceButton,
  ExperienceCard,
  ExperienceHeader,
  ExperienceHero,
  ExperienceMiniLogo,
  ExperienceMockup,
  ExperienceSection,
  ExperienceShell
} from '@/shared/ui/experience';
import styles from './public-experience.module.sass';

const stages = [
  {
    label: 'Teoria',
    title: 'Nomeie a mudança que você quer produzir',
    body: 'Comece com a intenção: problema, público, hipótese central e horizonte de impacto.'
  },
  {
    label: 'Insumos',
    title: 'Mapeie os recursos que tornam a intervenção possível',
    body: 'Equipe, orçamento, dados e capacidades aparecem como matéria-prima da transformação.'
  },
  {
    label: 'Atividades',
    title: 'Transforme recursos em ação organizada',
    body: 'Registre os movimentos concretos que conectam planejamento e execução.'
  },
  {
    label: 'Produtos',
    title: 'Evidencie entregas e marcos verificáveis',
    body: 'Mostre o que foi produzido antes de declarar resultado.'
  },
  {
    label: 'Resultados',
    title: 'Leia as mudanças esperadas no público e no sistema',
    body: 'Finalize com uma narrativa visual que deixa relações, riscos e hipóteses legíveis.'
  }
];

const referenceGroups = [
  {
    title: 'Design de experiência',
    items: ['Apple HIG', 'Material Design 3', 'Motion for React', 'Resend feature pages']
  },
  {
    title: 'Arquitetura frontend',
    items: ['Next App Router', 'React 19 APIs', 'Server Components por padrão', 'Client Components isolados']
  },
  {
    title: 'Teoria da mudança',
    items: ['Cadeia causal', 'Riscos e hipóteses', 'Leitura por etapas', 'Relatório visual']
  }
];

export function HomeExperience() {
  return (
    <ExperienceShell>
      <ExperienceHeader active="/" />
      <ExperienceHero
        eyebrow="Construtor visual"
        title="Desenhe mudanças com a clareza de um fluxo vivo."
        lead="Uma experiência editorial para mapear etapas, conexões, riscos e hipóteses sem perder a lógica da intervenção."
        actions={[
          { label: 'Criar teoria', href: '/canvas', tone: 'primary' },
          { label: 'Ver exemplo', href: '/exemplos/resultado', tone: 'secondary' }
        ]}
        visual={<HomeProductMockup />}
        align="split"
      />
      <ExperienceSection
        eyebrow="Como o produto pensa"
        title="Da intenção ao resultado, cada decisão ganha forma."
        lead="O novo sistema visual abandona a interface antiga e organiza a aplicação em blocos claros, espaços generosos e fluxos guiados."
      >
        <div className={styles.featureGrid}>
          <ExperienceCard eyebrow="Fluxo" title="Etapas conectadas" description="Insumos, atividades, produtos e resultados aparecem como uma cadeia causal, não como uma lista solta." accent="white" />
          <ExperienceCard eyebrow="Leitura" title="Relatório visual" description="A tela de resultado passa a contar a história da teoria com preview, exportação e narrativa por conexões." accent="white" />
          <ExperienceCard eyebrow="Interação" title="Workspace dedicado" description="A visualização interativa fica em uma rota própria para zoom, foco, reset e leitura de riscos e hipóteses." accent="white" />
        </div>
      </ExperienceSection>
      <ExperienceSection eyebrow="Rotas públicas" title="Uma aplicação com a mesma assinatura visual." lead="Home, guia, exemplos, resultado e referências passam a usar o mesmo vocabulário de produto premium. O canvas vem por último.">
        <RouteCards />
      </ExperienceSection>
    </ExperienceShell>
  );
}

export function LearningGuideExperience() {
  return (
    <ExperienceShell>
      <ExperienceHeader active="/guia-de-aprendizado" />
      <ExperienceHero
        eyebrow="Guia guiado"
        title="Aprenda a construir uma Teoria da Mudança em camadas."
        lead="Uma linha do tempo inspirada em onboarding de produto: cada fase explica o que fazer, por que importa e qual saída observar."
        actions={[{ label: 'Começar no canvas', href: '/canvas', tone: 'primary' }, { label: 'Ver resultado pronto', href: '/exemplos/resultado', tone: 'secondary' }]}
      />
      <ExperienceSection eyebrow="Timeline" title="Um caminho de construção, não uma apostila." lead="Ao rolar, a etapa ativa ganha presença e mostra o papel dela na lógica causal.">
        <StageTimeline />
      </ExperienceSection>
    </ExperienceShell>
  );
}

export function ExamplesExperience() {
  return (
    <ExperienceShell>
      <ExperienceHeader active="/exemplos" />
      <ExperienceHero
        eyebrow="Exemplos"
        title="Veja como uma teoria completa deve se comportar."
        lead="Explore previews, conexões e leituras antes de criar sua própria versão no canvas."
        actions={[{ label: 'Abrir resultado exemplo', href: '/exemplos/resultado', tone: 'primary' }, { label: 'Criar do zero', href: '/canvas', tone: 'secondary' }]}
        visual={<ExamplesMockup />}
        align="split"
      />
      <ExperienceSection eyebrow="Biblioteca" title="Exemplos como produto, não vitrine estática." lead="Cada card apresenta contexto, estrutura e um próximo passo claro.">
        <div className={styles.exampleGrid}>
          <ExampleFeature title="Política educacional" href="/exemplos/resultado" description="Cadeia causal com dados, formação, entregas e mudança de acompanhamento." />
          <ExampleFeature title="Canvas interativo" href="/canvas" description="Abra o editor quando quiser montar sua própria teoria com drag, conexões e marcadores." />
        </div>
      </ExperienceSection>
    </ExperienceShell>
  );
}

export function ReferencesExperience() {
  return (
    <ExperienceShell>
      <ExperienceHeader active="/referencias" />
      <ExperienceHero
        eyebrow="Referências"
        title="O sistema visual agora tem uma bússola documentada."
        lead="As referências viram parte da aplicação: design, arquitetura e teoria da mudança organizados para orientar os próximos refinamentos."
        actions={[{ label: 'Ver guia', href: '/guia-de-aprendizado', tone: 'primary' }, { label: 'Ver exemplo', href: '/exemplos/resultado', tone: 'secondary' }]}
      />
      <ExperienceSection eyebrow="Base" title="Princípios para continuar refinando." lead="A rota de referências deixa explícito o que deve guiar as próximas telas, inclusive quando o canvas for redesenhado.">
        <div className={styles.referenceGrid}>
          {referenceGroups.map((group) => (
            <ExperienceCard key={group.title} title={group.title} accent="white">
              <ul className={styles.referenceList}>
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </ExperienceCard>
          ))}
        </div>
      </ExperienceSection>
      <ReferenceLinks />
    </ExperienceShell>
  );
}

function HomeProductMockup() {
  return (
    <ExperienceMockup className={styles.homeMockup}>
      <div className={styles.mockupHeader}>
        <ExperienceMiniLogo />
        <span>Fluxo causal</span>
      </div>
      <div className={styles.flowPreview}>
        <PreviewColumn title="Insumos" items={['Equipe', 'Dados', 'Orçamento']} />
        <PreviewColumn title="Atividades" items={['Formação', 'Acompanhamento']} />
        <PreviewColumn title="Produtos" items={['Oficinas', 'Planos']} />
        <PreviewColumn title="Resultados" items={['Melhoria']} />
      </div>
      <div className={styles.mockupFooter}>
        <span>7 conexões</span>
        <span>Riscos e hipóteses visíveis</span>
      </div>
    </ExperienceMockup>
  );
}

function ExamplesMockup() {
  return (
    <ExperienceMockup className={styles.examplesMockup}>
      <div className={styles.largePreviewCard}>
        <span>Resultado pronto</span>
        <strong>Nova teoria da mudança</strong>
        <p>Preview, leitura guiada, exportações e workspace interativo.</p>
      </div>
      <div className={styles.previewRail}>
        <span />
        <span />
        <span />
      </div>
    </ExperienceMockup>
  );
}

function PreviewColumn({ title, items }: { title: string; items: string[] }) {
  return (
    <div className={styles.previewColumn}>
      <strong>{title}</strong>
      {items.map((item) => (
        <span key={item}>{item}</span>
      ))}
    </div>
  );
}

function RouteCards() {
  const routes = [
    { title: 'Home', href: '/', description: 'Landing editorial com hero, mockup e CTAs.' },
    { title: 'Guia', href: '/guia-de-aprendizado', description: 'Timeline para aprender a lógica da teoria.' },
    { title: 'Exemplos', href: '/exemplos', description: 'Galeria de previews e rotas de exploração.' },
    { title: 'Resultado', href: '/exemplos/resultado', description: 'Relatório visual com preview e exportações.' },
    { title: 'Referências', href: '/referencias', description: 'Princípios e padrões de evolução visual.' }
  ];

  return (
    <div className={styles.routeGrid}>
      {routes.map((route) => (
        <Link key={route.href} href={route.href} className={styles.routeCard}>
          <span>{route.title}</span>
          <p>{route.description}</p>
        </Link>
      ))}
    </div>
  );
}

function StageTimeline() {
  const reducedMotion = useReducedMotion();
  return (
    <div className={styles.timeline}>
      {stages.map((stage, index) => (
        <motion.article
          key={stage.label}
          className={styles.timelineStep}
          initial={reducedMotion ? false : { opacity: 0, y: 28 }}
          whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-18% 0px' }}
          transition={{ duration: .58, delay: index * .04, ease: [.22, 1, .36, 1] }}
        >
          <div className={styles.timelineMarker}>{String(index + 1).padStart(2, '0')}</div>
          <div className={styles.timelineCard}>
            <span>{stage.label}</span>
            <h3>{stage.title}</h3>
            <p>{stage.body}</p>
          </div>
        </motion.article>
      ))}
    </div>
  );
}

function ExampleFeature({ title, href, description }: { title: string; href: string; description: string }) {
  return (
    <Link href={href} className={styles.exampleFeature}>
      <div className={styles.exampleVisual}>
        <span />
        <span />
        <span />
      </div>
      <strong>{title}</strong>
      <p>{description}</p>
    </Link>
  );
}

function ReferenceLinks() {
  const links = [
    ['Apple HIG', 'https://developer.apple.com/design/human-interface-guidelines'],
    ['Material 3', 'https://m3.material.io/'],
    ['Motion React', 'https://motion.dev/examples?platform=react'],
    ['Next App Router', 'https://nextjs.org/docs/app/getting-started/layouts-and-pages'],
    ['React APIs', 'https://react.dev/reference/react/apis']
  ];

  return (
    <ExperienceSection eyebrow="Links" title="Referências vivas do novo DS." lead="A documentação interna resume as decisões, mas os links oficiais seguem como norte para os refinamentos.">
      <div className={styles.referenceLinks}>
        {links.map(([label, href]) => (
          <a key={href} href={href} target="_blank" rel="noreferrer">
            {label}
            <span>↗</span>
          </a>
        ))}
      </div>
    </ExperienceSection>
  );
}
