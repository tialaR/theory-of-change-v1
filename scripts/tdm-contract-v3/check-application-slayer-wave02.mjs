import fs from 'node:fs';
import path from 'node:path';

const repo = process.cwd();
const applicationPath = path.join(repo, 'src/features/theory-of-change/canvas/application/canvas-node-actions.ts');
const testPath = path.join(repo, 'src/features/theory-of-change/canvas/application/canvas-node-actions.test.ts');
const hookPath = path.join(repo, 'src/features/theory-of-change/canvas/ui/hooks/use-canvas-node-actions.ts');
const fail = (message) => { console.error(`FAIL SO-010 Wave 02: ${message}`); process.exit(1); };

for (const file of [applicationPath, testPath, hookPath]) {
  if (!fs.existsSync(file)) fail(`missing ${path.relative(repo, file)}`);
}

const application = fs.readFileSync(applicationPath, 'utf8');
const hook = fs.readFileSync(hookPath, 'utf8');
const test = fs.readFileSync(testPath, 'utf8');

for (const token of [
  'updateSelectedCanvasNode',
  'duplicateCanvasNode',
  'deleteCanvasNode',
  'saveCanvasNodeDraft',
  "status: 'not-found'"
]) {
  if (!application.includes(token)) fail(`application node contract missing: ${token}`);
}

for (const forbidden of ['react', '@xyflow/react', '/ui/', '/react-flow/', 'CanvasTranslator', 'notify(']) {
  if (application.includes(forbidden)) fail(`application node actions contain forbidden UI/framework concern: ${forbidden}`);
}

if (!hook.includes("from '../../application/canvas-node-actions'")) {
  fail('node actions hook does not consume the Application node use cases');
}

for (const leakedPolicy of [
  'nodes.find((item) => item.id === nodeId)',
  '...node.data,\n      ...nodeDraft',
  'const duplicate = duplicateFlowNode(nodeId)',
  'const node = deleteFlowNode(nodeId)'
]) {
  if (hook.includes(leakedPolicy)) fail(`node application policy leaked back into UI hook: ${leakedPolicy}`);
}

for (const testCase of ['updates only when a selected node exists', 'merges the editor draft', 'does not save when the draft or node is missing']) {
  if (!test.includes(testCase)) fail(`missing node application regression test: ${testCase}`);
}

console.log('PASS SO-010 Application Slayer Wave 02: node command decisions are owned by Application and UI remains an effects adapter.');
