'use client';

import { ResultExperience } from '../result-experience';
import type { ResultExperienceProps as LegacyProps } from './types';

/** @deprecated Prefer ResultExperience with viewModel. Kept for compatibility. */
export function ResultInteractiveWorkspace({ title, description, nodes, edges }: LegacyProps) {
  return (
    <ResultExperience
      mode="example"
      viewModel={{ title, description, nodes, edges }}
    />
  );
}
