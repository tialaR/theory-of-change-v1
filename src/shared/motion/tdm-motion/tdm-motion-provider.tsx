'use client';

import { MotionConfig } from 'motion/react';
import type { ReactNode } from 'react';
import { TDM_MOTION_TRANSITIONS } from './tdm-motion-transitions';

export type TdmMotionProviderProps = {
  children: ReactNode;
};

export function TdmMotionProvider({ children }: TdmMotionProviderProps) {
  return (
    <MotionConfig reducedMotion="user" transition={TDM_MOTION_TRANSITIONS.control}>
      {children}
    </MotionConfig>
  );
}
