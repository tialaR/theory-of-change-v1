'use client';

import { motion } from 'motion/react';
import {
  EDITORIAL_PREVIEW_MOTION,
  getEditorialConnectionDelay,
} from './example-preview-motion';
import styles from './example-previews.module.sass';

export type EditorialConnectionDef = {
  d: string;
  group: number;
  item: number;
};

export type EditorialConnectionProps = {
  d: string;
  delay: number;
  active?: boolean;
  shouldReduceMotion: boolean;
};

export function EditorialArrowMarker() {
  return (
    <marker
      id="editorialArrow"
      viewBox="0 0 5 5"
      markerWidth="5"
      markerHeight="5"
      refX="4.15"
      refY="2.5"
      orient="auto"
      markerUnits="userSpaceOnUse"
    >
      <path
        d="M 0.75 0.75 L 4 2.5 L 0.75 4.25"
        fill="none"
        stroke="rgba(238, 240, 243, 0.56)"
        strokeWidth="0.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </marker>
  );
}

export function EditorialConnection({
  d,
  delay,
  active,
  shouldReduceMotion,
}: EditorialConnectionProps) {
  return (
    <>
      <path
        d={d}
        className={styles.editorialConnectionBase}
        markerEnd="url(#editorialArrow)"
        vectorEffect="non-scaling-stroke"
      />
      <motion.path
        d={d}
        className={styles.editorialConnectionReveal}
        vectorEffect="non-scaling-stroke"
        initial={{
          pathLength: shouldReduceMotion ? 1 : 0,
          opacity: 0,
        }}
        animate={
          active && !shouldReduceMotion
            ? {
                pathLength: 1,
                opacity: [0, EDITORIAL_PREVIEW_MOTION.opacity.activeConnection, EDITORIAL_PREVIEW_MOTION.opacity.activeConnection, 0],
              }
            : {
                pathLength: shouldReduceMotion ? 1 : 0,
                opacity: 0,
              }
        }
        transition={{
          pathLength: {
            duration: EDITORIAL_PREVIEW_MOTION.connection.duration,
            delay,
            ease: EDITORIAL_PREVIEW_MOTION.ease,
          },
          opacity: {
            duration: 0.92,
            delay,
            times: [0, 0.12, 0.76, 1],
            ease: EDITORIAL_PREVIEW_MOTION.ease,
          },
        }}
      />
    </>
  );
}

export function EditorialConnections({
  connections,
  active,
  shouldReduceMotion,
}: {
  connections: readonly EditorialConnectionDef[];
  active?: boolean;
  shouldReduceMotion: boolean;
}) {
  return (
    <>
      {connections.map((connection) => (
        <EditorialConnection
          key={connection.d}
          d={connection.d}
          delay={
            shouldReduceMotion
              ? 0
              : getEditorialConnectionDelay(connection.group, connection.item)
          }
          active={active}
          shouldReduceMotion={shouldReduceMotion}
        />
      ))}
    </>
  );
}

export function useEditorialSurfaceMotion(shouldReduceMotion: boolean) {
  const offsetY = shouldReduceMotion ? 0 : EDITORIAL_PREVIEW_MOTION.surface.offsetY;

  return {
    initial: {
      opacity: 0.94,
      y: offsetY,
    },
    animate: {
      opacity: 1,
      y: 0,
    },
    transition: {
      duration: shouldReduceMotion ? 0 : EDITORIAL_PREVIEW_MOTION.surface.duration,
      ease: EDITORIAL_PREVIEW_MOTION.ease,
    },
  } as const;
}

export { getEditorialConnectionDelay, EDITORIAL_PREVIEW_MOTION };
