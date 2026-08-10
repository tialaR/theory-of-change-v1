import { useCallback } from 'react';

type UseCanvasWorkspaceNavigationInput = {
  navigateAfterSave: (path: string) => void | Promise<void>;
};

export function useCanvasWorkspaceNavigation({ navigateAfterSave }: UseCanvasWorkspaceNavigationInput) {
  const openHome = useCallback(() => navigateAfterSave('/'), [navigateAfterSave]);
  const openGuide = useCallback(() => navigateAfterSave('/guia-de-aprendizado'), [navigateAfterSave]);
  const openExamples = useCallback(() => navigateAfterSave('/exemplos'), [navigateAfterSave]);

  return { openHome, openGuide, openExamples };
}
