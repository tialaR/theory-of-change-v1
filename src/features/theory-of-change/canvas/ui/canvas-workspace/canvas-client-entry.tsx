'use client';

import dynamic from 'next/dynamic';
import { CanvasWorkspaceLoading } from './canvas-workspace.loading';

const CanvasWorkspace = dynamic(
  () => import('./canvas-workspace').then((module) => module.CanvasWorkspace),
  {
    ssr: false,
    loading: CanvasWorkspaceLoading
  }
);

export function CanvasClientEntry() {
  return <CanvasWorkspace />;
}
