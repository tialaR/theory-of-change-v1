import { ExampleOverviewCard } from '@/features/theory-of-change/components/example-overview-card';
import {
  DedicatedExamplePreview
} from './public-page-dependencies';
import {
  PublicFooter,
  PublicHeader,
  PublicHero,
  PublicReveal,
  PublicSection,
  PublicShell
} from '@/shared/ui/tdm-public-layout';
import { ContextLabelNetworkIcon, ContextLabelWorkflowIcon } from '@/shared/ui/tdm-context-label';
import { TdmKicker } from '@/shared/ui/tdm-kicker';
import { TdmPublicFeatureCard } from '@/shared/ui/tdm-public-feature-card';
import { TdmSurface } from '@/shared/ui/tdm-surface';
import { FLOW_CONTEXT_CARDS } from './public-page-data';
import styles from './public-pages.module.sass';

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
