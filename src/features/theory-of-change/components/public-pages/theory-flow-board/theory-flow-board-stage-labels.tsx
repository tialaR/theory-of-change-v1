import type { CSSProperties } from 'react';
import { TDM_STAGE_LABELS, TDM_STAGE_ORDER, type TdmStage } from '../../../domain/tdm-stages';
import type { TdmNode } from '../../../domain/tdm-types';
import type { DiagramNode } from '../../result-view/experience/types';
import styles from '../public-pages.module.sass';

const STAGE_LABEL_Y = 42;

type TheoryFlowBoardStageLabelsProps = {
  diagramNodes: DiagramNode[];
  grouped: Record<TdmStage, TdmNode[]>;
  scale: number;
  viewW: number;
  viewH: number;
};

export function TheoryFlowBoardStageLabels({ diagramNodes, grouped, scale, viewW, viewH }: TheoryFlowBoardStageLabelsProps) {
  return (
    <div className={styles.stageLabels} aria-hidden="true">
      {TDM_STAGE_ORDER.map((stage) => {
        const firstNode = diagramNodes.find((node) => node.stage === stage);
        const x = (firstNode?.x ?? 0) * scale;
        const y = STAGE_LABEL_Y * scale;
        return (
          <span
            key={stage}
            className={styles.stageLabel}
            style={{ '--x': `${(x / viewW) * 100}%`, '--y': `${(y / viewH) * 100}%` } as CSSProperties}
          >
            {TDM_STAGE_LABELS[stage]}
            <small>{grouped[stage].length}</small>
          </span>
        );
      })}
    </div>
  );
}
