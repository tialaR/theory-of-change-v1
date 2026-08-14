#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];
const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const lines = (relativePath) => read(relativePath).split('\n').length;
const requireCondition = (condition, message) => { if (!condition) errors.push(message); };

const ownershipPairs = [
  ['src/features/auth/domain/auth.validation.ts', 'src/features/auth/domain/auth.validation.test.ts'],
  ['src/features/auth/application/authenticate-user.ts', 'src/features/auth/application/authenticate-user.test.ts'],
  ['src/features/auth/infrastructure/http/http-auth.repository.ts', 'src/features/auth/infrastructure/http/http-auth.repository.test.ts'],
  ['src/features/auth/infrastructure/msw/auth.handlers.ts', 'src/features/auth/infrastructure/msw/auth.handlers.test.ts'],
  ['src/features/auth/ui/login/login-form.tsx', 'src/features/auth/ui/login/login-form.test.tsx'],
  ['src/features/auth/ui/login/login-page.tsx', 'src/features/auth/ui/login/login.e2e.ts'],
  ['src/features/theory-of-change/canvas/domain/canvas-connection-policy.ts', 'src/features/theory-of-change/canvas/domain/canvas-connection-policy.test.ts'],
  ['src/features/theory-of-change/canvas/application/canvas-layout.ts', 'src/features/theory-of-change/canvas/application/canvas-layout.test.ts'],
  ['src/features/theory-of-change/canvas/application/create-canvas-project.ts', 'src/features/theory-of-change/canvas/application/create-canvas-project.test.ts'],
  ['src/features/theory-of-change/canvas/application/get-or-create-canvas-project.ts', 'src/features/theory-of-change/canvas/application/get-or-create-canvas-project.test.ts'],
  ['src/features/theory-of-change/canvas/application/save-canvas-project.ts', 'src/features/theory-of-change/canvas/application/save-canvas-project.test.ts'],
  ['src/features/theory-of-change/canvas/react-flow/canvas-react-flow.adapter.ts', 'src/features/theory-of-change/canvas/react-flow/canvas-react-flow.adapter.test.ts'],
  ['src/features/theory-of-change/canvas/infrastructure/http/http-canvas-project.repository.ts', 'src/features/theory-of-change/canvas/infrastructure/http/http-canvas-project.repository.test.ts'],
  ['src/features/theory-of-change/canvas/infrastructure/msw/canvas-project.handlers.ts', 'src/features/theory-of-change/canvas/infrastructure/msw/canvas-project.handlers.test.ts'],
  ['src/features/theory-of-change/canvas/ui/canvas-result/canvas-result-summary.ts', 'src/features/theory-of-change/canvas/ui/canvas-result/canvas-result-summary.test.ts'],
  ['src/features/theory-of-change/canvas/ui/canvas-workspace/canvas-workspace.tsx', 'src/features/theory-of-change/canvas/ui/canvas-workspace/canvas-workspace.e2e.ts'],
  ['src/shared/ui/tdm-status-screen/tdm-status-screen.tsx', 'src/shared/ui/tdm-status-screen/tdm-status-screen.e2e.ts']
];

for (const [owner, test] of ownershipPairs) {
  requireCondition(exists(owner), `owner ausente: ${owner}`);
  requireCondition(exists(test), `teste colocado junto ao owner ausente: ${test}`);
  requireCondition(path.dirname(owner) === path.dirname(test), `teste fora do contexto do owner: ${test}`);
}

const routeRules = [
  { root: 'src/app/canvas', allowed: new Set(['error.tsx', 'layout.tsx', 'loading.tsx', 'page.tsx', 'resultado']) },
  { root: 'src/app/login', allowed: new Set(['page.tsx']) }
];
for (const rule of routeRules) {
  if (!exists(rule.root)) continue;
  for (const entry of fs.readdirSync(path.join(root, rule.root), { withFileTypes: true })) {
    requireCondition(rule.allowed.has(entry.name), `app contém implementação que deveria pertencer à feature: ${rule.root}/${entry.name}`);
  }
}

for (const page of ['src/app/canvas/page.tsx', 'src/app/canvas/resultado/page.tsx', 'src/app/login/page.tsx']) {
  if (!exists(page)) continue;
  requireCondition(!read(page).includes("'use client'"), `page de rota não pode ser Client Component: ${page}`);
  requireCondition(lines(page) <= 10, `page de rota deixou de ser fina (${lines(page)}/10): ${page}`);
}

const canvasErrorBoundary = 'src/app/canvas/error.tsx';
if (exists(canvasErrorBoundary)) {
  const source = read(canvasErrorBoundary);
  requireCondition(source.includes("'use client'"), 'error boundary do Canvas precisa permanecer Client Component');
  requireCondition(
    source.includes("@/shared/ui/tdm-status-screen"),
    'error boundary do Canvas deve delegar a apresentação ao status screen compartilhado'
  );
  requireCondition(
    source.includes('<TdmRouteError'),
    'error boundary do Canvas deixou de delegar para TdmRouteError'
  );
  requireCondition(
    lines(canvasErrorBoundary) <= 16,
    `error boundary do Canvas deixou de ser fina (${lines(canvasErrorBoundary)}/16)`
  );
}

const featureRoots = ['src/features/auth', 'src/features/theory-of-change/canvas'];
for (const featureRoot of featureRoots) {
  if (!exists(featureRoot)) continue;
  const stack = [featureRoot];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(path.join(root, current), { withFileTypes: true })) {
      const relative = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(relative);
      if (!entry.isFile() || !/\.(ts|tsx)$/.test(entry.name)) continue;
      const source = read(relative);
      requireCondition(!source.includes('@/app/'), `feature depende de rota App Router: ${relative}`);
      if (/\.(test|e2e)\./.test(entry.name)) continue;
      const threshold = relative.includes('/hooks/') ? 360 : 260;
      requireCondition(lines(relative) <= threshold, `arquivo excede limite anti-God (${lines(relative)}/${threshold}): ${relative}`);
    }
  }
}

if (errors.length) {
  console.error('\nTDM OWNERSHIP CONTRACT: FAIL\n');
  errors.forEach((error, index) => console.error(`${index + 1}. ${error}.`));
  process.exit(1);
}

console.log('PASS: ownership, colocation, app fino e limites anti-God íntegros.');
