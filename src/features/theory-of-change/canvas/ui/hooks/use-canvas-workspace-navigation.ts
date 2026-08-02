import { useCallback } from 'react';

type UseCanvasWorkspaceNavigationInput = {
  navigateAfterSave: (path: string) => boolean | Promise<boolean>;
};

export function useCanvasWorkspaceNavigation({ navigateAfterSave }: UseCanvasWorkspaceNavigationInput) {
  const openHome = useCallback(async () => { await navigateAfterSave('/'); }, [navigateAfterSave]);
  const openGuide = useCallback(async () => { await navigateAfterSave('/guia-de-aprendizado'); }, [navigateAfterSave]);
  const openExamples = useCallback(async () => { await navigateAfterSave('/exemplos'); }, [navigateAfterSave]);

  return { openHome, openGuide, openExamples };
}
