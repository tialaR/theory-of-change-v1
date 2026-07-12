'use client';

import type { CSSProperties, ReactNode } from 'react';
import { GlassSurface } from './glass-surface';
import type { GlassSurfaceTuning, ThemeTokens } from './types';
import { DEFAULT_PANEL_GLASS } from './types';
import styles from './result-liquid-column.module.sass';

export interface ResultLiquidColumnProps {
  title: string;
  countLabel?: string;
  theme?: Partial<ThemeTokens>;
  panelGlass?: GlassSurfaceTuning;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
  isDimmed?: boolean;
  isSelected?: boolean;
  ariaLabel?: string;
  children: ReactNode;
}

const defaultTheme: ThemeTokens = {
  accentColor: '#a98cff',
  accentSoftColor: '#c1adff',
  backgroundColor: '#121318',
  panelColor: 'rgba(17, 18, 22, .12)',
  cardColor: 'rgba(11, 12, 15, .12)',
  titleColor: 'rgba(242, 242, 245, .94)',
  bodyColor: 'rgba(218, 218, 222, .76)',
  mutedColor: 'rgba(198, 198, 204, .68)',
  lineColor: 'rgba(255, 255, 255, .065)'
};

export function ResultLiquidColumn({
  title,
  countLabel,
  theme,
  panelGlass,
  className = '',
  contentClassName = '',
  headerClassName = '',
  isDimmed = false,
  isSelected = false,
  ariaLabel,
  children
}: ResultLiquidColumnProps) {
  const resolvedTheme = { ...defaultTheme, ...theme };
  const resolvedGlass = { ...DEFAULT_PANEL_GLASS, ...panelGlass };

  const variables = {
    '--panel-accent': resolvedTheme.accentColor,
    '--panel-accent-soft': resolvedTheme.accentSoftColor,
    '--panel-title': resolvedTheme.titleColor,
    '--panel-line': resolvedTheme.lineColor,
    '--glass-accent': resolvedTheme.accentColor
  } as CSSProperties;

  const headerClassNames = [
    styles.panelHeader,
    isDimmed ? styles.panelHeaderDimmed : '',
    isSelected ? styles.panelHeaderSelected : '',
    headerClassName
  ]
    .filter(Boolean)
    .join(' ');

  const panelClassNames = [
    styles.panel,
    isDimmed ? styles.panelDimmed : '',
    className
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <GlassSurface
      {...resolvedGlass}
      className={panelClassNames}
      contentClassName={[styles.panelSurfaceContent, contentClassName].filter(Boolean).join(' ')}
      style={variables}
      ariaLabel={ariaLabel ?? `${title}`}
    >
      <div className={styles.panelContent}>
        <header className={headerClassNames}>
          <span className={styles.topRule} aria-hidden="true" />
          <div className={styles.headingGroup}>
            <span className={styles.headingDot} aria-hidden="true" />
            <h2 className={styles.heading}>{title}</h2>
          </div>
          {countLabel ? <span className={styles.total}>{countLabel}</span> : null}
        </header>

        <div className={styles.headerDivider} aria-hidden="true" />

        <div className={styles.cardList}>{children}</div>
      </div>
    </GlassSurface>
  );
}
