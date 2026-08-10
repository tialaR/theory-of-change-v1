'use client';

import type { ComponentProps, MouseEvent as ReactMouseEvent } from 'react';
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  type ReactFlowProps
} from '@xyflow/react';
import { TdmButton } from '@/shared/ui/tdm-button/tdm-button';
import { TdmIconButton } from '@/shared/ui/tdm-icon-button/tdm-icon-button';
import { SidebarToggleIcon, TdmSidebarFeature } from '../sidebar/tdm-sidebar';
import { TdmToastViewport } from '../toast/tdm-toast';
import { TdmResultPreview } from '../result-preview/tdm-result-preview';
import { TdmCanvasCommandDock } from './tdm-canvas-command-dock';
import { TdmCanvasProcessDock } from './tdm-canvas-process-dock/tdm-canvas-process-dock';
import {
  TdmNodeInteractionProvider,
  type TdmNodeInteractionContextValue
} from './tdm-canvas-node/tdm-canvas-node';
import type { TdmEdge as TdmEdgeModel, TdmNode as TdmNodeModel } from '../../domain/tdm-types';
import ctaScope from './canvas-cta-scope.module.sass';
import styles from './tdm-canvas.module.sass';

const CANVAS_CONTROLS_STYLE = { left: 16, bottom: 16, top: 'auto', right: 'auto', width: 'auto' } as const;
const CANVAS_MINIMAP_STYLE = { width: 152, height: 96, pointerEvents: 'none' as const };

type TdmCanvasWorkspaceViewProps = {
  isSidebarOpen: boolean;
  isGuideExpanded: boolean;
  sidebarToggleLabel: string;
  onToggleSidebar: () => void;
  activeFlowTooltip: ComponentProps<typeof TdmToastViewport>['toast'];
  onCloseFlowTooltip: ComponentProps<typeof TdmToastViewport>['onClose'];
  onFlowBackgroundClick: (event: ReactMouseEvent<HTMLDivElement>) => void;
  isEmpty: boolean;
  nodeInteractionValue: TdmNodeInteractionContextValue;
  reactFlowProps: ReactFlowProps<TdmNodeModel, TdmEdgeModel>;
  processDockProps: ComponentProps<typeof TdmCanvasProcessDock>;
  commandDockProps: ComponentProps<typeof TdmCanvasCommandDock>;
  minimapNodeColor: (node: TdmNodeModel) => string;
  minimapNodeStrokeColor: (node: TdmNodeModel) => string;
  sidebarProps: ComponentProps<typeof TdmSidebarFeature>;
  resultPreviewProps: ComponentProps<typeof TdmResultPreview>;
};

export function TdmCanvasWorkspaceView({
  isSidebarOpen,
  isGuideExpanded,
  sidebarToggleLabel,
  onToggleSidebar,
  activeFlowTooltip,
  onCloseFlowTooltip,
  onFlowBackgroundClick,
  isEmpty,
  nodeInteractionValue,
  reactFlowProps,
  processDockProps,
  commandDockProps,
  minimapNodeColor,
  minimapNodeStrokeColor,
  sidebarProps,
  resultPreviewProps
}: TdmCanvasWorkspaceViewProps) {
  return (
    <section className={[styles.shell, ctaScope.scope, isSidebarOpen ? styles.sidebarOpen : styles.sidebarClosed].join(' ')}>
      <div className={styles.shellChromeTopLeft} data-dock-expanded={isGuideExpanded ? 'true' : 'false'}>
        <TdmButton
          href="/"
          variant="tertiary"
          size="sm"
          className={styles.backLink}
          leadingIcon={
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className={styles.backLinkIcon}>
              <path d="M9.5 3.5 4.5 8l5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4.75 8h6.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          }
        >
          Voltar
        </TdmButton>
      </div>
      <div className={styles.sidebarToggleAnchor}>
        <TdmIconButton
          aria-label={sidebarToggleLabel}
          tooltip={sidebarToggleLabel}
          tooltipPosition="left"
          tooltipSkin="canvas"
          variant="ghost"
          size="md"
          className={styles.sidebarToggleButton}
          onClick={onToggleSidebar}
        >
          <SidebarToggleIcon direction={isSidebarOpen ? 'right' : 'left'} className={styles.sidebarToggleSvg} />
        </TdmIconButton>
      </div>
      <div className={styles.canvasArea}>
        <TdmToastViewport toast={activeFlowTooltip} onClose={onCloseFlowTooltip} />
        <div className={styles.flowFrame} onClick={onFlowBackgroundClick}>
          {isEmpty ? (
            <div className={styles.emptyState} aria-hidden="true">
              <span className={styles.emptyStateMark} />
              <p className={styles.emptyStateHint}>Arraste um insumo para começar</p>
            </div>
          ) : null}
          <TdmNodeInteractionProvider value={nodeInteractionValue}>
            <ReactFlow<TdmNodeModel, TdmEdgeModel> {...reactFlowProps}>
              <TdmCanvasProcessDock {...processDockProps} />
              <TdmCanvasCommandDock {...commandDockProps} />
              <Background variant={BackgroundVariant.Dots} gap={24} size={1} />
              <Controls showInteractive={false} position="bottom-left" className={styles.controls} style={CANVAS_CONTROLS_STYLE} />
              <MiniMap
                position="bottom-right"
                pannable={false}
                zoomable={false}
                className={styles.minimap}
                style={CANVAS_MINIMAP_STYLE}
                nodeColor={minimapNodeColor}
                nodeStrokeColor={minimapNodeStrokeColor}
                nodeBorderRadius={6}
                nodeStrokeWidth={1}
                bgColor="rgba(16, 17, 20, 0.86)"
                maskColor="rgba(8, 9, 12, 0.74)"
              />
            </ReactFlow>
          </TdmNodeInteractionProvider>
        </div>
      </div>
      <TdmSidebarFeature {...sidebarProps} />
      <TdmResultPreview {...resultPreviewProps} />
    </section>
  );
}
