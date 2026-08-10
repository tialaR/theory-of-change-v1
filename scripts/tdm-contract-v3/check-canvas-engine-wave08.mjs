import fs from 'node:fs';

const enginePath = 'src/features/theory-of-change/canvas/engine/canvas-engine-interaction.ts';
const testPath = 'src/features/theory-of-change/canvas/engine/canvas-engine-interaction.test.ts';
const edgeHookPath = 'src/features/theory-of-change/canvas/ui/hooks/canvas-flow/use-canvas-edge-commands.ts';
const dropHookPath = 'src/features/theory-of-change/canvas/ui/hooks/use-canvas-stage-drag-and-drop.ts';

for (const file of [enginePath, testPath, edgeHookPath, dropHookPath]) {
  if (!fs.existsSync(file)) throw new Error(`Wave 08 missing required file: ${file}`);
}

const engine = fs.readFileSync(enginePath, 'utf8');
const edgeHook = fs.readFileSync(edgeHookPath, 'utf8');
const dropHook = fs.readFileSync(dropHookPath, 'utf8');

if (!engine.includes('resolveCanvasEngineConnection')) throw new Error('Connection interaction resolver is missing.');
if (!engine.includes('constrainCanvasEngineDropPosition')) throw new Error('Drop-position constraint is missing.');
if (/@xyflow\/react|from ['"]react['"]|DragEvent|dataTransfer|requestAnimationFrame/.test(engine)) {
  throw new Error('Interaction kernel must remain free of React, React Flow and browser event APIs.');
}
if (!edgeHook.includes("from '../../../engine/canvas-engine'")) {
  throw new Error('Edge commands must delegate connection decisions to the interaction kernel.');
}
if (!edgeHook.includes('resolveCanvasEngineConnection')) {
  throw new Error('Edge commands are not using the interaction resolver.');
}
if (edgeHook.includes("connection.source === connection.target") || edgeHook.includes("duplicate-connection'")) {
  throw new Error('UI edge commands must not re-own connection validation decisions.');
}
if (!dropHook.includes("from '../../engine/canvas-engine'")) {
  throw new Error('Stage drag/drop hook must delegate bounded positioning to the interaction kernel.');
}
if (dropHook.includes('function constrainStagePosition')) {
  throw new Error('Legacy UI drop-position helper still exists.');
}

console.log('PASS SO-012 Canvas Engine Wave 08 Interaction Boundary');
