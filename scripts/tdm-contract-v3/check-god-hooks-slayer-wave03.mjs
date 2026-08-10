import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const controllerRoot = path.join(root, 'src/features/theory-of-change/components/canvas/tdm-canvas-controllers');
const facadePath = path.join(controllerRoot, 'use-canvas-stage-guide-controller.ts');
const ownerDir = path.join(controllerRoot, 'stage-guide');
const requiredOwners = [
  'use-canvas-stage-progress-controller.ts',
  'use-canvas-result-availability-controller.ts',
  'use-canvas-theory-completion-lifecycle.ts',
  'use-canvas-guide-presentation-controller.ts'
];

const fail = (message) => {
  console.error(`FAIL SO-007 Wave 03: ${message}`);
  process.exitCode = 1;
};

if (!fs.existsSync(facadePath)) fail('stage guide facade is missing');
if (!fs.existsSync(ownerDir)) fail('stage guide owner directory is missing');

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
  if (facadeLines > 70) fail(`stage guide facade exceeds 70 lines (${facadeLines})`);

  const forbiddenTokens = [
    'useState(',
    'useEffect(',
    'useMemo(',
    'useCallback(',
    'getTheoryGuideContent(',
    'canViewTdmResult(',
    'getNextStageCreation('
  ];
  for (const token of forbiddenTokens) {
    if (facade.includes(token)) fail(`facade owns stage guide implementation detail: ${token}`);
  }

  for (const owner of requiredOwners) {
    const importStem = owner.replace('.ts', '');
    if (!facade.includes(importStem)) fail(`facade does not compose ${owner}`);
  }
}

const lifecyclePath = path.join(ownerDir, 'use-canvas-theory-completion-lifecycle.ts');
if (fs.existsSync(lifecyclePath)) {
  const lifecycle = fs.readFileSync(lifecyclePath, 'utf8');
  for (const token of ['setStageCreation(', 'getTheoryGuideContent(', 'getStageCounts(']) {
    if (lifecycle.includes(token)) fail(`completion lifecycle owns domain coordination: ${token}`);
  }
}

const progressPath = path.join(ownerDir, 'use-canvas-stage-progress-controller.ts');
if (fs.existsSync(progressPath)) {
  const progress = fs.readFileSync(progressPath, 'utf8');
  for (const token of ['getTheoryGuideContent(', 'canViewTdmResult(', 'theoryCompleteToast(']) {
    if (progress.includes(token)) fail(`stage progress owns guide/result lifecycle detail: ${token}`);
  }
}

const presentationPath = path.join(ownerDir, 'use-canvas-guide-presentation-controller.ts');
if (fs.existsSync(presentationPath)) {
  const presentation = fs.readFileSync(presentationPath, 'utf8');
  for (const token of ['setStageCreation(', 'showFlowTooltip(', 'clearFlowTooltipEvent(']) {
    if (presentation.includes(token)) fail(`guide presentation owns navigation/lifecycle detail: ${token}`);
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
  console.log('PASS SO-007 God Hooks Slayer Wave 03: stage guide ownership is split and armored.');
}
