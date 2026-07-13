'use client';

import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import type { TdmStage } from '../../domain/tdm-stages';
import styles from './tdm-glass-surface.module.sass';

export type TdmGlassVariant = 'subtle' | 'default' | 'strong';
export type TdmGlassStage = 'inputs' | 'activities' | 'outputs' | 'outcomes' | 'neutral';

export type TdmGlassSurfaceProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  variant?: TdmGlassVariant;
  stage?: TdmGlassStage;
  interactive?: boolean;
  showStageDot?: boolean;
  borderRadius?: number;
  style?: CSSProperties;
};

type GlassPreset = {
  borderWidth: number;
  brightness: number;
  opacity: number;
  blur: number;
  displace: number;
  backgroundOpacity: number;
  saturation: number;
  distortionScale: number;
  redOffset: number;
  greenOffset: number;
  blueOffset: number;
  defaultRadius: number;
};

const VARIANT_PRESETS: Record<TdmGlassVariant, GlassPreset> = {
  subtle: {
    borderWidth: 0.08,
    brightness: 62,
    opacity: 0.1,
    blur: 7,
    displace: 0.8,
    backgroundOpacity: 0.16,
    saturation: 1.04,
    distortionScale: -32,
    redOffset: -2,
    greenOffset: 1,
    blueOffset: 3,
    defaultRadius: 11
  },
  default: {
    borderWidth: 0.1,
    brightness: 70,
    opacity: 0.14,
    blur: 10,
    displace: 1.2,
    backgroundOpacity: 0.18,
    saturation: 1.05,
    distortionScale: -40,
    redOffset: -3,
    greenOffset: 2,
    blueOffset: 5,
    defaultRadius: 11
  },
  strong: {
    borderWidth: 0.12,
    brightness: 68,
    opacity: 0.16,
    blur: 11,
    displace: 1.4,
    backgroundOpacity: 0.22,
    saturation: 1.06,
    distortionScale: -48,
    redOffset: -4,
    greenOffset: 2,
    blueOffset: 6,
    defaultRadius: 11
  }
};

const STAGE_CLASS: Record<TdmGlassStage, string> = {
  inputs: styles.stageInputs,
  activities: styles.stageActivities,
  outputs: styles.stageOutputs,
  outcomes: styles.stageOutcomes,
  neutral: styles.stageNeutral
};

export function tdmStageToGlassStage(stage: TdmStage): TdmGlassStage {
  const map: Record<TdmStage, TdmGlassStage> = {
    input: 'inputs',
    activity: 'activities',
    output: 'outputs',
    outcome: 'outcomes'
  };

  return map[stage];
}

function supportsSvgBackdropFilter(filterId: string): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }

  const isWebkit = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
  const isFirefox = /Firefox/.test(navigator.userAgent);

  if (isWebkit || isFirefox) {
    return false;
  }

  const div = document.createElement('div');
  div.style.backdropFilter = `url(#${filterId})`;

  return div.style.backdropFilter !== '';
}

