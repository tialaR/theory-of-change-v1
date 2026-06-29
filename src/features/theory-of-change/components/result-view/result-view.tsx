import { useMemo, useState } from 'react';
import type { TdmEdge, TdmNode } from '../../domain/tdm-types';
import { TDM_STAGE_LABELS, type TdmStage } from '../../domain/tdm-stages';
import styles from './result-view.module.sass';

export function ResultView({
  title,
  nodes,
  edges,
  backLabel = 'Voltar ao canvas',
  showExportActions = false,
  onExport,
  onBack
}: {
  title: string;
  nodes: TdmNode[];
  edges: TdmEdge[];
  backLabel?: string;
  showExportActions?: boolean;
  onExport?: (format: 'pdf' | 'png' | 'jpeg' | 'svg') => void;
  onBack: () => void;
}) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const selectedNode = useMemo(() => nodes.find((node) => node.id === selectedNodeId) ?? null, [nodes, selectedNodeId]);
  const relatedIds = useMemo(() => {
    if (!selectedNode) {
      return new Set<string>();
    }

    const connectedEdges = edges.filter((edge) => edge.source === selectedNode.id || edge.target === selectedNode.id);
    const ids = new Set<string>([selectedNode.id]);

    connectedEdges.forEach((edge) => {
      ids.add(edge.source);
      ids.add(edge.target);
    });

    return ids;
  }, [edges, selectedNode]);

  const groupedNodes = useMemo(() => {
    return (Object.keys(TDM_STAGE_LABELS) as TdmStage[]).reduce<Record<TdmStage, TdmNode[]>>(
      (accumulator, stage) => {
        accumulator[stage] = nodes.filter((node) => node.stage === stage);
        return accumulator;
      },
      {
        input: [],
        activity: [],
        output: [],
        outcome: []
      }
    );
  }, [nodes]);

  return (
    <main className={styles.view}>
      <section className={styles.card}>
        <div className={styles.topRow}>
          <div>
            <p className={styles.kicker}>Resultado final</p>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.description}>Clique em um bloco para realçar suas conexões diretas.</p>
          </div>
          <button className={styles.backButton} type="button" onClick={onBack}>
            {backLabel}
          </button>
        </div>
        <div className={styles.grid}>
          {(Object.keys(TDM_STAGE_LABELS) as TdmStage[]).map((stage) => (
            <section key={stage} className={styles.column}>
              <p className={styles.columnKicker}>{TDM_STAGE_LABELS[stage]}</p>
              <div className={styles.columnList}>
                {groupedNodes[stage].map((node) => {
                  const isActive = selectedNodeId === null || relatedIds.has(node.id);
                  return (
                    <button
                      key={node.id}
                      type="button"
                      className={[styles.nodeItem, isActive ? '' : styles.dimmed, selectedNodeId === node.id ? styles.active : '']
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => setSelectedNodeId((current) => (current === node.id ? null : node.id))}
                    >
                      <strong>{node.title}</strong>
                      <span>{node.shortNotes || node.description}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
        <aside className={styles.sideNote}>
          <p className={styles.sideNoteTitle}>Conexões e marcadores</p>
          <p className={styles.sideNoteText}>
            {selectedNode
              ? `Este bloco está em ${TDM_STAGE_LABELS[selectedNode.stage].toLowerCase()}. As conexões diretas ficam destacadas acima.`
              : 'Selecione um bloco para ver o destaque das relações diretas.'}
          </p>
          <div className={styles.edgeList}>
            {edges.map((edge) => (
              <div key={edge.id} className={styles.edgeRow}>
                <span>
                  {TDM_STAGE_LABELS[edge.sourceStage]} → {TDM_STAGE_LABELS[edge.targetStage]}
                </span>
                <span>{edge.markerType ? edge.markerType : 'sem marcador'}</span>
              </div>
            ))}
          </div>
          {showExportActions && onExport ? (
            <div className={styles.exportActions}>
              <button type="button" className={styles.exportButton} onClick={() => onExport('pdf')}>
                PDF
              </button>
              <button type="button" className={styles.exportButton} onClick={() => onExport('png')}>
                PNG
              </button>
              <button type="button" className={styles.exportButton} onClick={() => onExport('jpeg')}>
                JPEG
              </button>
              <button type="button" className={styles.exportButton} onClick={() => onExport('svg')}>
                SVG
              </button>
            </div>
          ) : null}
        </aside>
      </section>
    </main>
  );
}
