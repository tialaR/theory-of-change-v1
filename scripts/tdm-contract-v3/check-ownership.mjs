#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];
const featureRoot = 'src/features/theory-of-change/canvas';

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function requireCondition(condition, message) {
  if (!condition) errors.push(message);
}

const ownershipPairs = [
  [`${featureRoot}/domain/canvas-connection-policy.ts`, `${featureRoot}/domain/canvas-connection-policy.test.ts`],
  [`${featureRoot}/application/canvas-layout.ts`, `${featureRoot}/application/canvas-layout.test.ts`],
  [`${featureRoot}/application/create-canvas-project.ts`, `${featureRoot}/application/create-canvas-project.test.ts`],
  [`${featureRoot}/application/save-canvas-project.ts`, `${featureRoot}/application/save-canvas-project.test.ts`],
  [`${featureRoot}/react-flow/canvas-react-flow.adapter.ts`, `${featureRoot}/react-flow/canvas-react-flow.adapter.test.ts`],
  [`${featureRoot}/infrastructure/http/http-canvas-project.repository.ts`, `${featureRoot}/infrastructure/http/http-canvas-project.repository.test.ts`],
  [`${featureRoot}/infrastructure/msw/canvas-project.handlers.ts`, `${featureRoot}/infrastructure/msw/canvas-project.handlers.test.ts`],
  [`${featureRoot}/ui/canvas-workspace/canvas-workspace.tsx`, `${featureRoot}/ui/canvas-workspace/canvas-workspace.e2e.ts`],
  ['src/features/theory-of-change/components/canvas-resultado/canvas-result-summary.ts', 'src/features/theory-of-change/components/canvas-resultado/canvas-result-summary.test.ts']
];

for (const [owner, test] of ownershipPairs) {
  requireCondition(exists(owner), `owner ausente: ${owner}`);
  requireCondition(exists(test), `teste colocado junto ao owner ausente: ${test}`);
  requireCondition(path.dirname(owner) === path.dirname(test), `teste fora do contexto do owner: ${test}`);
}

const forbiddenRouteOwnedLogic = [
  'src/app/canvas/canvas-workspace.tsx',
  'src/app/canvas/canvas-workspace.model.ts',
  'src/app/canvas/canvas-workspace.icons.tsx',
  'src/app/canvas/use-canvas-flow-state.ts',
  'src/app/canvas/use-canvas-project-persistence.ts',
  'src/app/canvas/canvas-project.mapper.ts',
  'src/app/canvas/canvas.contract.e2e.ts'
];
for (const relativePath of forbiddenRouteOwnedLogic) {
  requireCondition(!exists(relativePath), `lógica privada ainda pertence à rota: ${relativePath}`);
}

const appCanvasAllowed = new Set(['layout.tsx', 'loading.tsx', 'page.tsx', 'resultado']);
const appCanvasRoot = path.join(root, 'src/app/canvas');
if (fs.existsSync(appCanvasRoot)) {
  for (const entry of fs.readdirSync(appCanvasRoot, { withFileTypes: true })) {
    requireCondition(appCanvasAllowed.has(entry.name), `app/canvas deixou de ser fino: ${entry.name}`);
  }
}

const indexPath = `${featureRoot}/index.ts`;
requireCondition(exists(indexPath), 'índice público da feature ausente');
if (exists(indexPath)) {
  const source = read(indexPath);
  requireCondition(source.includes("export { CanvasPage }"), 'CanvasPage não está exposto no índice público');
  requireCondition(!source.includes('/ui/components/'), 'índice público vazou componente privado');
  requireCondition(!source.includes('/ui/hooks/'), 'índice público vazou hook privado');
}

const sharedRoot = path.join(root, 'src/shared');
if (fs.existsSync(sharedRoot)) {
  const stack = [sharedRoot];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(absolute);
      if (!entry.isFile() || !/\.(ts|tsx)$/.test(entry.name)) continue;
      const source = fs.readFileSync(absolute, 'utf8');
      requireCondition(!source.includes('/theory-of-change/canvas/'), `shared depende da feature privada Canvas: ${path.relative(root, absolute)}`);
      requireCondition(!source.includes('src/app/canvas'), `shared depende da rota Canvas: ${path.relative(root, absolute)}`);
    }
  }
}

const featureRootAbsolute = path.join(root, featureRoot);
if (fs.existsSync(featureRootAbsolute)) {
  const stack = [featureRootAbsolute];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(absolute);
      if (!entry.isFile() || !/\.(ts|tsx)$/.test(entry.name)) continue;
      const source = fs.readFileSync(absolute, 'utf8');
      requireCondition(!source.includes('@/app/canvas'), `feature depende da rota: ${path.relative(root, absolute)}`);
    }
  }
}

if (errors.length) {
  console.error('\nTDM OWNERSHIP CONTRACT: FAIL\n');
  errors.forEach((error, index) => console.error(`${index + 1}. ${error}.`));
  process.exit(1);
}

console.log('PASS: ownership, colocation e app fino íntegros.');
