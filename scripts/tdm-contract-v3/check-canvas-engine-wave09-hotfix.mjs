import fs from 'node:fs';

const testPath = 'src/features/theory-of-change/canvas/engine/canvas-engine.test.ts';
const source = fs.readFileSync(testPath, 'utf8');
const required = [
  'width: 800',
  'nodeWidth: 220',
  'resolveCanvasEngineSelection({',
  'selectedNodeId: null',
  'resolveEdgeMetadata: () => null'
];
const forbidden = [
  '{ minX: 0, minY: 0 }',
  'resolveCanvasEngineSelection([], [], null, null'
];
for (const token of required) {
  if (!source.includes(token)) throw new Error(`Wave 09 hotfix missing contract token: ${token}`);
}
for (const token of forbidden) {
  if (source.includes(token)) throw new Error(`Wave 09 hotfix retained obsolete facade call: ${token}`);
}
console.log('PASS SO-012 Canvas Engine Wave 09 v1.1 Facade Test Hotfix');
