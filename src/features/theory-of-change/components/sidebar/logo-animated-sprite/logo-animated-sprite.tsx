'use client';

import { CSSProperties, useEffect, useId, useMemo, useRef } from 'react';
import styles from './logo-animated-sprite.module.sass';
import spriteAsset from './logo-sprite-transparent-complete.png';

type SpriteAsset = string | { src: string };

const getAssetSrc = (asset: SpriteAsset) => (typeof asset === 'string' ? asset : asset.src);
const SPRITE_SRC = getAssetSrc(spriteAsset as SpriteAsset);

const FRAME_SIZE = 480;
const FRAME_COUNT = 335;
const COLUMNS = 20;
const BASE_DURATION_SECONDS = 5.568333333333333;
const DEFAULT_SPEED = 1;
const DEFAULT_SIZE = '12rem';
const DEFAULT_COLOR = '#C5CAD3';
const DEFAULT_GLOW_COLOR = 'rgba(220, 224, 232, 0.16)';
const DEFAULT_GLOW_SIZE = '0.9rem';
const DEFAULT_TINT_OPACITY = 0.2;
const DEFAULT_TEXTURE_STRENGTH = 0.92;
const DEFAULT_OPACITY = 1;
/** Fraction of each color segment used for diamond/glass crossfade. */
const DEFAULT_COLOR_BLEND = 0.34;

type LogoDimension = number | string;
type LogoBlendMode = CSSProperties['mixBlendMode'];
type CssVars = CSSProperties & Record<`--${string}`, string | number | undefined>;

type Rgb = { r: number; g: number; b: number };

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
  /** Sequência visual (ex.: Apple Noir → cores das etapas). Cicla no mesmo loop do sprite. */
  colors?: string[];
  glowColor?: string;
  glowColors?: string[];
  glowSize?: LogoDimension;
  glowEnabled?: boolean;
  /** Janela de crossfade facetado entre cores (0–0.5). */
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

const clamp01 = (value: number, fallback: number) => {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(1, Math.max(0, value));
};

const normalizeSpeed = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) return DEFAULT_SPEED;
  return value;
};

const toCssSize = (value: LogoDimension | undefined, fallback: string) => {
  if (typeof value === 'number') return `${value}rem`;
  if (typeof value === 'string' && value.trim()) return value;
  return fallback;
};

const sanitizeId = (id: string) => id.replace(/[^a-zA-Z0-9_-]/g, '');

const parseColorToRgb = (input: string): Rgb | null => {
  const value = input.trim();
  if (value.startsWith('#')) {
    const hex = value.slice(1);
    if (hex.length === 3) {
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16)
      };
    }
    if (hex.length === 6) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16)
      };
    }
    return null;
  }

  const rgba = value.match(
    /^rgba?\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)(?:\s*,\s*[0-9.]+\s*)?\)$/i
  );
  if (!rgba) return null;
  return {
    r: Math.round(Number(rgba[1])),
    g: Math.round(Number(rgba[2])),
    b: Math.round(Number(rgba[3]))
  };
};

