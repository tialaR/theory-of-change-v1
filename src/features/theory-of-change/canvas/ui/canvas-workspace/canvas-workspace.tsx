'use client';

import { ReactFlowProvider } from '@xyflow/react';
import type { CanvasProject } from '../../domain/canvas-project';
import styles from './canvas-workspace.module.sass';
import { CanvasCreatorPanel } from '../components/canvas-creator-panel';
import { CanvasFlowSurface } from '../components/canvas-flow-surface';
import { CanvasHeader } from '../components/canvas-header';
import { CanvasHistoryPanel } from '../components/canvas-history-panel';
import { CanvasInspector, CanvasInspectorReopen } from '../components/canvas-inspector';
import { CanvasNotice } from '../components/canvas-notice';
import { CanvasToolbar } from '../components/canvas-toolbar';
import { useCanvasWorkspaceController } from '../hooks/use-canvas-workspace-controller';
import { CanvasRuntimeProvider } from '../runtime/canvas-runtime-context';

export type CanvasWorkspaceProps = {
  initialProject: CanvasProject;
  userName: string;
};

function CanvasWorkspaceContent({ initialProject, userName }: CanvasWorkspaceProps) {
  const controller = useCanvasWorkspaceController(initialProject, userName);

  return (
    <CanvasRuntimeProvider controller={controller}>
      <main className={styles.page} data-full-canvas={controller.ui.fullCanvasMode}>
        <CanvasHeader />
        <section className={styles.workspace} data-full-canvas={controller.ui.fullCanvasMode}>
          <CanvasToolbar />
          <CanvasFlowSurface />
          <CanvasCreatorPanel />
          <CanvasNotice />
          <CanvasInspector />
          <CanvasInspectorReopen />
          <CanvasHistoryPanel />
        </section>
      </main>
    </CanvasRuntimeProvider>
  );
}

export function CanvasWorkspace(props: CanvasWorkspaceProps) {
  return (
    <ReactFlowProvider>
      <CanvasWorkspaceContent {...props} />
    </ReactFlowProvider>
  );
}
