import fs from 'node:fs';

const commandPath = 'src/features/theory-of-change/canvas/engine/canvas-engine-commands.ts';
const nodeHookPath = 'src/features/theory-of-change/canvas/ui/hooks/canvas-flow/use-canvas-node-commands.ts';
const edgeHookPath = 'src/features/theory-of-change/canvas/ui/hooks/canvas-flow/use-canvas-edge-commands.ts';
const requiredExports = [
  'appendCanvasEngineNode', 'updateCanvasEngineNode', 'removeCanvasEngineNode',
  'appendCanvasEngineEdge', 'updateCanvasEngineEdge', 'removeCanvasEngineEdge'
];

for (const path of [commandPath, nodeHookPath, edgeHookPath]) {
  if (!fs.existsSync(path)) throw new Error(`Missing SO-012 Wave 03 file: ${path}`);
}
const commandSource = fs.readFileSync(commandPath, 'utf8');
if (commandSource.includes('@xyflow/react') || commandSource.includes("from 'react'")) {
  throw new Error('Canvas command kernel must remain React and XYFlow neutral.');
}
for (const name of requiredExports) {
  if (!commandSource.includes(`export function ${name}`)) throw new Error(`Missing command export: ${name}`);
}
const nodeHook = fs.readFileSync(nodeHookPath, 'utf8');
const edgeHook = fs.readFileSync(edgeHookPath, 'utf8');
for (const name of requiredExports.slice(0, 3)) {
  if (!nodeHook.includes(name)) throw new Error(`Node command hook is not using ${name}.`);
}
for (const name of requiredExports.slice(3)) {
  if (!edgeHook.includes(name)) throw new Error(`Edge command hook is not using ${name}.`);
}
if (!commandSource.includes('edge.source !== nodeId && edge.target !== nodeId')) {
  throw new Error('Node removal must keep incident-edge cleanup inside the command kernel.');
}
console.log('PASS SO-012 Canvas Engine Wave 03 Command Kernel');
