'use client';

import type { CSSProperties, ReactNode } from 'react';
import { GlassSurface } from './glass-surface';
import type { GlassSurfaceTuning, ThemeTokens } from './types';
import { DEFAULT_CARD_GLASS } from './types';
import styles from './result-liquid-card.module.sass';

export interface ResultLiquidCardProps {
  title: string;
  description: string;
  details?: string;
  notes?: string;
  incomingCount?: number;
  outgoingCount?: number;
  accentColor?: string;
  theme?: Partial<ThemeTokens>;
  glass?: GlassSurfaceTuning;
  className?: string;
  glassClassName?: string;
  contentClassName?: string;
  titleClassName?: string;
  children?: ReactNode;
  ariaLabel?: string;
}

export function ResultLiquidCard({
  title,
  description,
  details,
  notes,
  incomingCount,
  outgoingCount,
  accentColor = '#9a7cff',
  theme,
  glass,
  className = '',
  glassClassName = '',
  contentClassName = '',
  titleClassName = '',
  children,
  ariaLabel
}: ResultLiquidCardProps) {
  const resolvedGlass = { ...DEFAULT_CARD_GLASS, ...glass };
  const variables = {
    '--resource-accent': accentColor,
    '--resource-icon': accentColor,
    '--resource-title': theme?.titleColor ?? 'rgba(239, 239, 241, .94)',
    '--resource-body': theme?.bodyColor ?? 'rgba(218, 218, 222, .76)',
    '--resource-muted': theme?.mutedColor ?? 'rgba(198, 198, 204, .68)',
    '--resource-line': theme?.lineColor ?? 'rgba(255, 255, 255, .065)',
    '--glass-accent': accentColor
  } as CSSProperties;

  const hasDirectionalConnections = incomingCount !== undefined || outgoingCount !== undefined;
  const hasDetails = Boolean(details?.trim());
  const hasNotes = Boolean(notes?.trim());

  const connections = (
    <div className={styles.connections} aria-label="Conexões do card">
      {incomingCount !== undefined && incomingCount > 0 ? (
        <span className={styles.count} aria-label={`${incomingCount} conexões de entrada`}>
          <span className={styles.arrow} aria-hidden="true">
            ←
          </span>
          <span>{incomingCount}</span>
        </span>
      ) : null}
      {outgoingCount !== undefined && outgoingCount > 0 ? (
        <span className={styles.count} aria-label={`${outgoingCount} conexões de saída`}>
          <span className={styles.arrow} aria-hidden="true">
            →
          </span>
          <span>{outgoingCount}</span>
        </span>
      ) : null}
      {!hasDirectionalConnections ? null : null}
    </div>
  );

  const content = (
    <div className={[styles.cardContent, contentClassName].filter(Boolean).join(' ')}>
      <header className={styles.cardHeader}>
        <span className={styles.icon} aria-hidden="true">
          <span className={styles.iconDot} />
        </span>
        <h3 className={[styles.title, titleClassName].filter(Boolean).join(' ')}>{title}</h3>
        {connections}
      </header>

      <p className={styles.description}>{description}</p>

      {hasDetails ? (
        <section className={styles.section}>
          <h4 className={styles.label}>DETALHES</h4>
          <p className={styles.copy}>{details}</p>
        </section>
      ) : null}

      {hasNotes ? (
        <section className={`${styles.section} ${styles.notesSection}`}>
          <h4 className={styles.label}>NOTAS</h4>
          <p className={styles.copy}>{notes}</p>
        </section>
      ) : null}

      {children}
    </div>
  );

  return (
    <GlassSurface
      {...resolvedGlass}
      className={[styles.card, glassClassName, className].filter(Boolean).join(' ')}
      style={variables}
      ariaLabel={ariaLabel ?? `${title}`}
    >
      {content}
    </GlassSurface>
  );
}
