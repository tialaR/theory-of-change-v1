#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];
const exists = (rel) => fs.existsSync(path.join(root, rel));
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const json = (rel) => JSON.parse(read(rel));
const requireCondition = (condition, message) => { if (!condition) errors.push(message); };

const required = [
  'docs/sharkops/SO-016-AUTH-PROTECTED-SURFACE-AUDIT.json',
  'docs/sharkops/SO-016-WAVE-01-AUTH-PROTECTED-SURFACE-AUDIT.md',
  '.sharkops/bites/so-016-authentication-protected-surface-armor-wave-01/MANIFEST.json',
  'src/app/login/page.tsx',
  'src/app/canvas/page.tsx',
  'src/app/canvas/resultado/page.tsx',
  'src/features/auth/auth-page.tsx',
  'src/features/auth/server/auth-session.ts',
  'src/features/auth/server/auth-server.repository.ts',
  'src/features/auth/infrastructure/http/http-auth.repository.ts',
  'src/features/theory-of-change/canvas/canvas-page.tsx',
  'src/features/theory-of-change/canvas/canvas-result-page.tsx',
  'src/features/theory-of-change/canvas/server/get-current-canvas-project.ts'
];
for (const rel of required) requireCondition(exists(rel), `artefato obrigatorio ausente: ${rel}`);

