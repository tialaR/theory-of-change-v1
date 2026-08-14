'use client';

import { motion, useReducedMotion } from 'motion/react';
import type { CSSProperties } from 'react';
import type { TdmEdge } from '../../../domain/tdm-types';
import { countNodeConnections } from '../../result-view/result-view-utils';
import type { DiagramNode } from '../../result-view/experience/types';
import styles from '../public-pages.module.sass';

const CARD_WIDTH = 11.375;

type TheoryFlowBoardNodeCardsProps = {
  diagramNodes: DiagramNode[];
  edges: TdmEdge[];
  selected: string | null;
  relatedNodes: Set<string>;
  hasSelection: boolean;
  compact: boolean;
  scale: number;
  viewW: number;
  viewH: number;
  onSelectNode?: (nodeId: string) => void;
};

export function TheoryFlowBoardNodeCards({ diagramNodes, edges, selected, relatedNodes, hasSelection, compact, scale, viewW, viewH, onSelectNode }: TheoryFlowBoardNodeCardsProps) {
  const reduced = useReducedMotion();

  return (
    <div className={`${styles.diagramCards} ${compact ? styles.diagramCards_compact : ''}`} style={{ height: `${(compact ? 360 : 620) * scale / 16}rem` }}>
      {diagramNodes.map((node) => {
        const isSelected = selected === node.id;
        const isRelated = !hasSelection || relatedNodes.has(node.id);
        const counts = countNodeConnections(node.id, edges);
        const x = (node.x / viewW) * 100;
        const y = (node.y / viewH) * 100;
        return (
          <motion.button
            key={node.id}
            type="button"
            className={[styles.flowCard, isSelected ? styles.flowCardSelected : '', isRelated ? '' : styles.flowCardDisabled].filter(Boolean).join(' ')}
            style={{ '--x': `${x}%`, '--y': `${y}%`, '--card-width': `${CARD_WIDTH * scale}rem` } as CSSProperties}
            onClick={() => onSelectNode?.(node.id)}
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: isRelated ? 1 : 0.2, scale: isSelected ? 1.04 : isRelated ? 1 : 0.96, y: isSelected ? -4 : 0 }}
            transition={{ duration: reduced ? 0.01 : 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <strong>{node.title}</strong>
            <span>{node.description}</span>
            {(counts.incoming || counts.outgoing) && (
              <small>
                {counts.incoming ? `← ${counts.incoming}` : ''}
                {counts.incoming && counts.outgoing ? ' · ' : ''}
                {counts.outgoing ? `→ ${counts.outgoing}` : ''}
              </small>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
