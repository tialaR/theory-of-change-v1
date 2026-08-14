'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { CanvasWorkspaceController } from '../hooks/use-canvas-workspace-controller';

const CanvasRuntimeContext = createContext<CanvasWorkspaceController | null>(null);

export function CanvasRuntimeProvider({
  controller,
  children
}: {
  controller: CanvasWorkspaceController;
  children: ReactNode;
}) {
  return (
    <CanvasRuntimeContext.Provider value={controller}>
      {children}
    </CanvasRuntimeContext.Provider>
  );
}

export function useCanvasRuntime() {
  const runtime = useContext(CanvasRuntimeContext);
  if (!runtime) throw new Error('CanvasRuntimeProvider ausente.');
  return runtime;
}
