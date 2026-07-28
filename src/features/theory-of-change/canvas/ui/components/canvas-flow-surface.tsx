'use client';

import {
  ReactFlow,
  type EdgeTypes,
  type NodeTypes
} from '@xyflow/react';
import { CANVAS_DIMENSIONS } from '../../domain/canvas-ui.constants';
import styles from '../canvas-workspace/canvas-workspace.module.sass';
import { useCanvasRuntime } from '../runtime/canvas-runtime-context';
import { CanvasCausalEdgeComponent } from './canvas-causal-edge';
import { CanvasConnectionLine } from './canvas-connection-line';
import { CanvasStageNodeComponent } from './canvas-stage-node';

const nodeTypes: NodeTypes = {
  'canvas-stage': CanvasStageNodeComponent
};

const edgeTypes: EdgeTypes = {
  'canvas-causal': CanvasCausalEdgeComponent
};

export function CanvasFlowSurface() {
  const runtime = useCanvasRuntime();

  return (
    <div
      className={styles.canvasViewport}
      onDragOver={runtime.allowStageDrop}
      onDrop={runtime.dropStage}
    >
      <div
        className={styles.canvas}
        data-testid="canvas-react-flow-surface"
        style={{ minWidth: `${CANVAS_DIMENSIONS.width}px`, minHeight: `${CANVAS_DIMENSIONS.height}px` }}
      >
        <ReactFlow
          className={styles.reactFlow}
          nodes={runtime.flow.nodes}
          edges={runtime.flow.edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={runtime.flow.onNodesChange}
          onEdgesChange={runtime.flow.onEdgesChange}
          onNodeClick={runtime.onNodeClick}
          onNodeDragStart={runtime.onNodeDragStart}
          onNodeDragStop={runtime.onNodeDragStop}
          onPaneClick={runtime.onPaneClick}
          onConnect={runtime.onConnect}
          onConnectStart={() => runtime.ui.notify(runtime.t('notices.connectionStarted'))}
          onConnectEnd={(_event, state) => {
            if (state.isValid) return;
            runtime.ui.notify(
              runtime.t('notices.connectionCancelled'),
              'warning'
            );
          }}
          connectionLineComponent={CanvasConnectionLine}
          connectionRadius={28}
          nodeExtent={[[0, 0], [CANVAS_DIMENSIONS.width, CANVAS_DIMENSIONS.height]]}
          translateExtent={[[0, 0], [CANVAS_DIMENSIONS.width, CANVAS_DIMENSIONS.height]]}
          minZoom={0.55}
          maxZoom={1.8}
          panOnDrag={false}
          zoomOnScroll={false}
          zoomOnDoubleClick={false}
          zoomOnPinch
          preventScrolling={false}
          deleteKeyCode={null}
          selectionKeyCode={null}
          multiSelectionKeyCode={null}
          nodesFocusable
          edgesFocusable
          proOptions={{ hideAttribution: true }}
        />
      </div>
    </div>
  );
}
