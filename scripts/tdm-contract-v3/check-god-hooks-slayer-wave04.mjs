import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const controllerRoot = path.join(root, 'src/features/theory-of-change/components/canvas/tdm-canvas-controllers');
const facadePath = path.join(controllerRoot, 'use-canvas-interaction-controller.ts');
const ownerDir = path.join(controllerRoot, 'interaction');
const requiredOwners = [
  'use-canvas-toolbar-interaction.ts',
  'use-canvas-pane-interaction.ts',
  'use-canvas-node-interaction.ts',
  'use-canvas-edge-interaction.ts'
];

const fail = (message) => {
  console.error(`FAIL SO-007 Wave 04: ${message}`);
  process.exitCode = 1;
};

if (!fs.existsSync(facadePath)) fail('interaction facade is missing');
if (!fs.existsSync(ownerDir)) fail('interaction owner directory is missing');

for (const file of requiredOwners) {
  const filePath = path.join(ownerDir, file);
  if (!fs.existsSync(filePath)) {
    fail(`missing owner ${file}`);
    continue;
  }
  const lines = fs.readFileSync(filePath, 'utf8').split('\n').length;
  if (lines > 100) fail(`${file} exceeds 100 lines (${lines})`);
}

if (fs.existsSync(facadePath)) {
  const facade = fs.readFileSync(facadePath, 'utf8');
  const lines = facade.split('\n').length;
  if (lines > 50) fail(`interaction facade exceeds 50 lines (${lines})`);
  for (const token of ['useCallback(', 'setSelectedNodeId(', 'setSelectedEdgeId(', 'event.stopPropagation(']) {
    if (facade.includes(token)) fail(`facade owns interaction implementation detail: ${token}`);
  }
  for (const owner of requiredOwners) {
    if (!facade.includes(owner.replace('.ts', ''))) fail(`facade does not compose ${owner}`);
  }
}

const nodeOwner = path.join(ownerDir, 'use-canvas-node-interaction.ts');
if (fs.existsSync(nodeOwner)) {
  const source = fs.readFileSync(nodeOwner, 'utf8');
  for (const token of ['markerText', 'setMarkerDraft(', "closest('.react-flow"]) {
    if (source.includes(token)) fail(`node interaction owns edge/pane concern: ${token}`);
  }
}

const edgeOwner = path.join(ownerDir, 'use-canvas-edge-interaction.ts');
if (fs.existsSync(edgeOwner)) {
  const source = fs.readFileSync(edgeOwner, 'utf8');
  for (const token of ['nodes.find(', 'openNodeEditor(', "closest('.react-flow"]) {
    if (source.includes(token)) fail(`edge interaction owns node/pane concern: ${token}`);
  }
}

const paneOwner = path.join(ownerDir, 'use-canvas-pane-interaction.ts');
if (fs.existsSync(paneOwner)) {
  const source = fs.readFileSync(paneOwner, 'utf8');
  for (const token of ['openNodeEditor(', 'markerText', 'syncEditDraftFromNode(']) {
    if (source.includes(token)) fail(`pane interaction owns node/edge concern: ${token}`);
  }
}

const scssFiles = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(absolute);
    else if (entry.name.endsWith('.scss')) scssFiles.push(path.relative(root, absolute));
  }
};
walk(path.join(root, 'src'));
if (scssFiles.length) fail(`forbidden .scss files detected: ${scssFiles.join(', ')}`);

if (!process.exitCode) {
  console.log('PASS SO-007 God Hooks Slayer Wave 04: interaction ownership is split and armored.');
}
