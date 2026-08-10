import { useMemo, useState } from 'react';
import { useEdgesState, useNodesState, useReactFlow } from '@xyflow/react';

import { useContextualFlowTooltip } from '../../toast/use-contextual-flow-tooltip';
import { type TdmStage } from '../../../domain/tdm-stages';
import type { TdmEdge as TdmEdgeModel, TdmNode as TdmNodeModel, TdmNodeDraft } from '../../../domain/tdm-types';
import { exampleTheory } from '../../../data/example-theory';
import { type StageCreation } from '../../../utils/stage-creation';
import {
  EMPTY_DRAFT,
  createEmptyDraftMap,
  type ViewMode
} from '../tdm-canvas-config/tdm-canvas-runtime';

type UseCanvasWorkspaceStateOptions = {
  initialVariant: 'custom' | 'example';
};

export function useCanvasWorkspaceState({ initialVariant }: UseCanvasWorkspaceStateOptions) {
  const isExampleInitial = initialVariant === 'example';
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('canvas');
  const [theoryTitle, setTheoryTitle] = useState(isExampleInitial ? exampleTheory.title : '');
  const [nodes, setNodes, onNodesChange] = useNodesState<TdmNodeModel>(isExampleInitial ? exampleTheory.nodes : []);
  const [edges, setEdges, onEdgesChange] = useEdgesState<TdmEdgeModel>(isExampleInitial ? exampleTheory.edges : []);
  const [stageCreation, setStageCreation] = useState<StageCreation>(isExampleInitial ? 'ready-to-connect' : 'input');
  const flowTooltip = useContextualFlowTooltip();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [toolbarNodeId, setToolbarNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [creationDrafts, setCreationDrafts] = useState<Record<TdmStage, TdmNodeDraft>>(() => createEmptyDraftMap());
  const [creationError, setCreationError] = useState<string | undefined>();
  const [editDraft, setEditDraft] = useState<TdmNodeDraft>({ ...EMPTY_DRAFT });
  const [editError, setEditError] = useState<string | undefined>();
  const [isCreateAccordionOpen, setIsCreateAccordionOpen] = useState(true);
  const [isEditAccordionOpen, setIsEditAccordionOpen] = useState(false);
  const [markerDraft, setMarkerDraft] = useState('');
  const [canvasVariant, setCanvasVariant] = useState<'custom' | 'example'>(initialVariant);
  const [markerEditorEdgeId, setMarkerEditorEdgeId] = useState<string | null>(null);
  const reactFlow = useReactFlow<TdmNodeModel, TdmEdgeModel>();

  const selectedNode = useMemo(() => nodes.find((node) => node.id === selectedNodeId) ?? null, [nodes, selectedNodeId]);
  const selectedEdge = useMemo(() => edges.find((edge) => edge.id === selectedEdgeId) ?? null, [edges, selectedEdgeId]);

  return {
    isSidebarOpen, setIsSidebarOpen, viewMode, setViewMode, theoryTitle, setTheoryTitle,
    nodes, setNodes, onNodesChange, edges, setEdges, onEdgesChange, stageCreation, setStageCreation,
    ...flowTooltip,
    selectedNodeId, setSelectedNodeId, toolbarNodeId, setToolbarNodeId, selectedEdgeId, setSelectedEdgeId,
    editingNodeId, setEditingNodeId, creationDrafts, setCreationDrafts, creationError, setCreationError,
    editDraft, setEditDraft, editError, setEditError, isCreateAccordionOpen, setIsCreateAccordionOpen,
    isEditAccordionOpen, setIsEditAccordionOpen, markerDraft, setMarkerDraft, canvasVariant, setCanvasVariant,
    markerEditorEdgeId, setMarkerEditorEdgeId, selectedNode, selectedEdge,
    fitView: reactFlow.fitView,
    screenToFlowPosition: reactFlow.screenToFlowPosition
  };
}
