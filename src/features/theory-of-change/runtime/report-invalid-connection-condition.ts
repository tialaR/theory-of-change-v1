import { isConditionAllowed } from '../domain/tdm-connection-rules';
import type { TdmStage } from '../domain/tdm-stages';
import type { TdmMarkerType } from '../domain/tdm-types';

type InvalidConnectionCondition = {
  edgeId: string;
  sourceStage: TdmStage;
  targetStage: TdmStage;
  conditionKind: TdmMarkerType;
};

/** Runtime-only diagnostics for invalid legacy markers. Domain rules remain environment-free. */
export function reportInvalidConnectionCondition(params: InvalidConnectionCondition): void {
  if (process.env.NODE_ENV === 'production' || isConditionAllowed(params)) {
    return;
  }

  console.info(
    `[tdm-interpreter] ignored invalid ${params.conditionKind} on ${params.sourceStage}→${params.targetStage} (edge ${params.edgeId})`
  );
}
