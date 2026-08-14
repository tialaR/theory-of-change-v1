import fs from 'node:fs';

const historyKernelPath = 'src/features/theory-of-change/canvas/engine/canvas-engine-history.ts';
const historyHookPath = 'src/features/theory-of-change/canvas/ui/hooks/canvas-flow/use-canvas-flow-history.ts';
const nodeHookPath = 'src/features/theory-of-change/canvas/ui/hooks/canvas-flow/use-canvas-node-commands.ts';
const testPath = 'src/features/theory-of-change/canvas/engine/canvas-engine-history.test.ts';
const wave02GatePath = 'scripts/tdm-contract-v3/check-canvas-engine-wave02.mjs';

for (const path of [historyKernelPath, historyHookPath, nodeHookPath, testPath, wave02GatePath]) {
  if (!fs.existsSync(path)) throw new Error(`Missing SO-012 Wave 04 file: ${path}`);
}

const kernel = fs.readFileSync(historyKernelPath, 'utf8');
const hook = fs.readFileSync(historyHookPath, 'utf8');
const nodeHook = fs.readFileSync(nodeHookPath, 'utf8');
const wave02Gate = fs.readFileSync(wave02GatePath, 'utf8');

if (kernel.includes('@xyflow/react') || kernel.includes("from 'react'")) {
  throw new Error('Canvas history kernel must remain React and XYFlow neutral.');
}

for (const name of ['captureCanvasEngineHistory', 'undoCanvasEngineHistory', 'redoCanvasEngineHistory']) {
  if (!kernel.includes(`export function ${name}`)) throw new Error(`Missing history export: ${name}`);
  if (!hook.includes(name)) throw new Error(`History hook is not using ${name}.`);
}

for (const forbidden of ['history.at(-1)', 'items.slice(0, -1)', 'items.slice(1)']) {
  if (hook.includes(forbidden)) throw new Error(`History orchestration leaked back into UI hook: ${forbidden}`);
}

if (!wave02Gate.includes('downstreamHistoryKernel')) {
  throw new Error('Wave 02 gate must explicitly protect downstream history-kernel progression.');
}

if (!nodeHook.includes('[capture, edges, nodes, setEdges, setNodes]')) {
  throw new Error('Node deletion callback must track edges to avoid stale incident-edge cleanup.');
}

console.log('PASS SO-012 Canvas Engine Wave 04 History Orchestration');
