'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { TDM_MOTION_TRANSITIONS } from '@/shared/motion/tdm-motion';
import { PublicButton } from '@/shared/ui/public-button';
import styles from './lusion-resend-ds.module.sass';

export { PublicButton } from '@/shared/ui/public-button';
export type {
  PublicButtonProps,
  PublicButtonSize,
  PublicButtonVariant
} from '@/shared/ui/public-button';

const NAV = [
  { href: '/guia-de-aprendizado', label: 'Guia' },
  { href: '/exemplos', label: 'Exemplos' },
  { href: '/referencias', label: 'Referências' },
  { href: '/canvas', label: 'Canvas' }
] as const;

const HIDDEN_HEADER_ROUTES = [
  '/canvas',
  '/exemplos/resultado/interativo',
  '/exemplos/visao-do-fluxo/interativo'
] as const;

function isNavActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function shouldHidePublicHeader(pathname: string) {
  if (pathname.startsWith('/canvas')) return true;
  return HIDDEN_HEADER_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function usePublicHeaderScrolled() {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const scrollRoot = document.querySelector('[data-public-scroll="true"]');
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsScrolled(!entry.isIntersecting);
      },
      {
        // Sticky header lives inside this scroller; root must match so backdrop-filter can sample it.
        root: scrollRoot instanceof Element ? scrollRoot : null,
        threshold: 0
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return { sentinelRef, isScrolled };
}

export function PublicShell({
  children,
  className = '',
  tone = 'default',
  headerContentGap = false,
  sectionRhythm = false
}: {
  children: ReactNode;
  className?: string;
  tone?: 'default' | 'silver';
  /** Respiro Y canônico entre header e primeiro conteúdo (rotas públicas secundárias). */
  headerContentGap?: boolean;
  /** Ritmo Y canônico entre seções públicas irmãs (TDM-PUBLIC-SECTION-RHYTHM-V1). */
  sectionRhythm?: boolean;
}) {
  useEffect(() => {
    document.body.classList.add('public-page-scroll');
    return () => document.body.classList.remove('public-page-scroll');
  }, []);

  return (
    <div data-public-page="true" data-public-tone={tone} className={`${styles.shell} ${className}`}>
      <PublicGridBackground />
      <div data-public-scroll="true" className={styles.shellScroll}>
        <div
          className={[
            styles.shellInner,
            headerContentGap ? styles.shellInner_headerContentGap : '',
            sectionRhythm ? styles.shellInner_sectionRhythm : ''
          ]
            .filter(Boolean)
            .join(' ')}
          data-header-content-gap={headerContentGap ? 'true' : undefined}
          data-section-rhythm={sectionRhythm ? 'true' : undefined}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export function PublicGridBackground() {
  return <div className={styles.gridBg} aria-hidden="true" />;
}

export function PublicHeader({
  ctaHref = '/canvas',
  ctaLabel = 'Criar teoria',
  ctaTrailingIcon
}: {
  ctaHref?: string;
  ctaLabel?: string;
  ctaTrailingIcon?: ReactNode;
}) {
  const pathname = usePathname();
  const { sentinelRef, isScrolled } = usePublicHeaderScrolled();

  if (shouldHidePublicHeader(pathname)) return null;

  return (
    <>
      <div ref={sentinelRef} className={styles.scrollSentinel} aria-hidden="true" />
      <header
        className={styles.header}
        data-scrolled={isScrolled ? 'true' : 'false'}
      >
        <div className={styles.headerShell}>
          <div className={styles.headerBar}>
            <Link
              href="/"
              className={styles.brand}
              aria-label="TMD Construtor — Página inicial"
            >
              <Image
                src="/assets/brand/tmd-construtor-header-canonical.png"
                alt="TMD Construtor"
                width={1184}
                height={247}
                priority
                quality={100}
                className={styles.brandMark}
              />
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
              <PublicButton
                href={ctaHref}
                variant="textCompact"
                className={styles.headerCta}
                trailingIcon={ctaTrailingIcon}
              >
                {ctaLabel}
              </PublicButton>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

export function PublicHero({
  kicker,
  title,
  description,
  actions,
  visual,
  compact = false
}: {
  kicker?: ReactNode;
  title: string;
  description?: string;
  actions?: ReactNode;
  visual?: ReactNode;
  compact?: boolean;
}) {
  return (
    <section
      data-public-chapter="true"
      className={`${styles.hero} ${compact ? styles.hero_compact : ''}`}
    >
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
}: {
  eyebrow?: ReactNode;
  title?: string;
  description?: string;
  children: ReactNode;
  compact?: boolean;
  className?: string;
}) {
  return (
    <section
      data-public-chapter="true"
      className={`${styles.section} ${compact ? styles.section_compact : ''} ${className}`}
    >
      {(eyebrow || title || description) && (
        <PublicReveal className={styles.sectionHeader}>
          {eyebrow ?? null}
          {title ? <h2>{title}</h2> : null}
          {description ? <p className={styles.sectionDescription}>{description}</p> : null}
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
      <Link href={href} className={styles.cardLink}>
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
          transition={
            reduced
              ? { duration: 0.01 }
              : { ...TDM_MOTION_TRANSITIONS.panel, duration: TDM_MOTION_TRANSITIONS.panel.duration * 2.8 }
          }
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
      transition={reduced ? { duration: 0.01 } : TDM_MOTION_TRANSITIONS.layout}
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
      initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : '0.75rem' }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={
        reduced
          ? { duration: 0.01 }
          : { ...TDM_MOTION_TRANSITIONS.layout, delay }
      }
    >
      {children}
    </motion.div>
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

export function PublicHomeOrb() {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={styles.homeOrb}
      initial={{ opacity: reduced ? 1 : 0, scale: reduced ? 1 : 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={reduced ? { duration: 0.01 } : TDM_MOTION_TRANSITIONS.panel}
    >
      <span className={styles.homeOrbRing} />
      <span className={styles.homeOrbRing} />
      <span className={styles.homeOrbRing} />
      <span className={styles.homeOrbCore} />
    </motion.div>
  );
}
