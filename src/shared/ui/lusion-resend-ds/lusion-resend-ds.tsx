'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import styles from './lusion-resend-ds.module.sass';

const NAV = [
  { href: '/guia-de-aprendizado', label: 'Guia' },
  { href: '/exemplos', label: 'Exemplos' },
  { href: '/referencias', label: 'Referências' },
  { href: '/canvas', label: 'Canvas' }
] as const;

function isNavActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

const ease = [0.22, 1, 0.36, 1] as const;

function isOutcomeKicker(text?: string) {
  if (!text) return false;
  const normalized = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  return normalized === 'resultado' || normalized === 'resultados';
}

function resolveActionIcon(label: string): ReactNode | null {
  const text = label.toLowerCase();

  if (/criar|comece|abrir canvas|ir para o canvas/.test(text)) {
    return (
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M8 3.25v9.5M3.25 8h9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (/ver|explorar|abrir visualiza/.test(text)) {
    return (
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d="M2.5 8s2.2-4 5.5-4 5.5 4 5.5 4-2.2 4-5.5 4-5.5-4-5.5-4Z"
          stroke="currentColor"
          strokeWidth="1.35"
        />
        <circle cx="8" cy="8" r="1.75" stroke="currentColor" strokeWidth="1.35" />
      </svg>
    );
  }

  if (/fechar/.test(text)) {
    return (
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M4.25 4.25 11.75 11.75M11.75 4.25 4.25 11.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (/voltar/.test(text)) {
    return (
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M9.5 3.5 4.5 8l5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4.75 8h6.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (/guia/.test(text)) {
    return (
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M4 2.75h6.5L12.25 4.5V13H4V2.75Z" stroke="currentColor" strokeWidth="1.35" strokeLinejoin="round" />
        <path d="M6.25 2.75V13" stroke="currentColor" strokeWidth="1.35" />
      </svg>
    );
  }

  return null;
}

export function PublicShell({
  children,
  className = '',
  tone = 'default'
}: {
  children: ReactNode;
  className?: string;
  tone?: 'default' | 'silver';
}) {
  useEffect(() => {
    document.body.classList.add('public-page-scroll');
    return () => document.body.classList.remove('public-page-scroll');
  }, []);

  return (
    <div data-public-page="true" data-public-tone={tone} className={`${styles.shell} ${className}`}>
      <PublicGridBackground />
      <div className={styles.shellInner}>{children}</div>
    </div>
  );
}

export function PublicGridBackground() {
  return <div className={styles.gridBg} aria-hidden="true" />;
}

export function PublicHeader({
  ctaHref = '/canvas',
  ctaLabel = 'Criar teoria'
}: {
  ctaHref?: string;
  ctaLabel?: string;
}) {
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.brand} aria-label="Ir para o início">
        <PublicLogoMark />
        <span>TDM</span>
      </Link>
      <nav className={styles.nav} aria-label="Navegação principal">
        {NAV.map((item) => {
          const active = isNavActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${active ? styles.navLink_active : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className={styles.headerCtaWrap}>
        <PublicButton href={ctaHref} variant="primary">
          {ctaLabel}
        </PublicButton>
      </div>
    </header>
  );
}

export function PublicLogoMark() {
  return <span className={styles.logoMark} aria-hidden="true" />;
}

export function PublicHero({
  kicker,
  title,
  description,
  actions,
  visual,
  compact = false
}: {
  kicker?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  visual?: ReactNode;
  compact?: boolean;
}) {
  return (
    <section className={`${styles.hero} ${compact ? styles.hero_compact : ''}`}>
      {visual ? <PublicReveal className={styles.heroVisual}>{visual}</PublicReveal> : null}
      <PublicReveal className={styles.heroCopy} delay={0.06}>
        {kicker ? <p className={styles.kicker}>{kicker}</p> : null}
        <h1>{title}</h1>
        {description ? <p className={styles.heroDescription}>{description}</p> : null}
        {actions ? <div className={styles.heroActions}>{actions}</div> : null}
      </PublicReveal>
    </section>
  );
}

export function PublicButton({
  href,
  children,
  variant = 'primary',
  onClick,
  type = 'button'
}: {
  href?: string;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  onClick?: () => void;
  type?: 'button' | 'submit';
}) {
  const className = `${styles.button} ${styles[`button_${variant}`]}`;
  const label = typeof children === 'string' ? children : '';
  const icon = label ? resolveActionIcon(label) : null;
  const content = (
    <>
      {icon ? <span className={styles.buttonIcon}>{icon}</span> : null}
      {children}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }
  return (
    <button type={type} className={className} onClick={onClick}>
      {content}
    </button>
  );
}

export function PublicSection({
  eyebrow,
  title,
  description,
  children,
  compact = false,
  className = ''
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
  children: ReactNode;
  compact?: boolean;
  className?: string;
}) {
  return (
    <section className={`${styles.section} ${compact ? styles.section_compact : ''} ${className}`}>
      {(eyebrow || title || description) && (
        <PublicReveal className={styles.sectionHeader}>
          {eyebrow ? <p className={isOutcomeKicker(eyebrow) ? styles.kickerOutcome : styles.kicker}>{eyebrow}</p> : null}
          {title ? <h2>{title}</h2> : null}
          {description ? <p>{description}</p> : null}
        </PublicReveal>
      )}
      {children}
    </section>
  );
}

export function PublicCard({
  children,
  className = '',
  href
}: {
  children: ReactNode;
  className?: string;
  href?: string;
}) {
  const content = <article className={`${styles.card} ${className}`}>{children}</article>;
  if (href) {
    return (
      <Link href={href} style={{ display: 'block', textDecoration: 'none' }}>
        {content}
      </Link>
    );
  }
  return content;
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

export function PublicTimeline({
  steps
}: {
  steps: Array<{ number: string; title: string; text: string; visual: string }>;
}) {
  const reduced = useReducedMotion();

  return (
    <div className={styles.timeline}>
      <div className={styles.timelineRail} aria-hidden="true">
        <motion.div
          className={styles.timelineRailFill}
          initial={{ scaleY: reduced ? 1 : 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: false, amount: 0.1 }}
          transition={{ duration: reduced ? 0.01 : 1.2, ease }}
        />
      </div>
      {steps.map((step, index) => (
        <PublicTimelineStep key={step.title} step={step} index={index} />
      ))}
    </div>
  );
}

function PublicTimelineStep({
  step,
  index
}: {
  step: { number: string; title: string; text: string; visual: string };
  index: number;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.article
      className={styles.timelineStep}
      initial={{ opacity: reduced ? 1 : 0.35 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: false, amount: 0.45 }}
      transition={{ duration: reduced ? 0.01 : 0.4, ease }}
    >
      <div>
        <span className={styles.timelineStepNumber}>{step.number}</span>
        <h3>{step.title}</h3>
        <p>{step.text}</p>
      </div>
      <PublicReveal delay={index * 0.04}>
        <div className={styles.timelineCard}>
          <strong>{step.visual}</strong>
          <p>Visualize esta etapa no fluxo da teoria antes de avançar.</p>
        </div>
      </PublicReveal>
    </motion.article>
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

export function PublicReveal({
  children,
  className = '',
  delay = 0,
  amount = 0.2
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  amount?: number;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={`${styles.reveal} ${className}`}
      initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : '1.5rem' }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: reduced ? 0.01 : 0.55, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

export function PublicFooter() {
  return (
    <footer className={styles.footer}>
      <p>Teoria da Mudança — construtor visual de intervenções</p>
    </footer>
  );
}

export function PublicHomeOrb() {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={styles.homeOrb}
      initial={{ opacity: reduced ? 1 : 0, scale: reduced ? 1 : 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: reduced ? 0.01 : 0.9, ease }}
    >
      <span className={styles.homeOrbRing} />
      <span className={styles.homeOrbRing} />
      <span className={styles.homeOrbRing} />
      <motion.span
        className={styles.homeOrbCore}
        animate={reduced ? undefined : { scale: [1, 1.04, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  );
}
