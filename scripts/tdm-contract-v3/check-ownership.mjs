#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];

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
  ['src/app/canvas/use-canvas-flow-state.ts', 'src/app/canvas/use-canvas-flow-state.test.tsx'],
  ['src/app/canvas/canvas-project.mapper.ts', 'src/app/canvas/canvas-project.mapper.test.ts'],
  ['src/app/canvas/page.tsx', 'src/app/canvas/canvas.contract.e2e.ts'],
  ['src/features/theory-of-change/canvas-workspace/domain/canvas-connection-policy.ts', 'src/features/theory-of-change/canvas-workspace/domain/canvas-connection-policy.test.ts'],
  ['src/features/theory-of-change/canvas-workspace/react-flow/canvas-react-flow.adapter.ts', 'src/features/theory-of-change/canvas-workspace/react-flow/canvas-react-flow.adapter.test.ts'],
  ['src/features/theory-of-change/components/canvas-resultado/canvas-result-summary.ts', 'src/features/theory-of-change/components/canvas-resultado/canvas-result-summary.test.ts']
];

for (const [owner, test] of ownershipPairs) {
  requireCondition(exists(owner), `owner ausente: ${owner}`);
  requireCondition(exists(test), `teste colocado junto ao owner ausente: ${test}`);
  requireCondition(path.dirname(owner) === path.dirname(test), `teste fora do contexto do owner: ${test}`);
}

const forbiddenLegacyPaths = [
  'src/app/canvas-v4',
  'src/app/canvas/resend-command-preview-v2',
  'src/app/canvas/resend-command-preview-v2.tsx',
  'src/app/canvas/resend-command-preview-v2.model.ts',
  'src/app/canvas/resend-command-preview-v2.icons.tsx',
  'src/app/canvas/resend-command-preview-v2.module.sass',
  'scripts/tdm-contract-v3/check-migration-window.mjs'
];
for (const relativePath of forbiddenLegacyPaths) {
  requireCondition(!exists(relativePath), `andaime legado ainda existe: ${relativePath}`);
}

const officialFiles = [
  'src/app/canvas/page.tsx',
  'src/app/canvas/canvas-workspace.tsx',
  'src/app/canvas/canvas-workspace.model.ts',
  'src/app/canvas/canvas-workspace.icons.tsx',
  'src/app/canvas/use-canvas-flow-state.ts',
  'src/app/canvas/use-canvas-project-persistence.ts'
];
const officialSource = officialFiles.filter(exists).map(read).join('\n');
for (const forbidden of ['resend-command-preview-v2', 'canvas-v4', 'localStorage', 'sessionStorage', 'window.location']) {
  requireCondition(!officialSource.includes(forbidden), `referência proibida no Canvas oficial: ${forbidden}`);
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
      requireCondition(!source.includes('/canvas-workspace/'), `shared depende de implementação privada do Canvas: ${path.relative(root, absolute)}`);
      requireCondition(!source.includes('src/app/canvas'), `shared depende da rota Canvas: ${path.relative(root, absolute)}`);
    }
  }
}

if (errors.length) {
  console.error('\nTDM OWNERSHIP CONTRACT: FAIL\n');
  errors.forEach((error, index) => console.error(`${index + 1}. ${error}.`));
  process.exit(1);
}

console.log('PASS: ownership e colocation do Canvas íntegros.');
