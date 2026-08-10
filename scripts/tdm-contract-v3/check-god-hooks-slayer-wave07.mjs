import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const base = 'src/features/theory-of-change/canvas/ui/hooks';
const files = {
  facade: `${base}/use-canvas-flow-controller.ts`,
  history: `${base}/canvas-flow/use-canvas-flow-history.ts`,
  nodes: `${base}/canvas-flow/use-canvas-node-commands.ts`,
  edges: `${base}/canvas-flow/use-canvas-edge-commands.ts`,
  layout: `${base}/canvas-flow/use-canvas-layout-commands.ts`,
  types: `${base}/canvas-flow/types.ts`
};

for (const [owner, rel] of Object.entries(files)) {
  if (!fs.existsSync(path.join(root, rel))) throw new Error(`Missing ${owner} owner: ${rel}`);
}

const budgets = { facade: 90, history: 100, nodes: 150, edges: 110, layout: 60, types: 30 };
for (const [owner, rel] of Object.entries(files)) {
  const source = fs.readFileSync(path.join(root, rel), 'utf8');
  const lines = source.split(/\r?\n/).length;
  if (lines > budgets[owner]) throw new Error(`${owner} exceeded ${budgets[owner]} lines: ${lines}`);
  if (/\.scss['"]/.test(source)) throw new Error(`${owner} introduced forbidden .scss import`);
}

const facade = fs.readFileSync(path.join(root, files.facade), 'utf8');
for (const owner of ['useCanvasFlowHistory', 'useCanvasNodeCommands', 'useCanvasEdgeCommands', 'useCanvasLayoutCommands']) {
  if (!facade.includes(owner)) throw new Error(`Flow facade is missing ${owner}`);
}
for (const forbidden of ['createCanvasNodeId', 'createCanvasEdgeId', 'evaluateCanvasConnection', 'centralizeCanvasColumns', 'organizeCanvasFlow', 'structuredClone']) {
  if (facade.includes(forbidden)) throw new Error(`Flow facade reclaimed forbidden implementation detail: ${forbidden}`);
}

const history = fs.readFileSync(path.join(root, files.history), 'utf8');
if (!history.includes('history') || !history.includes('future') || !history.includes('beginNodeDrag')) {
  throw new Error('History owner must own undo/redo and drag snapshot lifecycle');
}
const nodes = fs.readFileSync(path.join(root, files.nodes), 'utf8');
for (const command of ['createNode', 'updateNode', 'duplicateNode', 'deleteNode']) {
  if (!nodes.includes(command)) throw new Error(`Node owner is missing ${command}`);
}
const edges = fs.readFileSync(path.join(root, files.edges), 'utf8');
for (const command of ['connectNodes', 'saveRelation', 'removeRelation', 'deleteEdge']) {
  if (!edges.includes(command)) throw new Error(`Edge owner is missing ${command}`);
}

console.log('PASS SO-007 God Hooks Slayer Wave 07: flow state, history, node, edge and layout ownership are split and armored.');
