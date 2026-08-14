import type { CSSProperties, ReactNode } from 'react';

export type GlassChannel = 'R' | 'G' | 'B';

export interface GlassSurfaceTuning {
  opacity?: number;
  borderRadius?: number;
  borderWidth?: number;
  brightness?: number;
  blur?: number;
  displace?: number;
  backgroundOpacity?: number;
  saturation?: number;
  distortionScale?: number;
  redOffset?: number;
  greenOffset?: number;
  blueOffset?: number;
  xChannel?: GlassChannel;
  yChannel?: GlassChannel;
}

export interface ThemeTokens {
  accentColor: string;
  accentSoftColor: string;
  backgroundColor: string;
  panelColor: string;
  cardColor: string;
  titleColor: string;
  bodyColor: string;
  mutedColor: string;
  lineColor: string;
}

export interface SurfaceStyle extends CSSProperties {
  '--glass-accent'?: string;
  '--glass-background'?: string;
  '--glass-border-color'?: string;
  '--glass-highlight'?: string;
}

export interface WithChildren {
  children?: ReactNode;
}

export const DEFAULT_PANEL_GLASS: GlassSurfaceTuning = {
  opacity: 1,
  borderRadius: 8,
  borderWidth: 0.02,
  displace: 5,
  backgroundOpacity: 0.02,
  blur: 11,
  saturation: 1,
  brightness: 50
};

export const DEFAULT_CARD_GLASS: GlassSurfaceTuning = {
  opacity: 1,
  borderRadius: 8,
  borderWidth: 0.02,
  displace: 5,
  backgroundOpacity: 0.02,
  blur: 11,
  saturation: 1,
  brightness: 50
};