export function TdmGlassSurface({
  children,
  className = '',
  contentClassName = '',
  variant = 'default',
  stage = 'neutral',
  interactive = false,
  showStageDot = false,
  borderRadius,
  style
}: TdmGlassSurfaceProps) {
  const preset = VARIANT_PRESETS[variant];
  const resolvedRadius = borderRadius ?? preset.defaultRadius;

  const uniqueId = useId().replace(/:/g, '-');
  const filterId = `tdm-glass-filter-${uniqueId}`;
  const redGradId = `tdm-red-grad-${uniqueId}`;
  const blueGradId = `tdm-blue-grad-${uniqueId}`;

  const [svgSupported, setSvgSupported] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const feImageRef = useRef<SVGFEImageElement>(null);
  const redChannelRef = useRef<SVGFEDisplacementMapElement>(null);
  const greenChannelRef = useRef<SVGFEDisplacementMapElement>(null);
  const blueChannelRef = useRef<SVGFEDisplacementMapElement>(null);
  const gaussianBlurRef = useRef<SVGFEGaussianBlurElement>(null);

  const generateDisplacementMap = useCallback(() => {
    const rect = containerRef.current?.getBoundingClientRect();
    const actualWidth = rect?.width || 400;
    const actualHeight = rect?.height || 200;
    const edgeSize = Math.min(actualWidth, actualHeight) * (preset.borderWidth * 0.5);

    const svgContent = `
      <svg viewBox="0 0 ${actualWidth} ${actualHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="${redGradId}" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="red"/>
          </linearGradient>
          <linearGradient id="${blueGradId}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="blue"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" fill="black"></rect>
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${resolvedRadius}" fill="url(#${redGradId})" />
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${resolvedRadius}" fill="url(#${blueGradId})" style="mix-blend-mode: difference" />
        <rect x="${edgeSize}" y="${edgeSize}" width="${actualWidth - edgeSize * 2}" height="${actualHeight - edgeSize * 2}" rx="${resolvedRadius}" fill="hsl(0 0% ${preset.brightness}% / ${preset.opacity})" style="filter:blur(${preset.blur}px)" />
      </svg>
    `;

    return `data:image/svg+xml,${encodeURIComponent(svgContent)}`;
  }, [blueGradId, preset.blur, preset.borderWidth, preset.brightness, preset.opacity, redGradId, resolvedRadius]);

  const updateDisplacementMap = useCallback(() => {
    feImageRef.current?.setAttribute('href', generateDisplacementMap());

    [
      { ref: redChannelRef, offset: preset.redOffset },
      { ref: greenChannelRef, offset: preset.greenOffset },
      { ref: blueChannelRef, offset: preset.blueOffset }
    ].forEach(({ ref, offset }) => {
      if (ref.current) {
        ref.current.setAttribute('scale', (preset.distortionScale + offset).toString());
        ref.current.setAttribute('xChannelSelector', 'R');
        ref.current.setAttribute('yChannelSelector', 'G');
      }
    });

    gaussianBlurRef.current?.setAttribute('stdDeviation', preset.displace.toString());
  }, [generateDisplacementMap, preset]);

  useEffect(() => {
    updateDisplacementMap();
  }, [updateDisplacementMap, resolvedRadius, variant]);

  useEffect(() => {
    const node = containerRef.current;

    if (!node) {
      return;
    }

    const resizeObserver = new ResizeObserver(() => {
      window.requestAnimationFrame(updateDisplacementMap);
    });

    resizeObserver.observe(node);

    return () => {
      resizeObserver.disconnect();
    };
  }, [updateDisplacementMap]);

  useEffect(() => {
    setSvgSupported(supportsSvgBackdropFilter(filterId));
  }, [filterId]);

  const containerStyle = {
    ...style,
    borderRadius: `${resolvedRadius}px`,
    '--tdm-glass-frost': preset.backgroundOpacity,
    '--tdm-glass-saturation': preset.saturation,
    '--tdm-filter-id': `url(#${filterId})`
  } as CSSProperties;

  const surfaceClassName = [
    styles.surface,
    svgSupported ? styles.surfaceSvg : styles.surfaceFallback,
    styles[`variant${variant.charAt(0).toUpperCase()}${variant.slice(1)}` as keyof typeof styles],
    STAGE_CLASS[stage],
    interactive ? styles.interactive : '',
    showStageDot ? styles.withStageDot : '',
    className
  ]
    .filter(Boolean)
    .join(' ');

  const contentClassNames = [styles.content, contentClassName].filter(Boolean).join(' ');

  return (
    <div ref={containerRef} className={surfaceClassName} style={containerStyle}>
      <svg className={styles.filterSvg} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <filter id={filterId} colorInterpolationFilters="sRGB" x="0%" y="0%" width="100%" height="100%">
            <feImage ref={feImageRef} x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="map" />

            <feDisplacementMap ref={redChannelRef} in="SourceGraphic" in2="map" result="dispRed" />
            <feColorMatrix
              in="dispRed"
              type="matrix"
              values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="red"
            />

            <feDisplacementMap ref={greenChannelRef} in="SourceGraphic" in2="map" result="dispGreen" />
            <feColorMatrix
              in="dispGreen"
              type="matrix"
              values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="green"
            />

            <feDisplacementMap ref={blueChannelRef} in="SourceGraphic" in2="map" result="dispBlue" />
            <feColorMatrix
              in="dispBlue"
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
              result="blue"
            />

            <feBlend in="red" in2="green" mode="screen" result="rg" />
            <feBlend in="rg" in2="blue" mode="screen" result="output" />
            <feGaussianBlur ref={gaussianBlurRef} in="output" stdDeviation="0.7" />
          </filter>
        </defs>
      </svg>

      <span className={styles.edgeHighlight} aria-hidden="true" />
      <span className={styles.stageDot} aria-hidden="true" />

      <div className={contentClassNames}>{children}</div>
    </div>
  );
}
