import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const controllerRoot = path.join(root, 'src/features/theory-of-change/components/canvas/tdm-canvas-controllers');
const facadePath = path.join(controllerRoot, 'use-canvas-marker-controller.ts');
const ownerDir = path.join(controllerRoot, 'marker');
const requiredOwners = [
  'use-canvas-marker-mutation-controller.ts',
  'use-canvas-marker-editor-controller.ts',
  'use-canvas-selected-edge-marker-controller.ts'
];

const fail = (message) => {
  console.error(`FAIL SO-007 Wave 05: ${message}`);
  process.exitCode = 1;
};

if (!fs.existsSync(facadePath)) fail('marker facade is missing');
if (!fs.existsSync(ownerDir)) fail('marker owner directory is missing');

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
  if (lines > 50) fail(`marker facade exceeds 50 lines (${lines})`);
  for (const token of ['useCallback(', 'setEdges(', 'new Date(', 'setMarkerDraft(']) {
    if (facade.includes(token)) fail(`facade owns marker implementation detail: ${token}`);
  }
  for (const owner of requiredOwners) {
    if (!facade.includes(owner.replace('.ts', ''))) fail(`facade does not compose ${owner}`);
  }
}

const mutationOwner = path.join(ownerDir, 'use-canvas-marker-mutation-controller.ts');
if (fs.existsSync(mutationOwner)) {
  const source = fs.readFileSync(mutationOwner, 'utf8');
  for (const token of ['setSelectedNodeId(', 'setToolbarNodeId(', 'setEditingNodeId(']) {
    if (source.includes(token)) fail(`marker mutation owns editor selection concern: ${token}`);
  }
}

const editorOwner = path.join(ownerDir, 'use-canvas-marker-editor-controller.ts');
if (fs.existsSync(editorOwner)) {
  const source = fs.readFileSync(editorOwner, 'utf8');
  for (const token of ['setEdges(', 'markerText', 'GUIDE_RISK_SAVED', 'GUIDE_HYPOTHESIS_SAVED']) {
    if (source.includes(token)) fail(`marker editor owns persistence concern: ${token}`);
  }
}

const selectedEdgeOwner = path.join(ownerDir, 'use-canvas-selected-edge-marker-controller.ts');
if (fs.existsSync(selectedEdgeOwner)) {
  const source = fs.readFileSync(selectedEdgeOwner, 'utf8');
  for (const token of ['new Date(', 'GUIDE_RISK_SAVED', 'GUIDE_HYPOTHESIS_DELETED']) {
    if (source.includes(token)) fail(`selected-edge marker owner owns persistence lifecycle: ${token}`);
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
  console.log('PASS SO-007 God Hooks Slayer Wave 05: marker ownership is split and armored.');
}
