import { useId } from 'react';
import type { TheoryNarrativeFlowchartViewModel } from './theory-narrative.types';
import styles from './theory-narrative-flowchart.module.sass';

type TheoryNarrativeFlowchartProps = {
  flowchart: TheoryNarrativeFlowchartViewModel;
  mode: 'macro' | 'scoped';
};

/**
 * Structural simplified flowchart — exclusive matrix only.
 * docs/tdm-document-presentation-standard-v2.2.md
 */
export function TheoryNarrativeFlowchart({ flowchart, mode }: TheoryNarrativeFlowchartProps) {
  const reactId = useId().replace(/:/g, '');
  const arrowMarkerId = `narrative-flow-arrow-${reactId}`;

  return (
    <figure className={styles.figure} data-narrative-flowchart={mode}>
      <figcaption className={styles.figureTitle}>{flowchart.figureTitle}</figcaption>
      <div className={styles.figureFrame}>
        <svg
          className={styles.svg}
          viewBox="0 0 640 132"
          role="img"
          aria-label={flowchart.altText}
        >
          <title>{flowchart.altText}</title>
          <defs>
            <marker
              id={arrowMarkerId}
              markerWidth="6"
              markerHeight="6"
              refX="5"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L6,3 L0,6 z" className={styles.arrowHead} />
            </marker>
          </defs>
          {flowchart.stages.map((stage, index) => {
            const x = 12 + index * 158;
            return (
              <g key={stage.stage} transform={`translate(${x}, 18)`}>
                <rect className={styles.stageRect} x="0" y="0" width="136" height="52" rx="4" ry="4" />
                <text className={styles.stageTitle} x="68" y="22" textAnchor="middle">
                  {stage.title}
                </text>
                <text className={styles.stageSubtitle} x="68" y="40" textAnchor="middle">
                  {stage.subtitle}
                </text>
              </g>
            );
          })}
          {flowchart.transitions.map((transition, index) => {
            const startX = 148 + index * 158;
            const endX = startX + 20;
            const midX = startX + 10;
            const label =
              mode === 'scoped' ? transition.compactLabel : transition.structuralLabel;
            const pillWidth =
              label === 'HIPÓTESE' ? 64 : label && label.length > 3 ? 48 : label ? 36 : 0;
            return (
              <g key={transition.id}>
                <line
                  className={styles.arrowLine}
                  x1={startX}
                  y1="44"
                  x2={endX}
                  y2="44"
                  markerEnd={`url(#${arrowMarkerId})`}
                />
                {label ? (
                  <g transform={`translate(${midX}, 78)`}>
                    <line className={styles.labelStem} x1="0" y1="-18" x2="0" y2="-6" />
                    <rect
                      className={styles.labelPill}
                      x={-pillWidth / 2}
                      y="-4"
                      width={pillWidth}
                      height="18"
                      rx="2"
                      ry="2"
                    />
                    <text className={styles.labelText} x="0" y="9" textAnchor="middle">
                      {label}
                    </text>
                  </g>
                ) : null}
              </g>
            );
          })}
        </svg>
      </div>
      <p className={styles.caption}>{flowchart.caption}</p>
      <p className={styles.source}>{flowchart.sourceNote}</p>
    </figure>
  );
}
