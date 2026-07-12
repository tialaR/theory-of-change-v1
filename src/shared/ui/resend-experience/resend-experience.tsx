'use client';

import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import styles from './resend-experience.module.sass';

const ease = [0.22, 1, 0.36, 1] as const;

export function RxShell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <main className={`${styles.shell} ${className}`}>
      <div className={styles.shellInner}>{children}</div>
    </main>
  );
}

export function RxHeader() {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.brand}>
        <span className={styles.logo} aria-hidden="true">T</span>
        <span>Teoria da Mudança</span>
      </Link>
      <nav className={styles.nav} aria-label="Principal">
        <Link className={styles.navLink} href="/guia-de-aprendizado">Aprender</Link>
        <Link className={styles.navLink} href="/exemplos">Exemplos</Link>
        <Link className={styles.navLink} href="/referencias">Referências</Link>
        <Link className={styles.navCta} href="/canvas">Criar teoria</Link>
      </nav>
    </header>
  );
}

export function RxReveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 26, filter: 'blur(0.75rem)' }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0, filter: 'blur(0rem)' }}
      viewport={{ once: true, margin: '-12% 0px' }}
      transition={{ duration: reduce ? 0.01 : 0.72, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

export function RxHero({ eyebrow, title, copy, actions, visual }: { eyebrow: string; title: ReactNode; copy: string; actions?: ReactNode; visual?: ReactNode }) {
  return (
    <section className={styles.hero}>
      <RxReveal>
        <p className={styles.kicker}>{eyebrow}</p>
        <h1 className={styles.display}>{title}</h1>
        <p className={styles.lead}>{copy}</p>
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </RxReveal>
      <RxReveal delay={0.12}>{visual}</RxReveal>
    </section>
  );
}

export function RxButton({ href, children, variant = 'primary' }: { href: string; children: ReactNode; variant?: 'primary' | 'ghost' }) {
  return <Link href={href} className={variant === 'primary' ? styles.primaryButton : styles.ghostButton}>{children}</Link>;
}

export function RxIconButton({ href, children, label }: { href: string; children: ReactNode; label: string }) {
  return <Link href={href} aria-label={label} className={styles.iconButton}>{children}</Link>;
}

export function RxHeroPanel({ children }: { children?: ReactNode }) {
  return (
    <div className={styles.heroPanel}>
      <div className={styles.bigNumber}>01</div>
      {children ?? (
        <div className={styles.mockGrid}>
          {['Insumos', 'Atividades', 'Produtos', 'Resultados'].map((item, index) => (
            <motion.article
              key={item}
              className={styles.mockCard}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: .55, delay: index * .08, ease }}
            >
              <p className={styles.mockTitle}>{item}</p>
              <p className={styles.mockText}>Bloco visual da cadeia causal com contexto, relação e leitura rápida.</p>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  );
}

export function RxSection({ eyebrow, title, copy, children }: { eyebrow: string; title: ReactNode; copy: string; children: ReactNode }) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <RxReveal>
          <p className={styles.kicker}>{eyebrow}</p>
          <h2 className={styles.sectionTitle}>{title}</h2>
        </RxReveal>
        <RxReveal delay={0.08}><p className={styles.sectionCopy}>{copy}</p></RxReveal>
      </div>
      {children}
    </section>
  );
}

export function RxCardGrid({ items }: { items: Array<{ index: string; title: string; text: string }> }) {
  return (
    <div className={styles.cardsGrid}>
      {items.map((item, index) => (
        <RxReveal key={item.title} delay={index * .06} className={styles.featureCard}>
          <span className={styles.featureIndex}>{item.index}</span>
          <div>
            <h3 className={styles.featureTitle}>{item.title}</h3>
            <p className={styles.featureText}>{item.text}</p>
          </div>
        </RxReveal>
      ))}
    </div>
  );
}

export function RxTimeline({ items }: { items: Array<{ label: string; title: string; text: string }> }) {
  return (
    <div className={styles.timeline}>
      {items.map((item, index) => (
        <div key={item.title} className={styles.timelineItem}>
          <RxReveal delay={index * .04}><div className={styles.timelineMarker}>{item.label}</div></RxReveal>
          <RxReveal delay={index * .08} className={styles.timelineCard}>
            <h3 className={styles.timelineTitle}>{item.title}</h3>
            <p className={styles.timelineText}>{item.text}</p>
          </RxReveal>
        </div>
      ))}
    </div>
  );
}

export function RxFooter() {
  return (
    <footer className={styles.footer}>
      <span>Construtor de Teoria da Mudança</span>
      <span>Experiência pública sem tocar no canvas</span>
    </footer>
  );
}

export type RxSurfaceVars = CSSProperties & Record<`--${string}`, string | number>;