if (!errors.length) {
  const ledger = json('.sharkops/state/bite-ledger.json');
  const state = json('.sharkops/state/current-state.json');
  const audit = json('docs/sharkops/SO-016-AUTH-PROTECTED-SURFACE-AUDIT.json');
  const pkg = json('package.json');
  const predecessors = ledger.bites.filter((bite) => /^SO-0(0[1-9]|1[0-5])$/.test(bite.id));
  const so16 = ledger.bites.find((bite) => bite.id === 'SO-016');

  requireCondition(predecessors.length === 15 && predecessors.every((bite) => bite.status === 'COMPLETE'), 'SO-001 a SO-015 devem permanecer COMPLETE');
  requireCondition(['ACTIVE', 'COMPLETE'].includes(so16?.status) && (so16?.revision ?? 0) >= 1, 'SO-016 deve permanecer ACTIVE durante as waves ou COMPLETE no closeout');
  requireCondition((so16?.status === 'ACTIVE' && state.activeBite === 'SO-016 | Authentication & Protected Surface Armor' && state.activeBiteStatus === 'ACTIVE') || (so16?.status === 'COMPLETE' && state.lastBite === 'SO-016 | Authentication & Protected Surface Armor COMPLETE'), 'current-state perdeu o ownership canonico da SO-016');
  requireCondition(['SO-016 | Authentication & Protected Surface Audit', 'SO-016 | Server Auth Repository Boundary', 'SO-016 | Protected Route Ownership Contract', 'SO-016 | Redirect Policy Contract', 'SO-016 | Auth Facade Consumption Boundary', 'SO-016 | Authentication & Protected Surface Armor COMPLETE'].includes(state.lastBite), 'current-state perdeu a progressao canonica da SO-016');
  requireCondition(state.goldenStateStatus === 'COMPLETE' && state.goldenStateId === 'GOLDEN-STATE-v1', 'Canvas Golden State deve permanecer preservado');
  requireCondition(pkg.scripts?.['check:tdm:auth-protected-surfaces:wave01'] === 'node scripts/tdm-contract-v3/check-auth-protected-surfaces-wave01.mjs', 'npm script da SO-016 Wave 01 ausente ou invalido');

  requireCondition(((so16?.revision ?? 0) < 6 && audit.mode === 'audit-only') || ((so16?.revision ?? 0) >= 6 && audit.mode === 'closeout-audit'), 'audit metadata deve preservar audit-only durante as waves e closeout-audit no terminal');
  requireCondition(audit.runtimeChanges === false, 'auditoria SO-016 nao pode declarar runtime changes');
  requireCondition(audit.baseline?.baseCommit === 'a94f940', 'baseline commit da SO-016 nao corresponde ao handoff');
  requireCondition(audit.baseline?.canvasGoldenState === 'GOLDEN-STATE-v1', 'audit nao preserva a baseline Golden State');
  const findingIds = new Set((audit.findings ?? []).map((finding) => finding.id));
  for (const id of ['AUTH-001', 'AUTH-002', 'AUTH-003', 'AUTH-004', 'AUTH-005']) requireCondition(findingIds.has(id), `finding obrigatorio ausente: ${id}`);
  const auth001 = (audit.findings ?? []).find((finding) => finding.id === 'AUTH-001');
  requireCondition(auth001, 'finding AUTH-001 ausente do historico de auditoria');
  if ((so16?.revision ?? 0) === 1) {
    requireCondition(auth001?.status === 'PROVEN', 'AUTH-001 deve permanecer PROVEN durante a Wave 01');
    requireCondition(audit.nextBite?.targetFinding === 'AUTH-001', 'menor proxima mordida da Wave 01 deve atacar AUTH-001');
  } else {
    requireCondition(auth001?.status === 'RESOLVED-WAVE-02', 'AUTH-001 so pode evoluir para a resolucao canonica da Wave 02');
  }

  const loginRoute = read('src/app/login/page.tsx');
  requireCondition(loginRoute.includes("import { AuthPage } from '@/features/auth';") && loginRoute.includes('<AuthPage returnTo={returnTo} />'), '/login deve permanecer delegado ao facade Auth');

  const canvasRoute = read('src/app/canvas/page.tsx');
  const resultRoute = read('src/app/canvas/resultado/page.tsx');
  const canvasPage = read('src/features/theory-of-change/canvas/canvas-page.tsx');
  const resultPage = read('src/features/theory-of-change/canvas/canvas-result-page.tsx');
  const currentProject = read('src/features/theory-of-change/canvas/server/get-current-canvas-project.ts');
  if ((so16?.revision ?? 0) < 3) {
    requireCondition(canvasPage.includes("getCurrentCanvasProject('/canvas')"), '/canvas perdeu a resolucao autenticada anterior antes da Wave 03');
    requireCondition(resultPage.includes("getCurrentCanvasProject('/canvas/resultado')"), '/canvas/resultado perdeu a resolucao autenticada anterior antes da Wave 03');
    requireCondition(currentProject.includes('requireAuthenticatedSession(returnTo)'), 'getCurrentCanvasProject perdeu a protecao anterior antes da Wave 03');
  } else {
    requireCondition(canvasRoute.includes("requireAuthenticatedSession('/canvas')"), '/canvas deve possuir protecao no route entry apos a Wave 03');
    requireCondition(resultRoute.includes("requireAuthenticatedSession('/canvas/resultado')"), '/canvas/resultado deve possuir protecao no route entry apos a Wave 03');
    requireCondition(!currentProject.includes('requireAuthenticatedSession'), 'feature project loader nao deve possuir ownership de route protection apos a Wave 03');
  }

  const authSession = read('src/features/auth/server/auth-session.ts');
  requireCondition(authSession.includes('httpOnly: true') && authSession.includes("sameSite: 'lax'"), 'cookie de sessao perdeu invariantes de seguranca existentes');
  requireCondition(authSession.includes('sanitizeReturnTo') && authSession.includes('redirect(`/login?returnTo='), 'contrato server-side de redirect para login mudou silenciosamente');

  // Audit freeze with explicit progression: revision 1 preserves the proven contradiction; revision 2+ requires its canonical remediation.
  const serverRepository = read('src/features/auth/server/auth-server.repository.ts');
  if ((so16?.revision ?? 0) === 1) {
    requireCondition(serverRepository.includes("from '../infrastructure/msw/auth.mock-store'"), 'AUTH-001 mudou antes da wave de remediacao; evolua explicitamente o gate na Wave 02');
  } else {
    requireCondition(serverRepository.includes("from '../infrastructure/http/http-auth.repository'"), 'AUTH-001 nao foi remediado pela infraestrutura HTTP oficial');
    requireCondition(!serverRepository.includes('auth.mock-store') && !serverRepository.includes('authMockStore'), 'AUTH-001 regrediu para acesso direto ao mock store');
  }
  const httpRepository = read('src/features/auth/infrastructure/http/http-auth.repository.ts');
  requireCondition(httpRepository.includes('export function createHttpAuthRepository'), 'adapter HTTP Auth comprovado pela auditoria desapareceu');
}

if (errors.length) {
  console.error('\nSO-016 AUTH PROTECTED SURFACES WAVE 01: FAIL\n');
  errors.forEach((error, index) => console.error(`${index + 1}. ${error}.`));
  process.exit(1);
}

console.log('PASS SO-016 Wave 01: auth/protected surfaces are inventoried, both Canvas routes remain session-protected, the Golden State is sealed, and AUTH-001 is frozen as the smallest proven next bite with zero runtime refactor.');