const rgbToCss = (rgb: Rgb, alpha = 1) =>
  alpha >= 1
    ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
    : `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;

const mixRgb = (a: Rgb, b: Rgb, t: number): Rgb => {
  const k = clamp01(t, 0);
  // Ease through the material — soft refraction, not a flat cut.
  const eased = k * k * (3 - 2 * k);
  return {
    r: Math.round(a.r + (b.r - a.r) * eased),
    g: Math.round(a.g + (b.g - a.g) * eased),
    b: Math.round(a.b + (b.b - a.b) * eased)
  };
};

const sampleColorSequence = (
  colors: string[],
  progress: number,
  blendWindow: number
): { primary: string; secondary: string; secondaryOpacity: number; glow: string | null } => {
  const count = colors.length;
  if (count === 0) {
    return { primary: DEFAULT_COLOR, secondary: DEFAULT_COLOR, secondaryOpacity: 0, glow: null };
  }
  if (count === 1) {
    return { primary: colors[0], secondary: colors[0], secondaryOpacity: 0, glow: null };
  }

  const segment = 1 / count;
  const scaled = ((progress % 1) + 1) % 1;
  const index = Math.min(count - 1, Math.floor(scaled / segment));
  const nextIndex = (index + 1) % count;
  const local = (scaled - index * segment) / segment;
  const blend = Math.min(0.5, Math.max(0.08, blendWindow));
  const blendStart = 1 - blend;

  const currentRgb = parseColorToRgb(colors[index]) ?? { r: 200, g: 204, b: 212 };
  const nextRgb = parseColorToRgb(colors[nextIndex]) ?? currentRgb;

  if (local < blendStart) {
    return {
      primary: rgbToCss(currentRgb),
      secondary: rgbToCss(nextRgb),
      secondaryOpacity: 0,
      glow: null
    };
  }

  const t = (local - blendStart) / blend;
  const mixed = mixRgb(currentRgb, nextRgb, t);
  // Secondary facet carries the incoming color as internal reflection.
  const secondaryOpacity = Math.sin(Math.PI * t) * 0.55;

  return {
    primary: rgbToCss(mixed),
    secondary: rgbToCss(nextRgb),
    secondaryOpacity,
    glow: null
  };
};

export function LogoAnimatedSprite({
  className,
  style,
  title = 'Animated glass logo',
  ariaHidden = false,
  size = DEFAULT_SIZE,
  width,
  height,
  widthRem,
  heightRem,
  speed = DEFAULT_SPEED,
  durationSeconds,
  color,
  primaryColor,
  colors,
  glowColor = DEFAULT_GLOW_COLOR,
  glowColors,
  glowSize = DEFAULT_GLOW_SIZE,
  glowEnabled = true,
  colorBlend = DEFAULT_COLOR_BLEND,
  tintOpacity = DEFAULT_TINT_OPACITY,
  textureStrength,
  sourceOpacity,
  opacity = DEFAULT_OPACITY,
  tintBlendMode = 'screen',
  paused = false,
  previewBackground = false
}: LogoAnimatedSpriteProps) {
  const baseId = sanitizeId(useId());
  const filterId = `logoTint${baseId}`;
  const filterSecondaryId = `logoTintSecondary${baseId}`;
  const clipId = `logoClip${baseId}`;
  const sourceRef = useRef<SVGImageElement | null>(null);
  const tintRef = useRef<SVGImageElement | null>(null);
  const tintSecondaryRef = useRef<SVGImageElement | null>(null);
  const floodRef = useRef<SVGFEFloodElement | null>(null);
  const floodSecondaryRef = useRef<SVGFEFloodElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);

  const colorSequence = useMemo(() => {
    if (colors && colors.length > 0) return colors;
    return [color ?? primaryColor ?? DEFAULT_COLOR];
  }, [colors, color, primaryColor]);

  const glowSequence = useMemo(() => {
    if (glowColors && glowColors.length > 0) return glowColors;
    return [glowColor];
  }, [glowColors, glowColor]);

  const resolvedColor = colorSequence[0] ?? DEFAULT_COLOR;
  const resolvedTextureStrength = sourceOpacity ?? textureStrength ?? DEFAULT_TEXTURE_STRENGTH;
  const resolvedWidth = toCssSize(width ?? (widthRem ? `${widthRem}rem` : size), DEFAULT_SIZE);
  const resolvedHeight = toCssSize(height ?? (heightRem ? `${heightRem}rem` : size), DEFAULT_SIZE);
  const resolvedGlowSize = toCssSize(glowSize, DEFAULT_GLOW_SIZE);
  const resolvedDuration = useMemo(() => {
    if (durationSeconds && durationSeconds > 0) return durationSeconds;
    return BASE_DURATION_SECONDS / normalizeSpeed(speed);
  }, [durationSeconds, speed]);
  const resolvedBlend = clamp01(colorBlend, DEFAULT_COLOR_BLEND);

  const customProperties: CssVars = {
    '--logo-width': resolvedWidth,
    '--logo-height': resolvedHeight,
    '--logo-color': resolvedColor,
    '--logo-glow-size': resolvedGlowSize,
    '--logo-glow-color': glowSequence[0] ?? glowColor,
    '--logo-shadow': glowEnabled
      ? `drop-shadow(0 0 ${resolvedGlowSize} ${glowSequence[0] ?? glowColor})`
      : 'none',
    '--logo-opacity': opacity,
    ...style
  };

  useEffect(() => {
    const sourceNode = sourceRef.current;
    const tintNode = tintRef.current;
    if (!sourceNode || !tintNode) return;

    const setFrame = (frame: number) => {
      const bounded = ((frame % FRAME_COUNT) + FRAME_COUNT) % FRAME_COUNT;
      const col = bounded % COLUMNS;
      const row = Math.floor(bounded / COLUMNS);
      const tx = -(col * FRAME_SIZE);
      const ty = -(row * FRAME_SIZE);
      const transform = `translate(${tx} ${ty})`;
      sourceNode.setAttribute('transform', transform);
      tintNode.setAttribute('transform', transform);
      tintSecondaryRef.current?.setAttribute('transform', transform);
    };

    const applyTint = (progress: number) => {
      const sample = sampleColorSequence(colorSequence, progress, resolvedBlend);
      floodRef.current?.setAttribute('flood-color', sample.primary);
      floodSecondaryRef.current?.setAttribute('flood-color', sample.secondary);
      if (tintSecondaryRef.current) {
        const baseTint = clamp01(tintOpacity, DEFAULT_TINT_OPACITY);
        tintSecondaryRef.current.setAttribute(
          'opacity',
          String(baseTint * sample.secondaryOpacity)
        );
      }

      const glowIndex = Math.min(
        glowSequence.length - 1,
        Math.floor((((progress % 1) + 1) % 1) * glowSequence.length)
      );
      const activeGlow = glowSequence[glowIndex] ?? glowSequence[0] ?? glowColor;
      if (svgRef.current && glowEnabled) {
        svgRef.current.style.setProperty(
          '--logo-shadow',
          `drop-shadow(0 0 ${resolvedGlowSize} ${activeGlow})`
        );
        svgRef.current.style.setProperty('--logo-glow-color', activeGlow);
        svgRef.current.style.setProperty('--logo-color', sample.primary);
      }
    };

    setFrame(0);
    applyTint(0);
    if (paused) return;

    const animate = (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp;
      const elapsedSeconds = ((timestamp - startRef.current) / 1000) % resolvedDuration;
      const progress = elapsedSeconds / resolvedDuration;
      const frame = Math.floor(progress * FRAME_COUNT);

      if (lastFrameRef.current !== frame) {
        lastFrameRef.current = frame;
        setFrame(frame);
      }

      // Color sampling stays continuous for glass refraction (not frame-quantized).
      applyTint(progress);

      rafRef.current = window.requestAnimationFrame(animate);
    };

    rafRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      startRef.current = null;
      lastFrameRef.current = null;
    };
  }, [
    paused,
    resolvedDuration,
    colorSequence,
    glowSequence,
    resolvedBlend,
    tintOpacity,
    glowEnabled,
    resolvedGlowSize,
    glowColor
  ]);

  return (
    <span className={previewBackground ? styles.previewShell : undefined}>
      <svg
        ref={svgRef}
        className={[styles.logo, className].filter(Boolean).join(' ')}
        style={customProperties}
        viewBox="0 0 480 480"
        role={ariaHidden ? undefined : 'img'}
        aria-hidden={ariaHidden || undefined}
        aria-label={ariaHidden ? undefined : title}
        xmlns="http://www.w3.org/2000/svg"
      >
        {!ariaHidden && <title>{title}</title>}

        <defs>
          <clipPath id={clipId}>
            <rect width="480" height="480" x="0" y="0" />
          </clipPath>

          <filter
            id={filterId}
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
            colorInterpolationFilters="sRGB"
          >
            <feFlood ref={floodRef} floodColor={resolvedColor} floodOpacity="1" result="color" />
            <feComposite in="color" in2="SourceAlpha" operator="in" result="tint" />
          </filter>

          <filter
            id={filterSecondaryId}
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
            colorInterpolationFilters="sRGB"
          >
            <feFlood
              ref={floodSecondaryRef}
              floodColor={colorSequence[1] ?? resolvedColor}
              floodOpacity="1"
              result="color"
            />
            <feComposite in="color" in2="SourceAlpha" operator="in" result="tint" />
          </filter>
        </defs>

        <g className={styles.stage} clipPath={`url(#${clipId})`}>
          <image
            ref={sourceRef}
            className={styles.sprite}
            width="9600"
            height="8160"
            href={SPRITE_SRC}
            preserveAspectRatio="none"
            opacity={clamp01(resolvedTextureStrength, DEFAULT_TEXTURE_STRENGTH)}
          />

          <image
            ref={tintRef}
            className={styles.sprite}
            width="9600"
            height="8160"
            href={SPRITE_SRC}
            preserveAspectRatio="none"
            opacity={clamp01(tintOpacity, DEFAULT_TINT_OPACITY)}
            filter={`url(#${filterId})`}
            style={{ mixBlendMode: tintBlendMode }}
          />

          <image
            ref={tintSecondaryRef}
            className={styles.sprite}
            width="9600"
            height="8160"
            href={SPRITE_SRC}
            preserveAspectRatio="none"
            opacity={0}
            filter={`url(#${filterSecondaryId})`}
            style={{ mixBlendMode: 'screen' }}
          />
        </g>
      </svg>
    </span>
  );
}

export default LogoAnimatedSprite;
