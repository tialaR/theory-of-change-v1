'use client';

import dynamic from 'next/dynamic';
import { useSyncExternalStore } from 'react';
import styles from './page.module.sass';

const ColorBends = dynamic(() => import('@/components/ColorBends/ColorBends'), { ssr: false });

function subscribeReducedMotion(onStoreChange: () => void) {
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  media.addEventListener('change', onStoreChange);
  return () => media.removeEventListener('change', onStoreChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

export function HomeColorBendsBackground() {
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  return (
    <div aria-hidden="true" className={styles.colorBendsLayer}>
      <ColorBends
        color="#4e4c50"
        speed={prefersReducedMotion ? 0 : 0.2}
        frequency={1}
        noise={0.15}
        bandWidth={0.14}
        rotation={90}
        fadeTop={0.75}
        iterations={1}
        intensity={1.3}
      />
    </div>
  );
}
