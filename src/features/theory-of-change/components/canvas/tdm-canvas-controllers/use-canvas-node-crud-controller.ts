import type { TdmStage } from '../../../domain/tdm-stages';
import type { TdmEdge as TdmEdgeModel, TdmNode as TdmNodeModel, TdmNodeDraft } from '../../../domain/tdm-types';
import type { StageCreation } from '../../../utils/stage-creation';
import { useCanvasNodeAccordionController } from './node-crud/use-canvas-node-accordion-controller';
import { useCanvasNodeCreationController } from './node-crud/use-canvas-node-creation-controller';
import { useCanvasNodeEditorController } from './node-crud/use-canvas-node-editor-controller';
import { useCanvasNodeMutationController } from './node-crud/use-canvas-node-mutation-controller';
import type { Setter } from './node-crud/types';

type Params = {
  nodes: TdmNodeModel[];
  selectedNode: TdmNodeModel | null;
  selectedNodeId: string | null;
  stageCreation: StageCreation;
  creationDrafts: Record<TdmStage, TdmNodeDraft>;
  editDraft: TdmNodeDraft;
  emptyDraft: TdmNodeDraft;
  quickStageDrafts: Record<TdmStage, TdmNodeDraft>;
  setNodes: Setter<TdmNodeModel[]>;
  setEdges: Setter<TdmEdgeModel[]>;
  setSelectedNodeId: Setter<string | null>;
  setToolbarNodeId: Setter<string | null>;
  setSelectedEdgeId: Setter<string | null>;
  setEditingNodeId: Setter<string | null>;
  setCreationDrafts: Setter<Record<TdmStage, TdmNodeDraft>>;
  setCreationError: Setter<string | undefined>;
  setEditDraft: Setter<TdmNodeDraft>;
  setEditError: Setter<string | undefined>;
  setIsCreateAccordionOpen: Setter<boolean>;
  setIsEditAccordionOpen: Setter<boolean>;
  setMarkerDraft: Setter<string>;
  bumpViewportReset: () => void;
  clearEditFormState: () => void;
};

export function useCanvasNodeCrudController(params: Params) {
  const editor = useCanvasNodeEditorController(params);
  const creation = useCanvasNodeCreationController(params);
  const mutation = useCanvasNodeMutationController({
    ...params,
    syncEditDraftFromNode: editor.syncEditDraftFromNode
  });
  const accordion = useCanvasNodeAccordionController(params);

  return {
    ...editor,
    ...mutation,
    ...creation,
    ...accordion
  };
}
