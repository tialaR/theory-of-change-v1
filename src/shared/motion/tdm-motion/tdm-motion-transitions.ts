import type { Transition } from 'motion/react';

/** Constantes canônicas de transição TDM para uso posterior em features. */
export const TDM_MOTION_TRANSITIONS = {
  micro: {
    duration: 0.12,
    ease: [0.2, 0.8, 0.2, 1]
  } satisfies Transition,
  control: {
    duration: 0.18,
    ease: [0.2, 0.8, 0.2, 1]
  } satisfies Transition,
  layout: {
    duration: 0.32,
    ease: [0.16, 1, 0.3, 1]
  } satisfies Transition,
  panel: {
    duration: 0.42,
    ease: [0.16, 1, 0.3, 1]
  } satisfies Transition,
  opacity: {
    duration: 0.18,
    ease: [0.2, 0.8, 0.2, 1]
  } satisfies Transition
} as const;

export type TdmMotionTransitionKey = keyof typeof TDM_MOTION_TRANSITIONS;
