'use client';

import type { CSSProperties, ReactNode } from 'react';
import { GlassSurface } from './glass-surface';
import type { GlassSurfaceTuning, ThemeTokens } from './types';
import { DEFAULT_PANEL_GLASS } from './types';
import styles from './resources-panel.module.sass';

export interface ResourcesPanelProps {
  title?: string;
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
  backgroundColor: '#0e0f13',
  panelColor: 'rgba(14, 15, 19, .94)',
  cardColor: 'rgba(13, 14, 18, .96)',
  titleColor: 'rgba(236, 237, 241, .94)',
  bodyColor: 'rgba(206, 208, 214, .74)',
  mutedColor: 'rgba(176, 178, 186, .58)',
  lineColor: 'rgba(255, 255, 255, .05)'
};

export function ResourcesPanel({
  title = 'INSUMOS',
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
}: ResourcesPanelProps) {
  const resolvedTheme = { ...defaultTheme, ...theme };
  const resolvedGlass = { ...DEFAULT_PANEL_GLASS, ...panelGlass };
  const variables = {
    '--panel-accent': resolvedTheme.accentColor,
    '--panel-accent-soft': resolvedTheme.accentSoftColor,
    '--panel-title': resolvedTheme.titleColor,
    '--panel-line': resolvedTheme.lineColor,
    '--glass-background': resolvedTheme.panelColor
  } as CSSProperties;

  const headerClassNames = [
    styles.panelHeader,
    isDimmed ? styles.panelHeaderDimmed : '',
    isSelected ? styles.panelHeaderSelected : '',
    headerClassName
  ].filter(Boolean).join(' ');

  const panelClassNames = [
    styles.panel,
    isDimmed ? styles.panelDimmed : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <GlassSurface
      {...resolvedGlass}
      className={panelClassNames}
      contentClassName={[styles.panelSurfaceContent, contentClassName].filter(Boolean).join(' ')}
      style={variables}
      ariaLabel={ariaLabel ?? `${title}${countLabel ? `, ${countLabel}` : ''}`}
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
