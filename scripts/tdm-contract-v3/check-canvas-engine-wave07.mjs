import fs from 'node:fs';

const enginePath = 'src/features/theory-of-change/canvas/engine/canvas-engine-selection.ts';
const testPath = 'src/features/theory-of-change/canvas/engine/canvas-engine-selection.test.ts';
const hookPath = 'src/features/theory-of-change/canvas/ui/hooks/use-canvas-selection.ts';

for (const file of [enginePath, testPath, hookPath]) {
  if (!fs.existsSync(file)) throw new Error(`Wave 07 missing required file: ${file}`);
}

const engine = fs.readFileSync(enginePath, 'utf8');
const hook = fs.readFileSync(hookPath, 'utf8');

if (!engine.includes('resolveCanvasEngineSelection')) throw new Error('Selection resolver is missing.');
if (/@xyflow\/react|from ['"]react['"]/.test(engine)) throw new Error('Selection kernel must remain React and React Flow neutral.');
if (!hook.includes("from '../../engine/canvas-engine'")) throw new Error('UI selection hook must delegate to the Engine selection kernel.');
if (!hook.includes('selectedRelationKind: selection.selectedEdgeMetadata')) throw new Error('UI compatibility mapping for relation kind is missing.');
if (hook.includes('nodes.find(') || hook.includes('edges.find(')) throw new Error('UI hook must not re-own selection graph resolution.');

console.log('PASS SO-012 Canvas Engine Wave 07 Selection Boundary');
