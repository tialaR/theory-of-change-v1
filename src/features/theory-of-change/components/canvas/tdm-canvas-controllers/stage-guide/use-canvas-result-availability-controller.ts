import { useMemo } from 'react';

import type { TdmEdge, TdmNode } from '../../../../domain/tdm-types';
import { canViewTdmResult, getTdmResultAvailabilityMessage } from '../../../../utils/tdm-result';

type UseCanvasResultAvailabilityControllerParams = {
  nodes: TdmNode[];
  edges: TdmEdge[];
};

export function useCanvasResultAvailabilityController({
  nodes,
  edges
}: UseCanvasResultAvailabilityControllerParams) {
  const canGenerateResult = useMemo(() => canViewTdmResult(nodes, edges), [edges, nodes]);
  const resultAvailabilityMessage = useMemo(
    () => getTdmResultAvailabilityMessage(nodes, edges),
    [edges, nodes]
  );

  return { canGenerateResult, resultAvailabilityMessage };
}
