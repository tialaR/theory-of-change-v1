import { TDM_STAGE_DESCRIPTIONS, TDM_STAGE_LABELS } from '../domain/tdm-stages';
import { TdmNode } from '../domain/tdm-types';

export function getNodeMetadata(node: TdmNode) {
  return {
    label: TDM_STAGE_LABELS[node.data.stage],
    description: node.data.description ?? TDM_STAGE_DESCRIPTIONS[node.data.stage]
  };
}
