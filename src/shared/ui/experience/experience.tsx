'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import styles from './experience.module.sass';

export type ExperienceNavItem = {
  label: string;
  href: string;
};

export type ExperienceAction = {
  label: string;
  href?: string;
  onClick?: () => void;
  tone?: 'primary' | 'secondary' | 'ghost';
  icon?: ReactNode;
  disabled?: boolean;
};

const defaultNavItems: ExperienceNavItem[] = [
  { label: 'Produto', href: '/' },
  { label: 'Aprender', href: '/guia-de-aprendizado' },
  { label: 'Exemplos', href: '/exemplos' },
  { label: 'Referências', href: '/referencias' }
];

function joinClassNames(...values: Array<string | false | undefined>) {
  return values.filter(Boolean).join(' ');
}

export function ExperienceShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <main className={joinClassNames(styles.shell, className)}>
      <ExperienceAtmosphere />
      <div className={styles.shellContent}>{children}</div>
    </main>
  );
}

export function ExperienceAtmosphere() {
  return (
    <div className={styles.atmosphere} aria-hidden="true">
      <span className={styles.glowOne} />
      <span className={styles.glowTwo} />
      <span className={styles.glowThree} />
      <span className={styles.gridWash} />
    </div>
  );
}

export function ExperienceHeader({
  active = '',
  navItems = defaultNavItems,
  cta = { label: 'Criar teoria', href: '/canvas' }
}: {
  active?: string;
  navItems?: ExperienceNavItem[];
  cta?: ExperienceAction;
}) {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.brand} aria-label="Construtor de Teoria da Mudança">
        <span className={styles.brandMark} aria-hidden="true">
          <span />
        </span>
        <span>Teoria da Mudança</span>
      </Link>
      <nav className={styles.nav} aria-label="Navegação principal">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className={joinClassNames(styles.navLink, active === item.href && styles.navLinkActive)}>
            {item.label}
          </Link>
        ))}
      </nav>
      <ExperienceButton action={cta} size="sm" />
    </header>
  );
}

export function ExperienceButton({
  action,
  size = 'md',
  className
}: {
  action: ExperienceAction;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const reducedMotion = useReducedMotion();
  const content = (
    <>
      <span>{action.label}</span>
      {action.icon ? <span className={styles.buttonIcon}>{action.icon}</span> : null}
    </>
  );
  const classes = joinClassNames(styles.button, styles[`button${capitalize(action.tone ?? 'secondary')}`], styles[`button${capitalize(size)}`], className, action.disabled && styles.buttonDisabled);

  if (action.href && !action.disabled) {
    return (
      <motion.div whileTap={reducedMotion ? undefined : { scale: 0.985 }} className={styles.buttonWrap}>
        <Link href={action.href} className={classes}>
          {content}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      type="button"
      className={classes}
      onClick={action.disabled ? undefined : action.onClick}
      disabled={action.disabled}
      whileTap={reducedMotion || action.disabled ? undefined : { scale: 0.985 }}
    >
      {content}
    </motion.button>
  );
}

export function ExperienceHero({
  eyebrow,
  title,
  lead,
  actions,
  visual,
  align = 'center'
}: {
  eyebrow: string;
  title: string;
  lead: string;
  actions?: ExperienceAction[];
  visual?: ReactNode;
  align?: 'center' | 'split';
}) {
  const reducedMotion = useReducedMotion();
  return (
    <section className={joinClassNames(styles.hero, align === 'split' && styles.heroSplit)}>
      <motion.div
        className={styles.heroCopy}
        initial={reducedMotion ? false : { opacity: 0, y: 18 }}
        animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1 className={styles.heroTitle}>{title}</h1>
        <p className={styles.heroLead}>{lead}</p>
        {actions?.length ? (
          <div className={styles.heroActions}>
            {actions.map((action) => (
              <ExperienceButton key={action.label} action={action} size="md" />
            ))}
          </div>
        ) : null}
      </motion.div>
      {visual ? (
        <motion.div
          className={styles.heroVisual}
          initial={reducedMotion ? false : { opacity: 0, y: 28, scale: 0.985 }}
          animate={reducedMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.74, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          {visual}
        </motion.div>
      ) : null}
    </section>
  );
}

export function ExperienceSection({
  eyebrow,
  title,
  lead,
  children,
  className
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  children: ReactNode;
  className?: string;
}) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.section
      className={joinClassNames(styles.section, className)}
      initial={reducedMotion ? false : { opacity: 0, y: 24 }}
      whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-12% 0px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={styles.sectionHeader}>
        {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
        <h2>{title}</h2>
        {lead ? <p>{lead}</p> : null}
      </div>
      {children}
    </motion.section>
  );
}

export function ExperienceCard({
  eyebrow,
  title,
  description,
  children,
  className,
  accent = 'neutral'
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
  accent?: 'neutral' | 'violet' | 'blue' | 'amber' | 'green' | 'white';
}) {
  return (
    <article className={joinClassNames(styles.card, styles[`accent${capitalize(accent)}`], className)}>
      <span className={styles.cardSheen} aria-hidden="true" />
      {eyebrow ? <p className={styles.cardEyebrow}>{eyebrow}</p> : null}
      <h3>{title}</h3>
      {description ? <p>{description}</p> : null}
      {children}
    </article>
  );
}

export function ExperienceMockup({ children, className, compact = false }: { children: ReactNode; className?: string; compact?: boolean }) {
  return <div className={joinClassNames(styles.mockup, compact && styles.mockupCompact, className)}>{children}</div>;
}

export function ExperienceMiniLogo({ className }: { className?: string }) {
  return (
    <div className={joinClassNames(styles.miniLogo, className)} aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  );
}

function capitalize(value: string) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}
