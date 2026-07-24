import { ExampleOverviewCard } from '@/features/theory-of-change/components/example-overview-card';
import { DedicatedExamplePreview } from './public-page-dependencies';
import { getEdgeBadges } from '@/features/theory-of-change/components/result-view/experience/result-experience-data';
import { exampleTheory } from '@/features/theory-of-change/data/example-theory';
import {
  PublicFooter,
  PublicHeader,
  PublicHero,
  PublicReveal,
  PublicSection,
  PublicShell
} from '@/shared/ui/tdm-public-layout';
import { ContextLabelFileTextIcon, ContextLabelGitBranchIcon } from '@/shared/ui/tdm-context-label';
import { TdmKicker } from '@/shared/ui/tdm-kicker';
import { TdmPublicFeatureCard } from '@/shared/ui/tdm-public-feature-card';
import { TdmSurface } from '@/shared/ui/tdm-surface';
import styles from './public-pages.module.sass';

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
            const source = exampleTheory.nodes.find((node) => node.id === edge.source);
            const target = exampleTheory.nodes.find((node) => node.id === edge.target);
            const badges = getEdgeBadges(edge);
            const badgeLabel = badges.map((badge) => badge.label).join('/');
            const description = badges.length
              ? badges[0].text
              : 'Relação causal direta entre etapas do fluxo.';

            return (
              <PublicReveal key={edge.id} delay={index * 0.03} className={styles.featureCardReveal}>
                <TdmPublicFeatureCard
                  eyebrow={String(index + 1).padStart(2, '0')}
                  title={`${source?.title} → ${target?.title}`}
                  description={description}
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
