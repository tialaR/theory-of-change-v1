"use client";

import { CSSProperties, useEffect, useId, useMemo, useRef } from "react";
import styles from "./liquid-glass-logo-infinite-loop.module.sass";

type CssVars = CSSProperties & Record<`--${string}`, string | number | undefined>;
type LogoDimension = number | string;
type BlendMode = CSSProperties["mixBlendMode"];
type SpriteQuality = "full" | "sidebar";

const FULL_SPRITE_SRC = "/theory-of-change/liquid-glass-logo-sprite-transparent.png";
const SIDEBAR_SPRITE_SRC = "/theory-of-change/liquid-glass-logo-sprite-sidebar.webp";
const FRAME_SIZE = 480;
const FRAME_COUNT = 335;
const COLUMNS = 20;
const ROWS = 17;
const SOURCE_DURATION_SECONDS = 5.568333333333333;
const SOURCE_FPS = FRAME_COUNT / SOURCE_DURATION_SECONDS;
const LOOP_SPAN = (FRAME_COUNT - 1) * 2;

const DEFAULT_SIZE = "12rem";
const DEFAULT_COLOR = "#ffffff";
const DEFAULT_OPACITY = 1;
const DEFAULT_TEXTURE_STRENGTH = 0.68;
const DEFAULT_TINT_OPACITY = 0.72;
const DEFAULT_GLOW_SIZE = "1.15rem";
const DEFAULT_BACKGROUND_COLOR = "#000000";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const normalizeSpeed = (value?: number) => (!Number.isFinite(value) || !value || value <= 0 ? 1 : value);
const sanitizeId = (value: string) => value.replace(/[^a-zA-Z0-9_-]/g, "");

