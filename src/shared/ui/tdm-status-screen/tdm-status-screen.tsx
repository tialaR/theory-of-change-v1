import type { ReactNode } from 'react';
import styles from './tdm-status-screen.module.sass';

export type TdmStatusScreenTone = 'neutral' | 'danger';

export type TdmStatusScreenProps = {
  code?: string;
  codeAriaLabel?: string;
  eyebrow?: string;
  title: string;
  description: string;
  icon?: ReactNode;
  actions?: ReactNode;
  tone?: TdmStatusScreenTone;
  busy?: boolean;
};

function resolveToneClassName(tone: TdmStatusScreenTone) {
  if (tone === 'danger') return styles.toneDanger;
  return styles.toneNeutral;
}

export function TdmStatusScreen({
  code,
  codeAriaLabel,
  eyebrow,
  title,
  description,
  icon,
  actions,
  tone = 'neutral',
  busy = false
}: TdmStatusScreenProps) {
  const className = [styles.root, resolveToneClassName(tone)].join(' ');

  return (
    <main className={className} data-busy={busy ? 'true' : 'false'} aria-busy={busy || undefined}>
      <span className={styles.decorativeLeft} aria-hidden="true" />
      <span className={styles.decorativeRight} aria-hidden="true" />
      <section className={styles.content} aria-live="polite">
        {code ? <p className={styles.code} aria-label={codeAriaLabel}>{code}</p> : null}
        {icon ? <div className={styles.icon}>{icon}</div> : null}
        {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.description}>{description}</p>
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </section>
    </main>
  );
}
