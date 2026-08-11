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
  'src/features/auth/server/auth-session.ts',
  'src/features/auth/server/auth-session.test.ts',
  'src/features/auth/server/login.action.ts',
  'src/features/auth/auth-page.tsx',
  'scripts/tdm-contract-v3/check-auth-protected-surfaces-wave03.mjs',
  'docs/sharkops/SO-016-AUTH-PROTECTED-SURFACE-AUDIT.json'
];
required.forEach((rel) => requireCondition(exists(rel), `artefato obrigatorio ausente: ${rel}`));

if (!errors.length) {
  const session = read('src/features/auth/server/auth-session.ts');
  const tests = read('src/features/auth/server/auth-session.test.ts');
  const loginAction = read('src/features/auth/server/login.action.ts');
  const authPage = read('src/features/auth/auth-page.tsx');
  const audit = json('docs/sharkops/SO-016-AUTH-PROTECTED-SURFACE-AUDIT.json');
  const ledger = json('.sharkops/state/bite-ledger.json');
  const so16 = (ledger.bites ?? []).find((item) => item.id === 'SO-016');
  const auth003 = (audit.findings ?? []).find((item) => item.id === 'AUTH-003');
  const auth005 = (audit.findings ?? []).find((item) => item.id === 'AUTH-005');

  requireCondition(session.includes("value.startsWith('//')"), 'proteção contra destino protocol-relative foi removida');
  requireCondition(session.includes("pathname === '/login'"), 'politica canonica nao rejeita o self-target /login');
  requireCondition(session.includes('AUTH_DEFAULT_RETURN_TO'), 'fallback canonico de returnTo foi removido');

  for (const target of ["'/canvas'", "'/canvas/resultado'", "'/login'", "'/login?returnTo=%2Flogin'", "'https://example.com'", "'//example.com'"]) {
    requireCondition(tests.includes(target), `cobertura de redirect policy ausente para ${target}`);
  }

  requireCondition(authPage.includes('sanitizeReturnTo(returnTo)'), 'AuthPage deixou de consumir a politica canonica de returnTo');
  requireCondition(loginAction.includes("redirect(sanitizeReturnTo(String(formData.get('returnTo') ?? '')))"), 'loginAction deixou de sanitizar returnTo antes do redirect');
  requireCondition(session.includes('encodeURIComponent(sanitizeReturnTo(returnTo))'), 'requireAuthenticatedSession deixou de sanitizar returnTo antes de construir /login');

  requireCondition(auth003?.status === 'RESOLVED-WAVE-04', 'AUTH-003 nao esta resolvido explicitamente pela Wave 04');
  requireCondition(auth005?.status === 'RESOLVED-WAVE-03', 'AUTH-005 nao reconhece a cobertura ja selada pela Wave 03');
  requireCondition((so16?.revision ?? 0) === 4 ? audit.nextBite?.targetFinding === 'AUTH-004' : ((so16?.revision ?? 0) === 5 ? audit.nextBite?.id === 'SO-016-CLOSEOUT-AUDIT' : ((so16?.revision ?? 0) >= 6 && audit.closeout?.status === 'COMPLETE')), 'Wave 04 perdeu a progressao canonica AUTH-004 -> closeout audit -> COMPLETE');
}

if (errors.length) {
  console.error('\nSO-016 WAVE 04 REDIRECT POLICY CONTRACT: FAIL\n');
  errors.forEach((error, index) => console.error(`${index + 1}. ${error}.`));
  process.exit(1);
}

console.log('PASS SO-016 Wave 04: returnTo policy preserves legitimate local destinations, rejects external/protocol-relative targets and prevents /login self-redirects through one canonical sanitizer.');
