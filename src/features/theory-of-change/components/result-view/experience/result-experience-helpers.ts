import type { TdmEdge, TdmNode } from '@/features/theory-of-change/domain/tdm-types';
import type { TdmStage } from '@/features/theory-of-change/domain/tdm-stages';
import type { DisplayEdge, StageMeta } from './types';

export const STAGES: StageMeta[] = [
  { stage: 'input', label: 'Insumos', eyebrow: '01', accent: 'rgba(244,244,245,0.72)', accentSoft: 'rgba(244,244,245,0.08)' },
  { stage: 'activity', label: 'Atividades', eyebrow: '02', accent: 'rgba(244,244,245,0.72)', accentSoft: 'rgba(244,244,245,0.08)' },
  { stage: 'output', label: 'Produtos', eyebrow: '03', accent: 'rgba(244,244,245,0.72)', accentSoft: 'rgba(244,244,245,0.08)' },
  { stage: 'outcome', label: 'Resultados', eyebrow: '04', accent: 'rgba(74,222,128,0.85)', accentSoft: 'rgba(74,222,128,0.1)' }
];

export function groupNodes(nodes: TdmNode[]) {
  return STAGES.map((meta) => ({
    ...meta,
    nodes: nodes.filter((node) => node.stage === meta.stage)
  }));
}

export function displayEdges(edges: TdmEdge[]): DisplayEdge[] {
  return edges.map((edge, index) => {
    const markerKinds: DisplayEdge['markerKinds'] = [];
    if (edge.markerType === 'risk') markerKinds.push('risk');
    if (edge.markerType === 'hypothesis') markerKinds.push('hypothesis');
    if (!edge.markerType && index === 1) markerKinds.push('risk');
    if (!edge.markerType && index === 5) markerKinds.push('hypothesis');
    return { ...edge, markerKinds };
  });
}

export function relatedIds(selectedId: string | null, edges: TdmEdge[]) {
  if (!selectedId) return new Set<string>();
  const ids = new Set<string>([selectedId]);
  for (const edge of edges) {
    if (edge.source === selectedId) ids.add(edge.target);
    if (edge.target === selectedId) ids.add(edge.source);
  }
  return ids;
}

export function cardPosition(stageIndex: number, itemIndex: number, totalInStage: number, compact = false) {
  const x = compact ? 8 + stageIndex * 23 : 2 + stageIndex * 25.5;
  const baseY = compact ? 22 : 28;
  const gap = compact ? 18 : 16;
  const y = baseY + itemIndex * gap + (totalInStage === 1 ? gap * 0.7 : 0);
  return { x, y };
}

export function getNodePosition(node: TdmNode, nodes: TdmNode[], compact = false) {
  const grouped = groupNodes(nodes);
  const stageIndex = grouped.findIndex((group) => group.stage === node.stage);
  const group = grouped[stageIndex];
  const itemIndex = group.nodes.findIndex((item) => item.id === node.id);
  return cardPosition(stageIndex, itemIndex, group.nodes.length, compact);
}

export function edgePath(edge: TdmEdge, nodes: TdmNode[], compact = false) {
  const source = nodes.find((node) => node.id === edge.source);
  const target = nodes.find((node) => node.id === edge.target);
  if (!source || !target) return '';
  const a = getNodePosition(source, nodes, compact);
  const b = getNodePosition(target, nodes, compact);
  const width = compact ? 16 : 16;
  const startX = a.x + width;
  const startY = a.y + 4.8;
  const endX = b.x;
  const endY = b.y + 4.8;
  const c1 = startX + (endX - startX) * 0.55;
  const c2 = endX - (endX - startX) * 0.55;
  return `M ${startX} ${startY} C ${c1} ${startY}, ${c2} ${endY}, ${endX} ${endY}`;
}

export function edgeMidpoint(edge: TdmEdge, nodes: TdmNode[], compact = false) {
  const source = nodes.find((node) => node.id === edge.source);
  const target = nodes.find((node) => node.id === edge.target);
  if (!source || !target) return { x: 50, y: 50 };
  const a = getNodePosition(source, nodes, compact);
  const b = getNodePosition(target, nodes, compact);
  const width = compact ? 16 : 16;
  return { x: (a.x + width + b.x) / 2, y: (a.y + b.y) / 2 + 5 };
}

export function stageAccent(stage: TdmStage) {
  return STAGES.find((item) => item.stage === stage)?.accent ?? '#ffffff';
}
