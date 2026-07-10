'use client';

import { CSSProperties, useEffect, useId, useMemo, useRef } from "react";
import styles from "./logo-animated-sprite.module.sass";
import spriteAsset from "./logo-sprite-transparent-complete.png";

type SpriteAsset = string | { src: string };

const getAssetSrc = (asset: SpriteAsset) => (typeof asset === "string" ? asset : asset.src);
const SPRITE_SRC = getAssetSrc(spriteAsset as SpriteAsset);

const FRAME_SIZE = 480;
const FRAME_COUNT = 335;
const COLUMNS = 20;
const BASE_DURATION_SECONDS = 5.568333333333333;
const DEFAULT_SPEED = 1;
const DEFAULT_SIZE = "12rem";
const DEFAULT_COLOR = "#8BE9FD";
const DEFAULT_GLOW_COLOR = "rgba(139, 233, 253, 0.44)";
const DEFAULT_GLOW_SIZE = "1.45rem";
const DEFAULT_TINT_OPACITY = 0.26;
const DEFAULT_TEXTURE_STRENGTH = 0.92;
const DEFAULT_OPACITY = 1;

type LogoDimension = number | string;
type LogoBlendMode = CSSProperties["mixBlendMode"];
type CssVars = CSSProperties & Record<`--${string}`, string | number | undefined>;

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
  glowColor?: string;
  glowSize?: LogoDimension;
  glowEnabled?: boolean;

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
  if (typeof value === "number") return `${value}rem`;
  if (typeof value === "string" && value.trim()) return value;
  return fallback;
};

const sanitizeId = (id: string) => id.replace(/[^a-zA-Z0-9_-]/g, "");

export function LogoAnimatedSprite({
  className,
  style,
  title = "Animated glass logo",
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
  glowColor = DEFAULT_GLOW_COLOR,
  glowSize = DEFAULT_GLOW_SIZE,
  glowEnabled = true,
  tintOpacity = DEFAULT_TINT_OPACITY,
  textureStrength,
  sourceOpacity,
  opacity = DEFAULT_OPACITY,
  tintBlendMode = "screen",
  paused = false,
  previewBackground = false,
}: LogoAnimatedSpriteProps) {
  const baseId = sanitizeId(useId());
  const filterId = `logoTint${baseId}`;
  const clipId = `logoClip${baseId}`;
  const sourceRef = useRef<SVGImageElement | null>(null);
  const tintRef = useRef<SVGImageElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);

  const resolvedColor = color ?? primaryColor ?? DEFAULT_COLOR;
  const resolvedTextureStrength = sourceOpacity ?? textureStrength ?? DEFAULT_TEXTURE_STRENGTH;
  const resolvedWidth = toCssSize(width ?? (widthRem ? `${widthRem}rem` : size), DEFAULT_SIZE);
  const resolvedHeight = toCssSize(height ?? (heightRem ? `${heightRem}rem` : size), DEFAULT_SIZE);
  const resolvedGlowSize = toCssSize(glowSize, DEFAULT_GLOW_SIZE);
  const resolvedDuration = useMemo(() => {
    if (durationSeconds && durationSeconds > 0) return durationSeconds;
    return BASE_DURATION_SECONDS / normalizeSpeed(speed);
  }, [durationSeconds, speed]);

  const customProperties: CssVars = {
    "--logo-width": resolvedWidth,
    "--logo-height": resolvedHeight,
    "--logo-color": resolvedColor,
    "--logo-glow-size": resolvedGlowSize,
    "--logo-glow-color": glowColor,
    "--logo-shadow": glowEnabled ? `drop-shadow(0 0 ${resolvedGlowSize} ${glowColor})` : "none",
    "--logo-opacity": opacity,
    ...style,
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
      sourceNode.setAttribute("transform", transform);
      tintNode.setAttribute("transform", transform);
    };

    setFrame(0);
    if (paused) return;

    const animate = (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp;
      const elapsedSeconds = ((timestamp - startRef.current) / 1000) % resolvedDuration;
      const frame = Math.floor((elapsedSeconds / resolvedDuration) * FRAME_COUNT);

      if (lastFrameRef.current !== frame) {
        lastFrameRef.current = frame;
        setFrame(frame);
      }

      rafRef.current = window.requestAnimationFrame(animate);
    };

    rafRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      startRef.current = null;
      lastFrameRef.current = null;
    };
  }, [paused, resolvedDuration]);

  return (
    <span className={previewBackground ? styles.previewShell : undefined}>
      <svg
        className={[styles.logo, className].filter(Boolean).join(" ")}
        style={customProperties}
        viewBox="0 0 480 480"
        role={ariaHidden ? undefined : "img"}
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
            <feFlood floodColor={resolvedColor} floodOpacity="1" result="color" />
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
        </g>
      </svg>
    </span>
  );
}

export default LogoAnimatedSprite;
