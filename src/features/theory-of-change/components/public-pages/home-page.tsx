import {
  PublicFooter,
  PublicHeader,
  PublicHero,
  PublicReveal,
  PublicSection,
  PublicShell
} from '@/shared/ui/tdm-public-layout';
import { ContextLabelEyeIcon, ContextLabelSparklesIcon } from '@/shared/ui/tdm-context-label';
import { TdmEyeIcon } from '@/shared/ui/tdm-icons';
import { TdmButton } from '@/shared/ui/tdm-button';
import { TdmKicker } from '@/shared/ui/tdm-kicker';
import { TdmPublicFeatureCard } from '@/shared/ui/tdm-public-feature-card';
import { HomeBrandLogo } from './home-brand-logo';
import { HomeOnboardingPreview } from './guided-story';
import { CtaChevronIcon } from './public-page-icons';
import { HOME_FEATURES } from './public-page-data';
import styles from './public-pages.module.sass';

export function HomePage() {
  return (
    <PublicShell sectionRhythm>
      <PublicHeader ctaLabel="Comece agora" ctaTrailingIcon={<CtaChevronIcon />} />
      <PublicHero
        visual={<HomeBrandLogo variant="hero" />}
        title="Desenhe a mudança antes de explicá-la."
        description="Um espaço visual para transformar problema, etapas, conexões, riscos e hipóteses em narrativa clara."
        actions={
          <>
            <TdmButton
              href="/canvas"
              recipe="public"
              variant="primary"
              size="lg"
              trailingIcon={<CtaChevronIcon />}
            >
              Comece agora
            </TdmButton>
            <TdmButton
              href="/exemplos/resultado"
              recipe="public"
              variant="tertiary"
              leadingIcon={<TdmEyeIcon />}
            >
              Ver exemplo
            </TdmButton>
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
          {HOME_FEATURES.map((feature, index) => (
            <PublicReveal
              key={feature.title}
              delay={index * 0.05}
              className={styles.featureCardReveal}
            >
              <TdmPublicFeatureCard
                eyebrow={feature.number}
                title={feature.title}
                description={feature.description}
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
