'use client';

import {
  ReactFlow,
  SelectionMode,
  type EdgeTypes,
  type NodeTypes
} from '@xyflow/react';
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
      >
        <ReactFlow
          className={styles.reactFlow}
          nodes={runtime.flow.nodes}
          edges={runtime.flow.edges}
          defaultViewport={runtime.viewport}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={runtime.flow.onNodesChange}
          onEdgesChange={runtime.flow.onEdgesChange}
          onNodeClick={runtime.onNodeClick}
          onNodeDragStart={runtime.onNodeDragStart}
          onNodeDragStop={runtime.onNodeDragStop}
          onPaneClick={runtime.onPaneClick}
          onMoveEnd={(_event, viewport) => runtime.onViewportChange(viewport)}
          onConnect={runtime.onConnect}
          connectionLineComponent={CanvasConnectionLine}
          connectionRadius={28}
          minZoom={0.32}
          maxZoom={2}
          panOnDrag={[0, 1, 2]}
          panOnScroll={false}
          zoomOnScroll
          zoomOnDoubleClick={false}
          zoomOnPinch
          preventScrolling
          selectionOnDrag
          selectionMode={SelectionMode.Partial}
          selectionKeyCode="Shift"
          multiSelectionKeyCode="Shift"
          deleteKeyCode={null}
          nodesFocusable
          edgesFocusable
          proOptions={{ hideAttribution: true }}
        />
      </div>
    </div>
  );
}
