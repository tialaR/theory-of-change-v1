import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const controllerRoot = path.join(root, 'src/features/theory-of-change/components/canvas/tdm-canvas-controllers');
const facadePath = path.join(controllerRoot, 'use-canvas-node-crud-controller.ts');
const ownerDir = path.join(controllerRoot, 'node-crud');
const requiredOwners = [
  'use-canvas-node-editor-controller.ts',
  'use-canvas-node-creation-controller.ts',
  'use-canvas-node-mutation-controller.ts',
  'use-canvas-node-accordion-controller.ts'
];

const fail = (message) => {
  console.error(`FAIL SO-007 Wave 01: ${message}`);
  process.exitCode = 1;
};

if (!fs.existsSync(facadePath)) fail('node CRUD facade is missing');
if (!fs.existsSync(ownerDir)) fail('node CRUD owner directory is missing');

for (const file of requiredOwners) {
  const filePath = path.join(ownerDir, file);
  if (!fs.existsSync(filePath)) {
    fail(`missing owner ${file}`);
    continue;
  }
  const lines = fs.readFileSync(filePath, 'utf8').split('\n').length;
  if (lines > 150) fail(`${file} exceeds 150 lines (${lines})`);
}

if (fs.existsSync(facadePath)) {
  const facade = fs.readFileSync(facadePath, 'utf8');
  const facadeLines = facade.split('\n').length;
  if (facadeLines > 80) fail(`node CRUD facade exceeds 80 lines (${facadeLines})`);

  const forbiddenImplementationTokens = [
    'useCallback(',
    'createNode(',
    'getCreateNodePosition(',
    'getDuplicateNodePosition(',
    'setNodes((currentNodes)',
    'setEdges((currentEdges)'
  ];
  for (const token of forbiddenImplementationTokens) {
    if (facade.includes(token)) fail(`facade owns implementation detail: ${token}`);
  }

  for (const owner of requiredOwners) {
    const importStem = owner.replace('.ts', '');
    if (!facade.includes(importStem)) fail(`facade does not compose ${owner}`);
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

if (!process.exitCode) console.log('PASS SO-007 God Hooks Slayer Wave 01: node CRUD ownership is split and armored.');
