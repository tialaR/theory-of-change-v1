'use client';

import type { ReactNode } from 'react';
import { ContextLabelPanelsIcon, TdmContextLabel } from '@/shared/ui/tdm-context-label';
import { TdmPublicFeatureCard } from '@/shared/ui/tdm-public-feature-card';
import styles from './example-previews.module.sass';

type ExperienceCardProps = {
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
};

function ExperienceCard({ href, title, description, icon }: ExperienceCardProps) {
  return (
    <TdmPublicFeatureCard
      href={href}
      icon={icon}
      title={title}
      description={description}
      actionLabel="Abrir"
      size="choice"
      className={styles.experienceCard}
    />
  );
}

function FlowIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 7h4v4H7z" />
      <path d="M14 13h4v4h-4z" />
      <path d="M11 9h2.5c1.7 0 2.5.8 2.5 2.5V13" />
      <path d="M9 11v1.5c0 1.7.8 2.5 2.5 2.5H14" />
    </svg>
  );
}

function ResultIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 4h10a2 2 0 0 1 2 2v14H5V6a2 2 0 0 1 2-2Z" />
      <path d="M8 8h8" />
      <path d="M8 12h8" />
      <path d="M8 16h5" />
    </svg>
  );
}

export function ExamplePreviewsSection() {
  return (
    <section className={styles.previewsSection} aria-labelledby="example-previews-title">
      <div className={styles.sectionHeader}>
        <TdmContextLabel icon={ContextLabelPanelsIcon} align="center">
          PRÉVIA DAS EXPERIÊNCIAS
        </TdmContextLabel>
        <h2 id="example-previews-title" className={styles.sectionTitle}>
          Escolha como visualizar a teoria.
        </h2>
        <p className={styles.sectionDescription}>
          Dois caminhos visuais, o mesmo sistema: primeiro entenda o fluxo, depois leia o resultado conectado.
        </p>
      </div>

      <div className={styles.previewGrid}>
        <ExperienceCard
          href="/exemplos/visao-do-fluxo"
          title="Visualização do fluxo"
          description="Veja a lógica causal em rascunho: etapas, cards e conexões animadas antes de abrir a experiência completa."
          icon={<FlowIcon />}
        />
        <ExperienceCard
          href="/exemplos/resultado"
          title="Resultado conectado"
          description="Abra a leitura final com relações, riscos e hipóteses organizados em uma experiência visual."
          icon={<ResultIcon />}
        />
      </div>
    </section>
  );
}
