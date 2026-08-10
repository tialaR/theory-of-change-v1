import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const controllerRoot = path.join(root, 'src/features/theory-of-change/components/canvas/tdm-canvas-controllers');
const facadePath = path.join(controllerRoot, 'use-canvas-navigation-controller.ts');
const ownerDir = path.join(controllerRoot, 'navigation');
const requiredOwners = [
  'use-canvas-theory-snapshot-controller.ts',
  'use-canvas-example-controller.ts',
  'use-canvas-theory-restore-controller.ts',
  'use-canvas-view-navigation-controller.ts'
];

const fail = (message) => {
  console.error(`FAIL SO-007 Wave 02: ${message}`);
  process.exitCode = 1;
};

if (!fs.existsSync(facadePath)) fail('navigation facade is missing');
if (!fs.existsSync(ownerDir)) fail('navigation owner directory is missing');

for (const file of requiredOwners) {
  const filePath = path.join(ownerDir, file);
  if (!fs.existsSync(filePath)) {
    fail(`missing owner ${file}`);
    continue;
  }
  const lines = fs.readFileSync(filePath, 'utf8').split('\n').length;
  if (lines > 130) fail(`${file} exceeds 130 lines (${lines})`);
}

if (fs.existsSync(facadePath)) {
  const facade = fs.readFileSync(facadePath, 'utf8');
  const facadeLines = facade.split('\n').length;
  if (facadeLines > 70) fail(`navigation facade exceeds 70 lines (${facadeLines})`);

  const forbiddenTokens = [
    'useState(',
    'useCallback(',
    'setNodes(',
    'setEdges(',
    'setTheoryTitle(',
    'setStageCreation(',
    'exampleTheory'
  ];
  for (const token of forbiddenTokens) {
    if (facade.includes(token)) fail(`facade owns navigation implementation detail: ${token}`);
  }

  for (const owner of requiredOwners) {
    const importStem = owner.replace('.ts', '');
    if (!facade.includes(importStem)) fail(`facade does not compose ${owner}`);
  }
}

const restoreOwnerPath = path.join(ownerDir, 'use-canvas-theory-restore-controller.ts');
if (fs.existsSync(restoreOwnerPath)) {
  const restoreOwner = fs.readFileSync(restoreOwnerPath, 'utf8');
  if (restoreOwner.includes('exampleTheory')) fail('restore owner imports example data');
}

const snapshotOwnerPath = path.join(ownerDir, 'use-canvas-theory-snapshot-controller.ts');
if (fs.existsSync(snapshotOwnerPath)) {
  const snapshotOwner = fs.readFileSync(snapshotOwnerPath, 'utf8');
  const forbiddenSnapshotTokens = ['setNodes(', 'setEdges(', 'setViewMode(', 'exampleTheory'];
  for (const token of forbiddenSnapshotTokens) {
    if (snapshotOwner.includes(token)) fail(`snapshot owner mutates navigation surface: ${token}`);
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
  console.log('PASS SO-007 God Hooks Slayer Wave 02: navigation ownership is split and armored.');
}
