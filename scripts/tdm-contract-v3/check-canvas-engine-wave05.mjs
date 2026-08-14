import fs from 'node:fs';

const enginePath = 'src/features/theory-of-change/canvas/engine/canvas-engine-layout.ts';
const applicationPath = 'src/features/theory-of-change/canvas/application/canvas-layout.ts';
const testPath = 'src/features/theory-of-change/canvas/engine/canvas-engine-layout.test.ts';
const handoffPath = 'docs/sharkops/HANDOFF.md';

for (const path of [enginePath, applicationPath, testPath, handoffPath]) {
  if (!fs.existsSync(path)) throw new Error(`Missing SO-012 Wave 05 file: ${path}`);
}

const engine = fs.readFileSync(enginePath, 'utf8');
const application = fs.readFileSync(applicationPath, 'utf8');
const handoff = fs.readFileSync(handoffPath, 'utf8');

for (const forbidden of ["from 'react'", '@xyflow/react', 'CANVAS_COLUMN_X', 'CANVAS_DIMENSIONS']) {
  if (engine.includes(forbidden)) throw new Error(`Canvas layout engine leaked framework/product policy: ${forbidden}`);
}

for (const name of ['centralizeCanvasEngineColumns', 'organizeCanvasEngineFlow']) {
  if (!engine.includes(`export function ${name}`)) throw new Error(`Missing layout engine export: ${name}`);
  if (!application.includes(name)) throw new Error(`Application layout policy is not delegating to ${name}.`);
}

for (const forbidden of ['positionsById', 'connectionCounts', '.sort((first, second)']) {
  if (application.includes(forbidden)) throw new Error(`Generic layout algorithm leaked back into Application: ${forbidden}`);
}

if (!application.includes('CANVAS_LAYOUT_POLICY')) {
  throw new Error('Application must retain an explicit product layout policy.');
}

if (!handoff.includes('SO-012 Wave 05 layout-command boundary:')) {
  throw new Error('SharkOps handoff is missing the Wave 05 boundary.');
}

console.log('PASS SO-012 Canvas Engine Wave 05 Layout Command Boundary');
