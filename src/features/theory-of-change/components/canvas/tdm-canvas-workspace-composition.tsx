import { TdmCanvasWorkspaceRenderer } from './tdm-canvas-workspace-composition/tdm-canvas-workspace-renderer';
import { useCanvasWorkspaceActions } from './tdm-canvas-workspace-composition/use-canvas-workspace-actions';
import { useCanvasWorkspaceFoundation } from './tdm-canvas-workspace-composition/use-canvas-workspace-foundation';
import { useCanvasWorkspacePresentation } from './tdm-canvas-workspace-composition/use-canvas-workspace-presentation';

export type TdmCanvasInnerProps = {
  initialVariant?: 'custom' | 'example';
};

export function useCanvasWorkspaceComposition(props: TdmCanvasInnerProps) {
  const foundation = useCanvasWorkspaceFoundation(props);
  const actions = useCanvasWorkspaceActions(foundation);
  const presentation = useCanvasWorkspacePresentation(foundation, actions);

  return (
    <TdmCanvasWorkspaceRenderer
      foundation={foundation}
      actions={actions}
      presentation={presentation}
    />
  );
}