const colorToRgba = (value: string, alpha: number) => {
  const trimmed = value.trim();
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(trimmed)) {
    const hex = trimmed.slice(1);
    const expanded = hex.length === 3 ? hex.split("").map((char) => `${char}${char}`).join("") : hex;
    const r = Number.parseInt(expanded.slice(0, 2), 16);
    const g = Number.parseInt(expanded.slice(2, 4), 16);
    const b = Number.parseInt(expanded.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  if (trimmed.toLowerCase().startsWith("rgb")) return trimmed;
  return `color-mix(in srgb, ${trimmed} ${Math.round(alpha * 100)}%, transparent)`;
};

const toCssSize = (value: LogoDimension | undefined, fallback = DEFAULT_SIZE) => {
  if (typeof value === "number") return `${value}rem`;
  if (typeof value === "string" && value.trim()) return value;
  return fallback;
};

const setSpriteFrame = (node: SVGImageElement | null, frameIndex: number) => {
  if (!node) return;
  const safeFrame = Math.min(FRAME_COUNT - 1, Math.max(0, frameIndex));
  const column = safeFrame % COLUMNS;
  const row = Math.floor(safeFrame / COLUMNS);
  node.setAttribute("transform", `translate(${-column * FRAME_SIZE} ${-row * FRAME_SIZE})`);
};

const setOpacity = (node: SVGImageElement | null, value: number) => {
  if (!node) return;
  node.setAttribute("opacity", String(clamp(value, 0, 1)));
};

export type LiquidGlassLogoInfiniteLoopProps = {
  className?: string;
  style?: CSSProperties;
  title?: string;
  ariaHidden?: boolean;

  /** Square size. Number = rem. String accepts any CSS unit, including clamp(). */
  size?: LogoDimension;
  width?: LogoDimension;
  height?: LogoDimension;

  /** 1 = original motion speed. 2 = faster. 0.5 = slower. */
  speed?: number;
  /** Optional speed used while the pointer is over the component. Does not reset the animation. */
  hoverSpeed?: number;

  /** Color tint applied over the original texture. */
  color?: string;
  glowColor?: string;
  glowSize?: LogoDimension;
  glowEnabled?: boolean;

  opacity?: number;
  textureStrength?: number;
  tintOpacity?: number;
  tintBlendMode?: BlendMode;
  /** Extra glass glow/contrast without changing the frame animation. 1 is default. */
  glassIntensity?: number;

  showBackground?: boolean;
  backgroundColor?: string;
  backgroundGlow?: boolean;
  paused?: boolean;

  /** "full" keeps the original sprite. "sidebar" uses the lighter WebP sprite included in /public. */
  spriteQuality?: SpriteQuality;
  /** Optional custom sprite path. Useful for CDN/cache-busted assets. */
  spriteSrc?: string;
};

export default function LiquidGlassLogoInfiniteLoop({
  className,
  style,
  title = "Liquid glass infinite loop logo",
  ariaHidden = false,
  size = DEFAULT_SIZE,
  width,
  height,
  speed = 1,
  hoverSpeed,
  color = DEFAULT_COLOR,
  glowColor,
  glowSize = DEFAULT_GLOW_SIZE,
  glowEnabled = true,
  opacity = DEFAULT_OPACITY,
  textureStrength = DEFAULT_TEXTURE_STRENGTH,
  tintOpacity = DEFAULT_TINT_OPACITY,
  tintBlendMode = "screen",
  glassIntensity = 1,
  showBackground = false,
  backgroundColor = DEFAULT_BACKGROUND_COLOR,
  backgroundGlow = true,
  paused = false,
  spriteQuality = "full",
  spriteSrc,
}: LiquidGlassLogoInfiniteLoopProps) {
  const sourceARef = useRef<SVGImageElement | null>(null);
  const sourceBRef = useRef<SVGImageElement | null>(null);
  const tintARef = useRef<SVGImageElement | null>(null);
  const tintBRef = useRef<SVGImageElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  const phaseRef = useRef(0);
  const speedRef = useRef(normalizeSpeed(speed));

  const baseId = sanitizeId(useId());
  const clipId = `lgLoopClip${baseId}`;
  const tintFilterId = `lgLoopTint${baseId}`;
  const shellGlowGradientId = `lgLoopShellGlow${baseId}`;

  const resolvedWidth = toCssSize(width ?? size);
  const resolvedHeight = toCssSize(height ?? size);
  const resolvedGlowSize = toCssSize(glowSize, DEFAULT_GLOW_SIZE);
  const baseSpeed = useMemo(() => normalizeSpeed(speed), [speed]);
  const resolvedHoverSpeed = hoverSpeed ? normalizeSpeed(hoverSpeed) : undefined;
  const resolvedTextureStrength = clamp(textureStrength, 0, 1);
  const resolvedTintOpacity = clamp(tintOpacity, 0, 1);
  const resolvedGlassIntensity = clamp(glassIntensity, 0, 2.5);
  const resolvedGlowColor = glowColor ?? colorToRgba(color, 0.44);
  const softWhiteGlow = `rgba(255, 255, 255, ${0.12 + resolvedGlassIntensity * 0.08})`;
  const resolvedSpriteSrc = spriteSrc ?? (spriteQuality === "sidebar" ? SIDEBAR_SPRITE_SRC : FULL_SPRITE_SRC);
  const isHoverInteractive = Boolean(resolvedHoverSpeed);

  const cssVars: CssVars = {
    "--lg-loop-width": resolvedWidth,
    "--lg-loop-height": resolvedHeight,
    "--lg-loop-opacity": clamp(opacity, 0, 1),
    "--lg-loop-bg-opacity": showBackground ? 1 : 0,
    "--lg-loop-bg-color": backgroundColor,
    "--lg-loop-shadow": glowEnabled
      ? `drop-shadow(0 0 ${resolvedGlowSize} ${resolvedGlowColor}) drop-shadow(0 0 calc(${resolvedGlowSize} * 0.55) ${softWhiteGlow}) brightness(${1 + resolvedGlassIntensity * 0.04}) contrast(${1 + resolvedGlassIntensity * 0.08}) saturate(${1 + resolvedGlassIntensity * 0.28})`
      : `brightness(${1 + resolvedGlassIntensity * 0.04}) contrast(${1 + resolvedGlassIntensity * 0.08}) saturate(${1 + resolvedGlassIntensity * 0.28})`,
    "--lg-loop-shell-glow-opacity": backgroundGlow ? Math.min(1, 0.35 + resolvedGlassIntensity * 0.35) : 0,
    ...style,
  };

  useEffect(() => {
    speedRef.current = baseSpeed;
  }, [baseSpeed]);

  useEffect(() => {
    const draw = (position: number) => {
      const lower = Math.floor(position);
      const upper = Math.min(FRAME_COUNT - 1, lower + 1);
      const mix = clamp(position - lower, 0, 1);
      const lowerWeight = 1 - mix;
      const upperWeight = mix;

      setSpriteFrame(sourceARef.current, lower);
      setSpriteFrame(tintARef.current, lower);
      setSpriteFrame(sourceBRef.current, upper);
      setSpriteFrame(tintBRef.current, upper);

      setOpacity(sourceARef.current, resolvedTextureStrength * lowerWeight);
      setOpacity(sourceBRef.current, resolvedTextureStrength * upperWeight);
      setOpacity(tintARef.current, resolvedTintOpacity * lowerWeight);
      setOpacity(tintBRef.current, resolvedTintOpacity * upperWeight);
    };

    draw(0);
    if (paused) return;

    const animate = (timestamp: number) => {
      if (lastTimestampRef.current === null) lastTimestampRef.current = timestamp;
      const deltaSeconds = Math.max(0, (timestamp - lastTimestampRef.current) / 1000);
      lastTimestampRef.current = timestamp;

      phaseRef.current = (phaseRef.current + deltaSeconds * SOURCE_FPS * speedRef.current) % LOOP_SPAN;
      const position = phaseRef.current <= FRAME_COUNT - 1 ? phaseRef.current : LOOP_SPAN - phaseRef.current;

      draw(position);
      rafRef.current = window.requestAnimationFrame(animate);
    };

    rafRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTimestampRef.current = null;
    };
  }, [paused, resolvedTextureStrength, resolvedTintOpacity]);

  const handlePointerEnter = () => {
    if (resolvedHoverSpeed) speedRef.current = resolvedHoverSpeed;
  };

  const handlePointerLeave = () => {
    speedRef.current = baseSpeed;
  };

  return (
    <svg
      className={[styles.logo, isHoverInteractive ? styles.interactive : undefined, className].filter(Boolean).join(" ")}
      style={cssVars}
      viewBox="0 0 480 480"
      xmlns="http://www.w3.org/2000/svg"
      role={ariaHidden ? undefined : "img"}
      aria-hidden={ariaHidden || undefined}
      aria-label={ariaHidden ? undefined : title}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      {!ariaHidden && <title>{title}</title>}
      <defs>
        <clipPath id={clipId}>
          <rect x="0" y="0" width="480" height="480" />
        </clipPath>
        <filter id={tintFilterId} x="-25%" y="-25%" width="150%" height="150%" colorInterpolationFilters="sRGB">
          <feFlood floodColor={color} floodOpacity="1" result="flood" />
          <feComposite in="flood" in2="SourceAlpha" operator="in" result="tint" />
        </filter>
        <radialGradient id={shellGlowGradientId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity={0.10 + resolvedGlassIntensity * 0.08} />
          <stop offset="48%" stopColor="#ffffff" stopOpacity={0.045 + resolvedGlassIntensity * 0.045} />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect className={styles.background} x="0" y="0" width="480" height="480" />
      <ellipse className={styles.shellGlow} cx="240" cy="240" rx="170" ry="170" fill={`url(#${shellGlowGradientId})`} />

      <g className={styles.stage} clipPath={`url(#${clipId})`}>
        <image ref={sourceARef} className={styles.sprite} href={resolvedSpriteSrc} width={FRAME_SIZE * COLUMNS} height={FRAME_SIZE * ROWS} preserveAspectRatio="none" />
        <image ref={sourceBRef} className={styles.sprite} href={resolvedSpriteSrc} width={FRAME_SIZE * COLUMNS} height={FRAME_SIZE * ROWS} preserveAspectRatio="none" />
        <image ref={tintARef} className={styles.sprite} href={resolvedSpriteSrc} width={FRAME_SIZE * COLUMNS} height={FRAME_SIZE * ROWS} preserveAspectRatio="none" filter={`url(#${tintFilterId})`} style={{ mixBlendMode: tintBlendMode }} />
        <image ref={tintBRef} className={styles.sprite} href={resolvedSpriteSrc} width={FRAME_SIZE * COLUMNS} height={FRAME_SIZE * ROWS} preserveAspectRatio="none" filter={`url(#${tintFilterId})`} style={{ mixBlendMode: tintBlendMode }} />
      </g>
    </svg>
  );
}
