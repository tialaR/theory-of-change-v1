'use client';

import Link from 'next/link';
import { useEffect, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import styles from './resend-ds.module.sass';

type NavItem = {
  href: string;
  label: string;
  hasMenu?: boolean;
};

const DEFAULT_NAV: NavItem[] = [
  { href: '/guia-de-aprendizado', label: 'Guia', hasMenu: true },
  { href: '/exemplos', label: 'Exemplos', hasMenu: true },
  { href: '/exemplos/resultado', label: 'Resultado', hasMenu: true },
  { href: '/referencias', label: 'Referências' }
];

export function DsPageShell({ children, className = '' }: { children: ReactNode; className?: string }) {
  useEffect(() => {
    document.body.classList.add('resend-public-scroll');
    return () => document.body.classList.remove('resend-public-scroll');
  }, []);

  return (
    <main data-resend-page="true" className={`${styles.shell} ${className}`}>
      <DsBackground />
      <div className={styles.shellInner}>{children}</div>
    </main>
  );
}

export function DsBackground() {
  return (
    <div className={styles.background} aria-hidden="true">
      <div className={styles.gridLayer} />
      <div className={styles.dotLayer} />
      <div className={styles.vignetteLayer} />
      <div className={styles.glowLayer} />
    </div>
  );
}

export function DsHeader({ ctaHref = '/canvas', ctaLabel = 'Comece agora' }: { ctaHref?: string; ctaLabel?: string }) {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.brand} aria-label="Ir para o início">
        <span className={styles.brandMark} aria-hidden="true" />
        <span className={styles.brandText}>Teoria</span>
      </Link>

      <nav className={styles.nav} aria-label="Navegação principal">
        {DEFAULT_NAV.map((item) => (
          <Link key={item.href} href={item.href} className={styles.navLink}>
            {item.label}
            {item.hasMenu ? <span aria-hidden="true">⌄</span> : null}
          </Link>
        ))}
      </nav>

      <Link href={ctaHref} className={styles.headerCta}>{ctaLabel}</Link>
    </header>
  );
}

export function DsHero({ kicker, title, description, actions, visual, compact = false }: { kicker?: string; title: string; description?: string; actions?: ReactNode; visual?: ReactNode; compact?: boolean }) {
  return (
    <section className={`${styles.hero} ${compact ? styles.heroCompact : ''}`}>
      {visual ? <Reveal className={styles.heroVisual}>{visual}</Reveal> : null}
      <Reveal className={styles.heroCopy} delay={0.03}>
        {kicker ? <p className={styles.kicker}>{kicker}</p> : null}
        <h1>{title}</h1>
        {description ? <p className={styles.heroDescription}>{description}</p> : null}
        {actions ? <div className={styles.heroActions}>{actions}</div> : null}
      </Reveal>
    </section>
  );
}

export function DsButton({ href, children, variant = 'primary', onClick, type = 'button' }: { href?: string; children: ReactNode; variant?: 'primary' | 'secondary' | 'ghost'; onClick?: () => void; type?: 'button' | 'submit' }) {
  const className = `${styles.button} ${styles[`button_${variant}`]}`;
  if (href) return <Link href={href} className={className}>{children}<span aria-hidden="true">›</span></Link>;
  return <button type={type} className={className} onClick={onClick}>{children}<span aria-hidden="true">›</span></button>;
}

export function DsSection({ eyebrow, title, description, children, compact = false, className = '' }: { eyebrow?: string; title?: string; description?: string; children: ReactNode; compact?: boolean; className?: string }) {
  return (
    <section className={`${styles.section} ${compact ? styles.sectionCompact : ''} ${className}`}>
      {(eyebrow || title || description) ? (
        <Reveal className={styles.sectionHeader}>
          {eyebrow ? <p className={styles.kicker}>{eyebrow}</p> : null}
          {title ? <h2>{title}</h2> : null}
          {description ? <p>{description}</p> : null}
        </Reveal>
      ) : null}
      {children}
    </section>
  );
}

export function DsSurface({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`${styles.surface} ${className}`}>{children}</div>;
}


export function DsCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <DsSurface className={className}>{children}</DsSurface>;
}

export function DsMockup({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <DsSurface className={className}>{children}</DsSurface>;
}

export function DsCodeFrame({ title = 'Código', children, className = '' }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <DsSurface className={`${styles.codeFrame} ${className}`}>
      <div className={styles.codeChrome}>
        <span /><span /><span />
        <strong>{title}</strong>
      </div>
      <pre>{children}</pre>
    </DsSurface>
  );
}

export function Reveal({ children, className = '', delay = 0, amount = 0.18 }: { children: ReactNode; className?: string; delay?: number; amount?: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: '2.4rem', filter: 'blur(0.55rem)' }}
      whileInView={reduced ? undefined : { opacity: 1, y: '0rem', filter: 'blur(0rem)' }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.74, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function DsFooter() {
  return (
    <footer className={styles.footer}>
      <span>Teoria</span>
      <span>Experiência pública experimental, canvas preservado.</span>
    </footer>
  );
}
