'use client';

import { useCallback, useState } from 'react';
import type { TdmToast, TdmToastInput } from './tdm-toast-types';

export type ContextualFlowTooltipEvent =
  | 'advance-stage-activity'
  | 'advance-stage-output'
  | 'advance-stage-outcome'
  | 'theory-complete';

let flowTooltipCounter = 0;

export function useContextualFlowTooltip() {
  const [activeFlowTooltip, setActiveFlowTooltip] = useState<TdmToast | null>(null);
  const [lastTooltipEvent, setLastTooltipEvent] = useState<ContextualFlowTooltipEvent | null>(null);

  const closeFlowTooltip = useCallback(() => {
    setActiveFlowTooltip(null);
  }, []);

  const showFlowTooltip = useCallback(
    (event: ContextualFlowTooltipEvent, input: TdmToastInput) => {
      if (lastTooltipEvent === event) {
        return;
      }

      const id = input.id ?? `flow-tooltip-${++flowTooltipCounter}`;
      setLastTooltipEvent(event);
      setActiveFlowTooltip({ ...input, id });
    },
    [lastTooltipEvent]
  );

  const clearFlowTooltipEvent = useCallback((event: ContextualFlowTooltipEvent) => {
    setLastTooltipEvent((current) => (current === event ? null : current));
  }, []);

  return {
    activeFlowTooltip,
    showFlowTooltip,
    closeFlowTooltip,
    clearFlowTooltipEvent
  };
}
