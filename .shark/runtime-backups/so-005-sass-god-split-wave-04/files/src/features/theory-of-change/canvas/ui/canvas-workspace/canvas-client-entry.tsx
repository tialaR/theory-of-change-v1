'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { ensureBrowserMocksStarted } from '@/mocks/ensure-browser-mocks';
import type { AuthUser } from '@/features/auth';
import type { CanvasProject } from '../../domain/canvas-project';
import { CanvasWorkspaceLoading } from './canvas-workspace.loading';

const CanvasWorkspace = dynamic(
  () => import('./canvas-workspace').then((module) => module.CanvasWorkspace),
  { ssr: false, loading: CanvasWorkspaceLoading }
);

export type CanvasClientEntryProps = {
  initialProject: CanvasProject;
  user: AuthUser;
};

export function CanvasClientEntry({ initialProject, user }: CanvasClientEntryProps) {
  useEffect(() => {
    void ensureBrowserMocksStarted();
  }, []);

  return <CanvasWorkspace initialProject={initialProject} user={user} />;
}
