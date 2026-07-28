#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const modeArgument = process.argv.find((argument) => argument.startsWith('--mode='));
const mode = modeArgument?.split('=')[1] ?? 'full';
const errors = [];
const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const sha256 = (relativePath) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, relativePath))).digest('hex');
const requireCondition = (condition, message) => { if (!condition) errors.push(message); };

function runContract(script, failureMessage) {
  try { execFileSync(process.execPath, [script], { cwd: root, stdio: 'pipe' }); }
  catch { requireCondition(false, failureMessage); }
}

const contractPath = '.tdm/contract-v3.json';
requireCondition(exists(contractPath), 'contrato V3 ausente');
const contract = exists(contractPath) ? JSON.parse(read(contractPath)) : {};
requireCondition(contract.gateState === 'closed', 'gate final não está fechado');
requireCondition(contract.activePhase === 'auth-msw-release', 'fase auth-msw-release não está ativa');
requireCondition(contract.version === '3.5.0', 'versão do contrato não corresponde à release Auth + MSW');
requireCondition(contract.mergeAllowed === true, 'merge não está liberado pelo contrato');
requireCondition(contract.mockPersistenceScope === 'single-next-server-process', 'escopo real da persistência mock não está declarado');
requireCondition(!exists('.tdm/migration-window.json'), 'janela de migração continua aberta');

for (const migration of [
  '.tdm/migrations/2026-07-27-canvas-wave-03-lockdown.json',
  '.tdm/migrations/2026-07-27-canvas-wave-04-hardening.json',
  '.tdm/migrations/2026-07-28-canvas-wave-05-react-flow.json',
  '.tdm/migrations/2026-07-28-auth-msw-user-canvas.json'
]) requireCondition(exists(migration), `registro de migração ausente: ${migration}`);

const forbiddenPaths = [
  'src/app/canvas-v4',
  'src/app/canvas/resend-command-preview-v2',
  'src/features/theory-of-change/canvas-workspace',
  'src/features/theory-of-change/components/canvas-resultado',
  'src/features/theory-of-change/canvas/infrastructure/msw/ensure-canvas-project-worker.ts',
  'src/features/theory-of-change/canvas/infrastructure/msw/canvas-project.worker.ts',
  'scripts/tdm-contract-v3/check-migration-window.mjs'
];
for (const relativePath of forbiddenPaths) requireCondition(!exists(relativePath), `código anterior ainda existe: ${relativePath}`);

const requiredFiles = [
  'src/app/login/page.tsx',
  'src/app/canvas/page.tsx',
  'src/app/canvas/resultado/page.tsx',
  'src/instrumentation.ts',
  'src/mocks/server.ts',
  'src/mocks/browser.ts',
  'src/features/auth/index.ts',
  'src/features/theory-of-change/canvas/index.ts',
  'src/features/theory-of-change/canvas/ui/canvas-workspace/canvas-workspace.tsx',
  'src/features/theory-of-change/canvas/ui/components/canvas-flow-surface.tsx',
  'src/features/theory-of-change/canvas/server/save-canvas-project.action.ts',
  'src/features/theory-of-change/canvas/ui/canvas-result/canvas-result-view.tsx',
  'src/shared/ui/tdm-status-screen/tdm-route-not-found.tsx',
  'scripts/tdm-contract-v3/check-auth-msw.mjs',
  'scripts/tdm-contract-v3/check-i18n-routes.mjs'
];
requiredFiles.forEach((file) => requireCondition(exists(file), `arquivo obrigatório ausente: ${file}`));

const protectedSassHash = '92ca880af2f6cb4dec78b87f61e028234d370a8a937423c834d97f207e299a46';
requireCondition(
  exists('src/features/theory-of-change/canvas/ui/canvas-workspace/canvas-workspace.module.sass') &&
  sha256('src/features/theory-of-change/canvas/ui/canvas-workspace/canvas-workspace.module.sass') === protectedSassHash,
  'skin visual homologada do Canvas foi alterada fora da mordida aprovada'
);

const packageJson = JSON.parse(read('package.json'));
for (const scriptName of [
  'typecheck', 'lint:canvas', 'lint:auth', 'test:unit', 'test:e2e',
  'check:tdm:react-flow', 'check:tdm:ownership', 'check:tdm:auth-msw',
  'check:tdm:i18n-routes', 'check:tdm:v3:quick', 'check:tdm:v3:full',
  'validate:release'
]) requireCondition(Boolean(packageJson.scripts?.[scriptName]), `script obrigatório ausente: ${scriptName}`);

runContract('scripts/tdm-contract-v3/check-react-flow.mjs', 'contrato React Flow real falhou');
runContract('scripts/tdm-contract-v3/check-ownership.mjs', 'contrato de ownership e colocation falhou');
runContract('scripts/tdm-contract-v3/check-auth-msw.mjs', 'contrato Auth + MSW falhou');
runContract('scripts/tdm-contract-v3/check-i18n-routes.mjs', 'contrato next-intl e estados de rota falhou');

if (mode !== 'quick') {
  const trackedOutput = execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }).trim();
  const tracked = trackedOutput ? trackedOutput.split('\n') : [];
  const forbiddenTracked = tracked.filter((file) =>
    file === '.DS_Store' || file.startsWith('.next/') || file.startsWith('node_modules/') ||
    file.startsWith('playwright-report/') || file.startsWith('test-results/') ||
    file.endsWith('.tsbuildinfo') || file.endsWith('.zip')
  );
  requireCondition(forbiddenTracked.length === 0, `artefatos proibidos versionados: ${forbiddenTracked.join(', ')}`);

  const sourceRoots = ['src/app/canvas', 'src/app/login', 'src/features/auth', 'src/features/theory-of-change/canvas'];
  const stack = sourceRoots.filter(exists);
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(path.join(root, current), { withFileTypes: true })) {
      const relative = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(relative);
      if (!entry.isFile() || !/\.(ts|tsx|sass)$/.test(entry.name)) continue;
      const source = read(relative);
      for (const forbidden of ['localStorage', 'sessionStorage', 'window.location', '!important']) {
        requireCondition(!source.includes(forbidden), `referência proibida em ${relative}: ${forbidden}`);
      }
    }
  }
}

if (errors.length) {
  console.error(`\nTDM CONTRACT V3 (${mode.toUpperCase()}): FAIL\n`);
  errors.forEach((error, index) => console.error(`${index + 1}. ${error}.`));
  process.exit(1);
}

console.log(`PASS: TDM Contract V3 ${mode} Auth, MSW server-authoritative, React Flow e i18n íntegros.`);
