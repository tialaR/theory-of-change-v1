'use client';

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode
} from 'react';
import type { GlassSurfaceTuning, SurfaceStyle } from './types';
import styles from './glass-surface.module.sass';

export interface GlassSurfaceProps extends GlassSurfaceTuning {
  children?: ReactNode;
  width?: number | string;
  height?: number | string;
  className?: string;
  contentClassName?: string;
  style?: SurfaceStyle;
  ariaLabel?: string;
  mixBlendMode?: 'difference' | 'screen';
  /** Suspend dynamic SVG displacement while a parent transform animates. */
  staticFilter?: boolean;
}

const px = (value: number | string | undefined): string | undefined => {
  if (value === undefined) {
    return undefined;
  }

  return typeof value === 'number' ? `${value}px` : value;
};

function readLogicalSize(element: HTMLElement) {
  return {
    width: Math.max(1, Math.round(element.offsetWidth)),
    height: Math.max(1, Math.round(element.offsetHeight))
  };
}

export function GlassSurface({
  children,
  width,
  height = 'auto',
  borderRadius = 8,
  borderWidth = 0.02,
  brightness = 50,
  opacity = 1,
  blur = 11,
  displace = 5,
  backgroundOpacity = 0.02,
  saturation = 1,
  distortionScale = -180,
  redOffset = 0,
  greenOffset = 10,
  blueOffset = 20,
  xChannel = 'R',
  yChannel = 'G',
  mixBlendMode = 'difference',
  className = '',
  contentClassName = '',
  style,
  ariaLabel,
  staticFilter = false
}: GlassSurfaceProps) {
  const uniqueId = useId().replace(/:/g, '-');
  const filterId = `glass-filter-${uniqueId}`;
  const redGradId = `red-grad-${uniqueId}`;
  const blueGradId = `blue-grad-${uniqueId}`;
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 400, height: 200 });
  const [svgFilterSupported, setSvgFilterSupported] = useState(false);

  useEffect(() => {
    const element = containerRef.current;

    if (!element) {
      return;
    }

    const updateSize = (nextWidth: number, nextHeight: number) => {
      setSize((current) => {
        if (current.width === nextWidth && current.height === nextHeight) {
          return current;
        }

        return {
          width: nextWidth,
          height: nextHeight
        };
      });
    };

    const initial = readLogicalSize(element);
    updateSize(initial.width, initial.height);

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }

      const borderBox = Array.isArray(entry.borderBoxSize) ? entry.borderBoxSize[0] : entry.borderBoxSize;
      const nextWidth = Math.max(
        1,
        Math.round(borderBox?.inlineSize ?? entry.contentRect.width ?? element.offsetWidth)
      );
      const nextHeight = Math.max(
        1,
        Math.round(borderBox?.blockSize ?? entry.contentRect.height ?? element.offsetHeight)
      );

      updateSize(nextWidth, nextHeight);
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof CSS === 'undefined') {
      return;
    }

    const isFirefox = navigator.userAgent.includes('Firefox');
    const isSafari = navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome');
    const backdropAvailable = CSS.supports('backdrop-filter', `url(#${filterId})`);
    const frame = window.requestAnimationFrame(() => {
      setSvgFilterSupported(backdropAvailable && !isFirefox && !isSafari);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [filterId]);

  const useDynamicSvg = svgFilterSupported && !staticFilter;

  const edgeSize = Math.min(size.width, size.height) * (borderWidth * 0.5);
  const innerWidth = Math.max(0, size.width - edgeSize * 2);
  const innerHeight = Math.max(0, size.height - edgeSize * 2);
  const innerRadius = Math.max(0, borderRadius);

  const displacementMapHref = useMemo(() => {
    if (!useDynamicSvg) {
      return '';
    }

    const svgContent = `
      <svg viewBox="0 0 ${size.width} ${size.height}" xmlns="http://www.w3.org/2000/svg">
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
        <rect x="0" y="0" width="${size.width}" height="${size.height}" fill="black"/>
        <rect x="0" y="0" width="${size.width}" height="${size.height}" rx="${borderRadius}" fill="url(#${redGradId})"/>
        <rect x="0" y="0" width="${size.width}" height="${size.height}" rx="${borderRadius}" fill="url(#${blueGradId})" style="mix-blend-mode:${mixBlendMode}"/>
        <rect x="${edgeSize}" y="${edgeSize}" width="${innerWidth}" height="${innerHeight}" rx="${innerRadius}" fill="hsl(0 0% ${brightness}% / ${opacity})" style="filter:blur(${blur}px)"/>
      </svg>
    `;

    return `data:image/svg+xml,${encodeURIComponent(svgContent)}`;
  }, [
    blueGradId,
    blur,
    borderRadius,
    brightness,
    edgeSize,
    innerHeight,
    innerRadius,
    innerWidth,
    mixBlendMode,
    opacity,
    redGradId,
    size.height,
    size.width,
    useDynamicSvg
  ]);

  const mergedStyle = useMemo(() => {
    const customProperties = {
      '--glass-radius': `${borderRadius}px`,
      '--glass-opacity': opacity,
      '--glass-brightness': `${brightness}%`,
      '--glass-blur': `${blur}px`,
      '--glass-background-opacity': backgroundOpacity,
      '--glass-saturation': saturation,
      '--glass-filter': useDynamicSvg
        ? `url(#${filterId}) saturate(${saturation})`
        : `blur(${blur}px) saturate(${Math.max(1, saturation)}) brightness(${1 + brightness / 500})`,
      width: px(width),
      height: px(height),
      ...style
    } as CSSProperties;

    return customProperties;
  }, [
    backgroundOpacity,
    blur,
    borderRadius,
    brightness,
    filterId,
    height,
    opacity,
    saturation,
    style,
    useDynamicSvg,
    width
  ]);

  const surfaceClassNames = [
    styles.surface,
    useDynamicSvg ? styles.surfaceSvg : styles.surfaceFallback,
    className
  ]
    .filter(Boolean)
    .join(' ');

  const contentClassNames = [styles.content, contentClassName].filter(Boolean).join(' ');

  return (
    <div
      ref={containerRef}
      className={surfaceClassNames}
      style={mergedStyle}
      aria-label={ariaLabel}
      data-static-filter={staticFilter ? 'true' : 'false'}
    >
      {useDynamicSvg ? (
        <svg className={styles.filterSvg} width="0" height="0" aria-hidden="true">
          <defs>
            <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
              <feImage
                href={displacementMapHref}
                result="map"
                preserveAspectRatio="none"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="map"
                scale={distortionScale + redOffset}
                xChannelSelector={xChannel}
                yChannelSelector={yChannel}
                result="dispRed"
              />
              <feColorMatrix in="dispRed" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red" />
              <feDisplacementMap
                in="SourceGraphic"
                in2="map"
                scale={distortionScale + greenOffset}
                xChannelSelector={xChannel}
                yChannelSelector={yChannel}
                result="dispGreen"
              />
              <feColorMatrix in="dispGreen" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="green" />
              <feDisplacementMap
                in="SourceGraphic"
                in2="map"
                scale={distortionScale + blueOffset}
                xChannelSelector={xChannel}
                yChannelSelector={yChannel}
                result="dispBlue"
              />
              <feColorMatrix in="dispBlue" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="blue" />
              <feBlend in="red" in2="green" mode="screen" result="rg" />
              <feBlend in="rg" in2="blue" mode="screen" result="output" />
              <feGaussianBlur in="output" stdDeviation={displace} />
            </filter>
          </defs>
        </svg>
      ) : null}
      <span className={styles.liquidLight} aria-hidden="true" />
      <span className={styles.specular} aria-hidden="true" />
      <span className={styles.edgeLight} aria-hidden="true" />
      <div className={contentClassNames}>{children}</div>
    </div>
  );
}
