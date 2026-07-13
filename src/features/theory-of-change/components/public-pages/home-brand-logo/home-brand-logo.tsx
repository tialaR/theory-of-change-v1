'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import styles from './home-brand-logo.module.sass';

export type HomeBrandLogoVariant = 'hero' | 'header';

const DESKTOP_SRC = '/assets/brand/logo-premium-alpha-1080.webm';
const MOBILE_SRC = '/assets/brand/logo-premium-alpha-720.webm';
const PNG_SRC = '/assets/brand/tdm-brand-icon.png';

function resolveVideoSrc(): string {
  if (typeof window === 'undefined') {
    return DESKTOP_SRC;
  }

  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  const prefersSmall =
    window.matchMedia('(max-width: 48rem)').matches ||
    connection?.saveData === true;

  return prefersSmall ? MOBILE_SRC : DESKTOP_SRC;
}

export function HomeBrandLogo({ variant }: { variant: HomeBrandLogoVariant }) {
  const reduced = useReducedMotion();
  const [videoSrc, setVideoSrc] = useState<string | null>(null);

  useEffect(() => {
    if (variant !== 'hero' || reduced) {
      return;
    }

    setVideoSrc(resolveVideoSrc());
  }, [variant, reduced]);

  if (variant === 'header') {
    return (
      <img
        className={styles.headerIcon}
        src={PNG_SRC}
        alt=""
        aria-hidden="true"
        width={32}
        height={32}
      />
    );
  }

  if (reduced || !videoSrc) {
    return (
      <div className={styles.heroRoot} aria-hidden="true">
        <img className={styles.heroImage} src={PNG_SRC} alt="" />
      </div>
    );
  }

  return (
    <div className={styles.heroRoot} aria-hidden="true">
      <video
        className={styles.heroVideo}
        src={videoSrc}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      />
    </div>
  );
}
