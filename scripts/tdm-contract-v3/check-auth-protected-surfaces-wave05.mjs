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
  'src/features/auth/index.ts',
  'src/features/auth/server/index.ts',
  'src/app/login/page.tsx',
  'src/features/theory-of-change/canvas/ui/components/canvas-header.tsx',
  'src/features/theory-of-change/canvas/ui/canvas-result/canvas-result-view.tsx',
  'src/features/theory-of-change/canvas/server/save-canvas-project.action.ts',
  'scripts/tdm-contract-v3/check-auth-protected-surfaces-wave04.mjs',
  'docs/sharkops/SO-016-AUTH-PROTECTED-SURFACE-AUDIT.json'
];
required.forEach((rel) => requireCondition(exists(rel), `artefato obrigatorio ausente: ${rel}`));

if (!errors.length) {
  const facade = read('src/features/auth/index.ts');
  const audit = json('docs/sharkops/SO-016-AUTH-PROTECTED-SURFACE-AUDIT.json');
  const auth004 = (audit.findings ?? []).find((item) => item.id === 'AUTH-004');

  requireCondition(facade.includes("export type { AuthUser, AuthenticatedSession } from './domain/auth.types';"), 'facade Auth deixou de exportar os tipos cross-feature aprovados');
  requireCondition(facade.includes("export { UserMenu } from './ui/user-menu/user-menu';"), 'facade Auth deixou de exportar UserMenu');
  requireCondition(!facade.includes('AuthPage') && !facade.includes('./server') && !facade.includes('./auth-page'), 'facade raiz Auth deixou de ser client/domain-safe e voltou a expor codigo server-only');
  const serverFacade = read('src/features/auth/server/index.ts');
  requireCondition(serverFacade.includes("export { AuthPage } from '../auth-page';"), 'facade server Auth deixou de exportar AuthPage');
  requireCondition(read('src/app/login/page.tsx').includes("from '@/features/auth/server'"), '/login deixou de consumir AuthPage pela facade server explicita');

  const canvasUiRoot = path.join(root, 'src/features/theory-of-change/canvas/ui');
  const files = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const absolute = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(absolute);
      else if (/\.(ts|tsx)$/.test(entry.name)) files.push(absolute);
    }
  };
  walk(canvasUiRoot);

  for (const absolute of files) {
    const source = fs.readFileSync(absolute, 'utf8');
    const rel = path.relative(root, absolute);
    requireCondition(!source.includes("@/features/auth/domain/"), `${rel} cruza a fronteira Auth por domain interno`);
    requireCondition(!source.includes("@/features/auth/ui/"), `${rel} cruza a fronteira Auth por UI interna`);
    requireCondition(!source.includes("@/features/auth/application/"), `${rel} cruza a fronteira Auth por application interno`);
    requireCondition(!source.includes("@/features/auth/infrastructure/"), `${rel} cruza a fronteira Auth por infrastructure interna`);
    requireCondition(!source.includes("@/features/auth/server/"), `${rel} cruza a fronteira Auth server a partir de Canvas UI`);
  }

  const serverAction = read('src/features/theory-of-change/canvas/server/save-canvas-project.action.ts');
  requireCondition(serverAction.includes("@/features/auth/server"), 'entrypoint server explicito de Auth deixou de usar a facade server canonica');
  requireCondition(!serverAction.includes("@/features/auth/server/auth-session"), 'Canvas server action voltou a depender de implementacao interna de Auth');

  requireCondition(auth004?.status === 'RESOLVED-WAVE-05', 'AUTH-004 nao esta resolvido explicitamente pela Wave 05');
  const ledger = json('.sharkops/state/bite-ledger.json');
  const so16 = (ledger.bites ?? []).find((item) => item.id === 'SO-016');
  requireCondition((so16?.revision ?? 0) === 5 ? audit.nextBite?.id === 'SO-016-CLOSEOUT-AUDIT' : ((so16?.revision ?? 0) >= 6 && audit.closeout?.status === 'COMPLETE'), 'Wave 05 deve apontar o closeout na revisao 5 ou reconhecer o closeout COMPLETE na progressao terminal');
}

if (errors.length) {
  console.error('\nSO-016 WAVE 05 AUTH FACADE CONSUMPTION BOUNDARY: FAIL\n');
  errors.forEach((error, index) => console.error(`${index + 1}. ${error}.`));
  process.exit(1);
}

console.log('PASS SO-016 Wave 05: Canvas UI consumes the client/domain-safe Auth facade while AuthPage/session APIs remain on the explicit server facade.');
