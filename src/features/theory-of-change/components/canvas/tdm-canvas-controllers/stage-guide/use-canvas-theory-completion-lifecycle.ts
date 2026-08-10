import { useEffect, useRef } from 'react';

import { theoryCompleteToast } from '../../../toast/tdm-toast-messages';
import type { ContextualFlowTooltipEvent } from '../../../toast/use-contextual-flow-tooltip';
import type { TdmToastInput } from '../../../toast/tdm-toast-types';

type UseCanvasTheoryCompletionLifecycleParams = {
  canGenerateResult: boolean;
  showFlowTooltip: (event: ContextualFlowTooltipEvent, message: TdmToastInput) => void;
  clearFlowTooltipEvent: (event: ContextualFlowTooltipEvent) => void;
};

export function useCanvasTheoryCompletionLifecycle({
  canGenerateResult,
  showFlowTooltip,
  clearFlowTooltipEvent
}: UseCanvasTheoryCompletionLifecycleParams) {
  const hasInitializedRef = useRef(false);
  const previousCanGenerateResultRef = useRef(canGenerateResult);

  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      previousCanGenerateResultRef.current = canGenerateResult;
      return;
    }

    if (canGenerateResult && !previousCanGenerateResultRef.current) {
      showFlowTooltip('theory-complete', theoryCompleteToast());
    }

    if (!canGenerateResult && previousCanGenerateResultRef.current) {
      clearFlowTooltipEvent('theory-complete');
    }

    previousCanGenerateResultRef.current = canGenerateResult;
  }, [canGenerateResult, clearFlowTooltipEvent, showFlowTooltip]);
}
