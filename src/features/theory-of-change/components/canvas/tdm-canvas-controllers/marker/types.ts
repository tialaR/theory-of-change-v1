import type { Dispatch, SetStateAction } from 'react';

import type { TdmEdge, TdmMarkerType } from '../../../../domain/tdm-types';

export type CanvasMarkerControllerParams = {
  edges: TdmEdge[];
  selectedEdge: TdmEdge | null;
  markerDraft: string;
  setEdges: Dispatch<SetStateAction<TdmEdge[]>>;
  setSelectedEdgeId: Dispatch<SetStateAction<string | null>>;
  setSelectedNodeId: Dispatch<SetStateAction<string | null>>;
  setToolbarNodeId: Dispatch<SetStateAction<string | null>>;
  setEditingNodeId: Dispatch<SetStateAction<string | null>>;
  setMarkerDraft: Dispatch<SetStateAction<string>>;
  setMarkerEditorEdgeId: Dispatch<SetStateAction<string | null>>;
  setGuideTransientMessage: Dispatch<SetStateAction<string | null>>;
  markEdgeRecentlyUpdated: (edgeId: string) => void;
};

export type MarkerMutationOwnerParams = Pick<
  CanvasMarkerControllerParams,
  | 'edges'
  | 'setEdges'
  | 'setMarkerDraft'
  | 'setMarkerEditorEdgeId'
  | 'setGuideTransientMessage'
  | 'markEdgeRecentlyUpdated'
>;

export type MarkerEditorOwnerParams = Pick<
  CanvasMarkerControllerParams,
  | 'setSelectedEdgeId'
  | 'setSelectedNodeId'
  | 'setToolbarNodeId'
  | 'setEditingNodeId'
  | 'setMarkerEditorEdgeId'
>;

export type SelectedEdgeMarkerOwnerParams = Pick<
  CanvasMarkerControllerParams,
  'selectedEdge' | 'markerDraft' | 'setEdges' | 'setSelectedEdgeId' | 'setMarkerDraft'
> & {
  deleteMarkerFromEdge: (edgeId: string) => void;
  openMarkerEditor: (edgeId: string) => void;
  saveMarkerOnEdge: (edgeId: string, markerType: TdmMarkerType, text: string) => void;
};
