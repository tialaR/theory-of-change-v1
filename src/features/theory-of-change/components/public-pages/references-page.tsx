import {
  PublicCodePanel,
  PublicFooter,
  PublicHeader,
  PublicHero,
  PublicReveal,
  PublicSection,
  PublicShell
} from '@/shared/ui/tdm-public-layout';
import { ContextLabelLibraryIcon } from '@/shared/ui/tdm-context-label';
import { TdmButton } from '@/shared/ui/tdm-button';
import { TdmBookIcon } from '@/shared/ui/tdm-icons';
import { TdmKicker } from '@/shared/ui/tdm-kicker';
import { TdmPublicFeatureCard } from '@/shared/ui/tdm-public-feature-card';
import { REFERENCE_CARDS } from './public-page-data';
import styles from './public-pages.module.sass';

const PUBLIC_ROUTE_STRUCTURE = `rotasPublicas = [
  "/",
  "/guia-de-aprendizado",
  "/exemplos",
  "/exemplos/visao-do-fluxo",
  "/exemplos/visao-do-fluxo/interativo",
  "/exemplos/resultado",
  "/exemplos/resultado/interativo",
  "/referencias"
]

// /canvas preservado — migrado por último`;

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
        actions={
          <TdmButton
            href="/guia-de-aprendizado"
            recipe="public"
            leadingIcon={<TdmBookIcon />}
          >
            Ver guia
          </TdmButton>
        }
      />
      <PublicSection
        compact
        title="Biblioteca"
        description="Cada bloco explica por que aquela base existe no produto."
      >
        <div className={styles.refGrid}>
          {REFERENCE_CARDS.map((reference, index) => (
            <PublicReveal
              key={reference.title}
              delay={index * 0.04}
              className={styles.featureCardReveal}
            >
              <TdmPublicFeatureCard
                title={reference.title}
                description={reference.description}
                actionLabel="Abrir →"
                href={reference.href}
                size="compact"
              />
            </PublicReveal>
          ))}
        </div>
      </PublicSection>
      <PublicSection compact>
        <PublicCodePanel title="Estrutura pública" code={PUBLIC_ROUTE_STRUCTURE} />
      </PublicSection>
      <PublicFooter />
    </PublicShell>
  );
}
