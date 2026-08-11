#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const exists = (rel) => fs.existsSync(path.join(root, rel));
const json = (rel) => JSON.parse(read(rel));
const requireCondition = (condition, message) => { if (!condition) errors.push(message); };

const required = [
  'src/app/canvas/page.tsx',
  'src/app/canvas/resultado/page.tsx',
  'src/features/theory-of-change/canvas/canvas-page.tsx',
  'src/features/theory-of-change/canvas/canvas-result-page.tsx',
  'src/features/theory-of-change/canvas/server/get-current-canvas-project.ts',
  'docs/sharkops/SO-016-AUTH-PROTECTED-SURFACE-AUDIT.json'
];
required.forEach((rel) => requireCondition(exists(rel), `artefato obrigatorio ausente: ${rel}`));

if (!errors.length) {
  const canvasRoute = read('src/app/canvas/page.tsx');
  const resultRoute = read('src/app/canvas/resultado/page.tsx');
  const canvasPage = read('src/features/theory-of-change/canvas/canvas-page.tsx');
  const resultPage = read('src/features/theory-of-change/canvas/canvas-result-page.tsx');
  const loader = read('src/features/theory-of-change/canvas/server/get-current-canvas-project.ts');
  const audit = json('docs/sharkops/SO-016-AUTH-PROTECTED-SURFACE-AUDIT.json');
  const ledger = json('.sharkops/state/bite-ledger.json');
  const so16 = (ledger.bites ?? []).find((item) => item.id === 'SO-016');
  const finding = (audit.findings ?? []).find((item) => item.id === 'AUTH-002');

  requireCondition(canvasRoute.includes("requireAuthenticatedSession('/canvas')"), '/canvas nao autentica no route entry');
  requireCondition(resultRoute.includes("requireAuthenticatedSession('/canvas/resultado')"), '/canvas/resultado nao autentica no route entry com returnTo exato');
  requireCondition(canvasRoute.includes('<CanvasPage user={user} />'), '/canvas nao entrega usuario autenticado explicitamente a feature');
  requireCondition(resultRoute.includes('<CanvasResultPage user={user} />'), '/canvas/resultado nao entrega usuario autenticado explicitamente a feature');

  requireCondition(canvasPage.includes('user: AuthUser'), 'CanvasPage nao declara usuario autenticado como dependencia explicita');
  requireCondition(resultPage.includes('user: AuthUser'), 'CanvasResultPage nao declara usuario autenticado como dependencia explicita');
  requireCondition(!canvasPage.includes('requireAuthenticatedSession') && !resultPage.includes('requireAuthenticatedSession'), 'feature page voltou a possuir route protection');
  requireCondition(!loader.includes('requireAuthenticatedSession') && !loader.includes("from '@/features/auth/server/auth-session'"), 'project loader voltou a possuir ownership de autenticacao');
  requireCondition(loader.includes('getCurrentCanvasProject(ownerId: string)'), 'project loader nao recebe ownerId explicitamente');
  requireCondition(loader.includes('getOrCreateCanvasProject(repository, ownerId'), 'project loader nao usa ownerId fornecido pela fronteira autenticada');

  requireCondition(finding?.status === 'RESOLVED-WAVE-03', 'AUTH-002 nao esta resolvido explicitamente pela Wave 03');
  if ((so16?.revision ?? 0) === 3) {
    requireCondition(audit.nextBite?.targetFinding === 'AUTH-003', 'proxima mordida canonica da Wave 03 deve atacar AUTH-003');
  } else {
    requireCondition((so16?.revision ?? 0) > 3, 'progressao posterior a Wave 03 deve elevar a revisao SO-016');
  }
}

if (errors.length) {
  console.error('\nSO-016 WAVE 03 PROTECTED ROUTE OWNERSHIP CONTRACT: FAIL\n');
  errors.forEach((error, index) => console.error(`${index + 1}. ${error}.`));
  process.exit(1);
}

console.log('PASS SO-016 Wave 03: /canvas and /canvas/resultado own authentication at their route entries with exact returnTo contracts, while Canvas feature loaders consume an already-authenticated user identity.');
