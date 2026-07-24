import type { ReactNode } from 'react';
import styles from './tdm-status-screen.module.sass';

export type TdmStatusScreenTone = 'neutral' | 'danger';

export type TdmStatusScreenProps = {
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

function renderIcon(icon: ReactNode) {
  if (!icon) return null;
  return <div className={styles.icon}>{icon}</div>;
}

function renderEyebrow(eyebrow?: string) {
  if (!eyebrow) return null;
  return <p className={styles.eyebrow}>{eyebrow}</p>;
}

function renderActions(actions: ReactNode) {
  if (!actions) return null;
  return <div className={styles.actions}>{actions}</div>;
}

export function TdmStatusScreen({
  eyebrow,
  title,
  description,
  icon,
  actions,
  tone = 'neutral',
  busy = false
}: TdmStatusScreenProps) {
  const className = [styles.root, resolveToneClassName(tone)].join(' ');
  const busyState = busy || undefined;
  const busyDataValue = busy ? 'true' : 'false';
  const iconContent = renderIcon(icon);
  const eyebrowContent = renderEyebrow(eyebrow);
  const actionsContent = renderActions(actions);

  return (
    <main className={className} data-busy={busyDataValue} aria-busy={busyState}>
      <section className={styles.content} aria-live="polite">
        {iconContent}
        {eyebrowContent}
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.description}>{description}</p>
        {actionsContent}
      </section>
    </main>
  );
}
