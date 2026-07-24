import type { CSSProperties } from 'react';

export type LogoDimension = number | string;
export type LogoBlendMode = CSSProperties['mixBlendMode'];
export type LogoCssVars = CSSProperties & Record<`--${string}`, string | number | undefined>;
export type Rgb = { r: number; g: number; b: number };

export type LogoAnimatedSpriteProps = {
  className?: string;
  style?: CSSProperties;
  title?: string;
  ariaHidden?: boolean;

  /** Tamanho quadrado. Numero vira rem. Ex: 12 => 12rem. */
  size?: LogoDimension;
  width?: LogoDimension;
  height?: LogoDimension;
  widthRem?: number;
  heightRem?: number;

  /** 1 = velocidade original do video. 0.5 = metade. 2 = dobro. */
  speed?: number;
  /** Se definido, ignora speed. */
  durationSeconds?: number;

  /** Cor aplicada por cima do PNG transparente. */
  color?: string;
  primaryColor?: string;
  /** Sequencia visual (ex.: Apple Noir para cores das etapas). Cicla no mesmo loop do sprite. */
  colors?: string[];
  glowColor?: string;
  glowColors?: string[];
  glowSize?: LogoDimension;
  glowEnabled?: boolean;
  /** Janela de crossfade facetado entre cores (0-0.5). */
  colorBlend?: number;

  /** Forca da camada colorida. */
  tintOpacity?: number;
  /** Forca da textura original reconstruida do video. */
  textureStrength?: number;
  /** Alias de compatibilidade para textureStrength. */
  sourceOpacity?: number;
  /** Opacidade geral. */
  opacity?: number;
  tintBlendMode?: LogoBlendMode;

  /** Para debug ou tela reduzida. Default: false. */
  paused?: boolean;
  /** Mostra fundo dark dentro do wrapper, apenas para preview. */
  previewBackground?: boolean;
};

export const clamp01 = (value: number, fallback: number) => {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(1, Math.max(0, value));
};

export const normalizeSpeed = (value: number, fallback: number) => {
  if (!Number.isFinite(value) || value <= 0) return fallback;
  return value;
};

export const toCssSize = (value: LogoDimension | undefined, fallback: string) => {
  if (typeof value === 'number') return `${value}rem`;
  if (typeof value === 'string' && value.trim()) return value;
  return fallback;
};

export const sanitizeId = (id: string) => id.replace(/[^a-zA-Z0-9_-]/g, '');
