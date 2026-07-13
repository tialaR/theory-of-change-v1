'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { motion } from 'motion/react';
import { FlowDraftPreview } from './flow-draft-preview';
import { ResultDraftPreview } from './result-draft-preview';
import styles from './example-previews.module.sass';

type PreviewKey = 'flow' | 'result';

type PreviewCardProps = {
  type: PreviewKey;
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
};

function PreviewCard({ type, href, title, description, icon }: PreviewCardProps) {
  const [active, setActive] = useState(false);
  const Preview = type === 'flow' ? FlowDraftPreview : ResultDraftPreview;

  return (
    <motion.article
      className={styles.previewCard}
      onHoverStart={() => setActive(true)}
      onHoverEnd={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={styles.cardIntro}>
        <span className={styles.iconTile} aria-hidden="true">{icon}</span>
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>

      <div className={styles.previewFrame}>
        <Preview active={active} />
      </div>

      <Link className={styles.previewCta} href={href}>
        <span>Abrir</span>
        <span aria-hidden="true">→</span>
      </Link>
    </motion.article>
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
        <p className={styles.sectionKicker}>PRÉVIA DAS EXPERIÊNCIAS</p>
        <h2 id="example-previews-title" className={styles.sectionTitle}>
          Escolha como visualizar a teoria.
        </h2>
        <p className={styles.sectionDescription}>
          Dois caminhos visuais, o mesmo sistema: primeiro entenda o fluxo, depois leia o resultado conectado.
        </p>
      </div>

      <div className={styles.previewGrid}>
        <PreviewCard
          type="flow"
          href="/exemplos/fluxo"
          title="Visualização do fluxo"
          description="Veja a lógica causal em rascunho: etapas, cards e conexões animadas antes de abrir a experiência completa."
          icon={<FlowIcon />}
        />
        <PreviewCard
          type="result"
          href="/exemplos/resultado"
          title="Resultado conectado"
          description="Abra a leitura final com relações, riscos e hipóteses organizados em uma experiência visual."
          icon={<ResultIcon />}
        />
      </div>
    </section>
  );
}
