import type { TdmEdge, TdmMarkerType, TdmNode } from '../../../domain/tdm-types';
import type { TdmSidebarContext } from '../../sidebar/tdm-sidebar';

export type SidebarContextInput = {
  selectedEdge: TdmEdge | null;
  nodes: TdmNode[];
  markerDraft: string;
  onDraftChange: (value: string) => void;
  onSaveMarker: () => void;
  onDeleteMarker: () => void;
  onAddMarker: (markerType: TdmMarkerType) => void;
  onDeleteEdge: () => void;
};

export function buildSidebarContext(input: SidebarContextInput): TdmSidebarContext {
  const edge = input.selectedEdge;
  if (!edge) return { kind: 'none' };

  const sourceLabel = input.nodes.find((node) => node.id === edge.source)?.title ?? 'Origem';
  const targetLabel = input.nodes.find((node) => node.id === edge.target)?.title ?? 'Destino';

  if (edge.markerType) {
    return {
      kind: 'marker',
      marker: {
        sourceLabel,
        targetLabel,
        markerText: input.markerDraft,
        markerType: edge.markerType,
        isEditingExisting: Boolean(edge.markerText?.trim())
      },
      onDraftChange: input.onDraftChange,
      onSubmit: input.onSaveMarker,
      onDelete: input.onDeleteMarker
    };
  }

  return {
    kind: 'edge',
    edge: {
      sourceLabel,
      targetLabel,
      message: edge.validationMessage ?? 'Conexão válida. Agora você pode explicar o vínculo entre esses blocos.',
      markerType: edge.markerType,
      markerText: edge.markerText,
      canAddRisk:
        (edge.sourceStage === 'input' && edge.targetStage === 'activity') ||
        (edge.sourceStage === 'activity' && edge.targetStage === 'output'),
      canAddHypothesis: edge.sourceStage === 'output' && edge.targetStage === 'outcome'
    },
    onAddRisk: () => input.onAddMarker('risk'),
    onAddHypothesis: () => input.onAddMarker('hypothesis'),
    onDelete: input.onDeleteEdge
  };
}
