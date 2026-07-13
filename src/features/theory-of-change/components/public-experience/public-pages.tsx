'use client';

import {
  RxButton,
  RxCardGrid,
  RxFooter,
  RxHeader,
  RxHero,
  RxHeroPanel,
  RxReveal,
  RxSection,
  RxShell,
  RxTimeline
} from '@/shared/ui/resend-experience';
import styles from './public-pages.module.sass';

const features = [
  { index: '01', title: 'Organize a lógica', text: 'Transforme recursos, ações, entregas e mudanças em uma narrativa visual sem ruído.' },
  { index: '02', title: 'Leia conexões', text: 'Visualize relações causais, riscos e hipóteses com foco e estados claros.' },
  { index: '03', title: 'Compartilhe o resultado', text: 'Exporte relatórios, imagens e mapas da teoria sem voltar para o canvas.' }
];

const guide = [
  { label: '01', title: 'Teoria', text: 'Comece pela intenção de mudança. Dê nome, contexto e limite para a intervenção antes de abrir o canvas.' },
  { label: '02', title: 'Insumos', text: 'Mapeie recursos, pessoas, dados e estruturas que permitem a execução.' },
  { label: '03', title: 'Atividades', text: 'Converta insumos em ações observáveis, responsáveis e acompanháveis.' },
  { label: '04', title: 'Produtos', text: 'Defina entregas concretas que provam que as atividades aconteceram.' },
  { label: '05', title: 'Resultados', text: 'Descreva a mudança esperada na prática, não apenas uma métrica solta.' },
  { label: '06', title: 'Conexões', text: 'Conecte cada etapa com setas causais. Riscos e hipóteses aparecem nos pontos frágeis.' }
];

function AutomationVisual() {
  return (
    <RxHeroPanel>
      <div className={styles.automationVisual}>
        <div className={styles.flowColumn}>
          <article className={styles.flowNode}><span className={styles.nodeLabel}>Evento</span><p className={styles.nodeTitle}>Diagnóstico criado</p></article>
          <article className={styles.flowNode}><span className={styles.nodeLabel}>Dados</span><p className={styles.nodeTitle}>Equipe e orçamento</p></article>
        </div>
        <div className={styles.connector}><span className={styles.connectorLine} /></div>
        <div className={styles.flowColumn}>
          <article className={styles.flowNode}><span className={styles.nodeLabel}>Fluxo</span><p className={styles.nodeTitle}>Atividades → Produtos</p></article>
          <article className={styles.flowNode}><span className={styles.nodeLabel}>Leitura</span><p className={styles.nodeTitle}>Resultados conectados</p></article>
        </div>
      </div>
    </RxHeroPanel>
  );
}

export function PublicHomePage() {
  return (
    <RxShell>
      <RxHeader />
      <RxHero
        eyebrow="Teoria da mudança"
        title={<>Build your change logic.</>}
        copy="Uma experiência visual para mapear intervenção, conectar relações causais e transformar o resultado em uma leitura clara."
        actions={<><RxButton href="/canvas">Criar teoria</RxButton><RxButton href="/guia-de-aprendizado" variant="ghost">Ver guia</RxButton></>}
        visual={<AutomationVisual />}
      />
      <RxSection eyebrow="Produto" title="Do plano ao fluxo." copy="A experiência pública deixa de ser uma vitrine estática e passa a explicar a teoria como produto: contexto, fluxo, leitura e exportação.">
        <RxCardGrid items={features} />
      </RxSection>
      <RxFooter />
    </RxShell>
  );
}

export function LearningGuidePage() {
  return (
    <RxShell>
      <RxHeader />
      <RxHero
        eyebrow="Onboarding"
        title={<>Learn the flow before drawing.</>}
        copy="Uma timeline de construção para entender cada fase antes de abrir o canvas."
        actions={<><RxButton href="/canvas">Começar no canvas</RxButton><RxButton href="/exemplos/resultado" variant="ghost">Ver resultado</RxButton></>}
        visual={<AutomationVisual />}
      />
      <RxSection eyebrow="Etapas" title="Uma linha do tempo causal." copy="O usuário percorre as fases como um produto guiado, com contexto visual forte e revelações por scroll.">
        <RxTimeline items={guide} />
      </RxSection>
      <RxFooter />
    </RxShell>
  );
}

export function ExamplesPage() {
  return (
    <RxShell>
      <RxHeader />
      <RxHero
        eyebrow="Exemplos"
        title={<>Explore before creating.</>}
        copy="Veja uma teoria completa como fluxo, relatório e visualização interativa antes de montar a sua."
        actions={<><RxButton href="/exemplos/resultado">Resultado exemplo</RxButton><RxButton href="/exemplos/canvas" variant="ghost">Canvas exemplo</RxButton></>}
        visual={<AutomationVisual />}
      />
      <RxSection eyebrow="Modos" title="Um exemplo, três leituras." copy="O mesmo conteúdo aparece como preview, relatório e workspace interativo dedicado.">
        <RxCardGrid items={[
          { index: 'Preview', title: 'Resumo visual', text: 'Miniatura com colunas e conexões para orientar a leitura sem ocupar a tela inteira.' },
          { index: 'Interativo', title: 'Relações focadas', text: 'Clique em cartões, destaque relacionados e desative o que não faz parte da cadeia.' },
          { index: 'Relatório', title: 'Narrativa exportável', text: 'Blocos de contexto para explicar o que cada etapa e conexão significam.' }
        ]} />
      </RxSection>
      <RxFooter />
    </RxShell>
  );
}

export function ReferencesPage() {
  return (
    <RxShell>
      <RxHeader />
      <RxHero
        eyebrow="Referências"
        title={<>Design and method references.</>}
        copy="A aplicação passa a seguir uma linguagem de produto, com fundamentos de Teoria da Mudança, HIG, Material, Motion e App Router."
        actions={<><RxButton href="/guia-de-aprendizado">Guia</RxButton><RxButton href="/exemplos" variant="ghost">Exemplos</RxButton></>}
        visual={<div className={styles.codePanel}>{Array.from({ length: 18 }).map((_, index) => <span key={index} className={styles.codeLine} />)}</div>}
      />
      <section className={styles.referenceLayout}>
        <nav className={styles.referenceRail} aria-label="Referências">
          <a href="#design">Design</a>
          <a href="#frontend">Frontend</a>
          <a href="#metodo">Método</a>
          <a href="#motion">Motion</a>
        </nav>
        <div className={styles.referenceContent}>
          {[
            ['design', 'Design system', 'A experiência usa contraste, respiro, foco e motion funcional como base. Glass é material, não decoração em massa.'],
            ['frontend', 'Arquitetura frontend', 'Rotas públicas seguem componentes compartilhados, App Router e Client Components isolados para interações.'],
            ['metodo', 'Teoria da Mudança', 'Insumos, atividades, produtos, resultados, riscos e hipóteses continuam intactos como lógica do produto.'],
            ['motion', 'Motion', 'Reveals por scroll, microinterações e estados de foco usam transform e opacity, sem layout shift.']
          ].map(([id, title, text]) => (
            <RxReveal key={id} className={styles.referenceBlock}>
              <h2 id={id}>{title}</h2>
              <p>{text}</p>
            </RxReveal>
          ))}
        </div>
      </section>
      <RxFooter />
    </RxShell>
  );
}
