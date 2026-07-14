'use client';

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import styles from './glass-surface.module.sass';

export interface GlassSurfaceProps {
  children?: React.ReactNode;
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  borderWidth?: number;
  brightness?: number;
  opacity?: number;
  blur?: number;
  displace?: number;
  backgroundOpacity?: number;
  saturation?: number;
  distortionScale?: number;
  redOffset?: number;
  greenOffset?: number;
  blueOffset?: number;
  xChannel?: 'R' | 'G' | 'B';
  yChannel?: 'R' | 'G' | 'B';
  mixBlendMode?:
    | 'normal'
    | 'multiply'
    | 'screen'
    | 'overlay'
    | 'darken'
    | 'lighten'
    | 'color-dodge'
    | 'color-burn'
    | 'hard-light'
    | 'soft-light'
    | 'difference'
    | 'exclusion'
    | 'hue'
    | 'saturation'
    | 'color'
    | 'luminosity'
    | 'plus-darker'
    | 'plus-lighter';
  className?: string;
  style?: React.CSSProperties;
}

type GlassStyle = React.CSSProperties & {
  '--glass-frost': number;
  '--glass-saturation': number;
  '--glass-backdrop-blur': string;
  '--filter-id': string;
};

const DEFAULT_WIDTH = 200;
const DEFAULT_HEIGHT = 80;
const REM_BASE = 16;
const RESIZE_REFRESH_DELAY = 0;

function toCssSize(value: number | string) {
  return typeof value === 'number' ? `${value / REM_BASE}rem` : value;
}

function toCssRadius(value: number) {
  return `${value / REM_BASE}rem`;
}

function toCssBlur(value: number) {
  return `${value / REM_BASE}rem`;
}

function supportsSVGFilters(filterId: string) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;

  const isWebkit = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
  const isFirefox = /Firefox/.test(navigator.userAgent);

  if (isWebkit || isFirefox) return false;

  const probe = document.createElement('div');
  probe.style.backdropFilter = `url(#${filterId})`;

  return probe.style.backdropFilter !== '';
}

