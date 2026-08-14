import Link from 'next/link';
import type { ReactNode } from 'react';
import { PublicReveal } from './public-reveal';
import type {
  PublicCardProps,
  PublicHeroProps,
  PublicSectionProps
} from './public-layout.types';
import styles from './tdm-public-layout.module.sass';

export function PublicHero({
  kicker,
  title,
  description,
  actions,
  visual,
  compact = false
}: PublicHeroProps) {
  const heroClassName = `${styles.hero} ${compact ? styles.hero_compact : ''}`;

  return (
    <section data-public-chapter="true" className={heroClassName}>
      {visual ? <PublicReveal className={styles.heroVisual}>{visual}</PublicReveal> : null}
      <PublicReveal className={styles.heroCopy} delay={0.06}>
        {kicker ?? null}
        <h1>{title}</h1>
        {description ? <p className={styles.heroDescription}>{description}</p> : null}
        {actions ? <div className={styles.heroActions}>{actions}</div> : null}
      </PublicReveal>
    </section>
  );
}

export function PublicSection({
  eyebrow,
  title,
  description,
  children,
  compact = false,
  className = ''
}: PublicSectionProps) {
  const sectionClassName = `${styles.section} ${compact ? styles.section_compact : ''} ${className}`;
  const hasHeader = Boolean(eyebrow || title || description);

  return (
    <section data-public-chapter="true" className={sectionClassName}>
      {hasHeader ? (
        <PublicReveal className={styles.sectionHeader}>
          {eyebrow ?? null}
          {title ? <h2>{title}</h2> : null}
          {description ? <p className={styles.sectionDescription}>{description}</p> : null}
        </PublicReveal>
      ) : null}
      {children}
    </section>
  );
}

export function PublicCard({ children, className = '', href }: PublicCardProps) {
  const content = <article className={`${styles.card} ${className}`}>{children}</article>;

  if (!href) return content;

  return (
    <Link href={href} className={styles.cardLink}>
      {content}
    </Link>
  );
}

export function PublicMockup({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className={styles.mockup}>
      <div className={styles.mockupBar} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      {title ? (
        <div className={styles.codePanelHeader}>
          <span>{title}</span>
        </div>
      ) : null}
      <div className={styles.mockupBody}>{children}</div>
    </div>
  );
}

export function PublicCodePanel({ title, code }: { title: string; code: string }) {
  return (
    <div className={styles.codePanel}>
      <div className={styles.codePanelHeader}>
        <span>{title}</span>
      </div>
      <pre>{code}</pre>
    </div>
  );
}

export function PublicFooter() {
  const year = new Date().getFullYear();

  return (
    <footer data-public-chapter="true" className={styles.footer}>
      <div className={styles.footerCopyright}>
        <p className={styles.footerCopyrightPrimary}>
          © {year} TMD Construtor. Todos os direitos reservados.
        </p>
        <p className={styles.footerCopyrightSecondary}>
          Ferramenta visual para construir, revisar e comunicar teorias da mudança.
        </p>
      </div>
    </footer>
  );
}