export function GlassSurface({
  children,
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  borderRadius = 20,
  borderWidth = 0.07,
  brightness = 50,
  opacity = 0.93,
  blur = 11,
  displace = 0,
  backgroundOpacity = 0,
  saturation = 1,
  distortionScale = -180,
  redOffset = 0,
  greenOffset = 10,
  blueOffset = 20,
  xChannel = 'R',
  yChannel = 'G',
  mixBlendMode = 'difference',
  className = '',
  style = {}
}: GlassSurfaceProps) {
  const reactId = useId();
  const safeId = useMemo(() => reactId.replace(/[^a-zA-Z0-9_-]/g, '') || 'surface', [reactId]);
  const filterId = `glass-filter-${safeId}`;
  const redGradId = `red-grad-${safeId}`;
  const blueGradId = `blue-grad-${safeId}`;
  const isBorderless = borderWidth <= 0;

  const [svgSupported, setSvgSupported] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const feImageRef = useRef<SVGFEImageElement>(null);
  const redChannelRef = useRef<SVGFEDisplacementMapElement>(null);
  const greenChannelRef = useRef<SVGFEDisplacementMapElement>(null);
  const blueChannelRef = useRef<SVGFEDisplacementMapElement>(null);
  const gaussianBlurRef = useRef<SVGFEGaussianBlurElement>(null);

  const generateDisplacementMap = useCallback(() => {
    const rect = containerRef.current?.getBoundingClientRect();
    const actualWidth = Math.max(rect?.width || DEFAULT_WIDTH, 1);
    const actualHeight = Math.max(rect?.height || DEFAULT_HEIGHT, 1);
    const edgeSize = Math.min(actualWidth, actualHeight) * (borderWidth * 0.5);
    const innerWidth = Math.max(actualWidth - edgeSize * 2, 1);
    const innerHeight = Math.max(actualHeight - edgeSize * 2, 1);

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
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${borderRadius}" fill="url(#${redGradId})" />
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${borderRadius}" fill="url(#${blueGradId})" style="mix-blend-mode: ${mixBlendMode}" />
        <rect x="${edgeSize}" y="${edgeSize}" width="${innerWidth}" height="${innerHeight}" rx="${borderRadius}" fill="hsl(0 0% ${brightness}% / ${opacity})" style="filter: blur(${blur}px)" />
      </svg>
    `;

    return `data:image/svg+xml,${encodeURIComponent(svgContent)}`;
  }, [blueGradId, blur, borderRadius, borderWidth, brightness, mixBlendMode, opacity, redGradId]);

  const updateDisplacementMap = useCallback(() => {
    feImageRef.current?.setAttribute('href', generateDisplacementMap());
  }, [generateDisplacementMap]);

  useEffect(() => {
    updateDisplacementMap();

    [
      { ref: redChannelRef, offset: redOffset },
      { ref: greenChannelRef, offset: greenOffset },
      { ref: blueChannelRef, offset: blueOffset }
    ].forEach(({ ref, offset }) => {
      if (!ref.current) return;

      ref.current.setAttribute('scale', (distortionScale + offset).toString());
      ref.current.setAttribute('xChannelSelector', xChannel);
      ref.current.setAttribute('yChannelSelector', yChannel);
    });

    gaussianBlurRef.current?.setAttribute('stdDeviation', displace.toString());
  }, [blueOffset, displace, distortionScale, greenOffset, redOffset, updateDisplacementMap, xChannel, yChannel]);

  useEffect(() => {
    if (!containerRef.current || typeof ResizeObserver === 'undefined') return undefined;

    const resizeObserver = new ResizeObserver(() => {
      window.setTimeout(updateDisplacementMap, RESIZE_REFRESH_DELAY);
    });

    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [updateDisplacementMap]);

  useEffect(() => {
    window.setTimeout(updateDisplacementMap, RESIZE_REFRESH_DELAY);
  }, [height, updateDisplacementMap, width]);

  useEffect(() => {
    setSvgSupported(supportsSVGFilters(filterId));
  }, [filterId]);

  const containerStyle: GlassStyle = {
    ...style,
    width: toCssSize(width),
    height: toCssSize(height),
    borderRadius: toCssRadius(borderRadius),
    '--glass-frost': backgroundOpacity,
    '--glass-saturation': saturation,
    '--glass-backdrop-blur': toCssBlur(blur),
    '--filter-id': `url(#${filterId})`
  };

  const classNames = [styles.surface, svgSupported ? styles.svg : styles.fallback, className].filter(Boolean).join(' ');

  return (
    <div ref={containerRef} className={classNames} data-borderless={isBorderless ? 'true' : undefined} style={containerStyle}>
      <svg className={styles.filter} xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
        <defs>
          <filter id={filterId} colorInterpolationFilters="sRGB" x="0%" y="0%" width="100%" height="100%">
            <feImage ref={feImageRef} x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="map" />
            <feDisplacementMap ref={redChannelRef} in="SourceGraphic" in2="map" result="dispRed" />
            <feColorMatrix in="dispRed" type="matrix" values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" result="red" />
            <feDisplacementMap ref={greenChannelRef} in="SourceGraphic" in2="map" result="dispGreen" />
            <feColorMatrix in="dispGreen" type="matrix" values="0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0" result="green" />
            <feDisplacementMap ref={blueChannelRef} in="SourceGraphic" in2="map" result="dispBlue" />
            <feColorMatrix in="dispBlue" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0" result="blue" />
            <feBlend in="red" in2="green" mode="screen" result="rg" />
            <feBlend in="rg" in2="blue" mode="screen" result="output" />
            <feGaussianBlur ref={gaussianBlurRef} in="output" stdDeviation="0.7" />
          </filter>
        </defs>
      </svg>
      <div className={styles.content}>{children}</div>
    </div>
  );
}

export default GlassSurface;
