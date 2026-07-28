#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';

const root = process.cwd();
const modeArgument = process.argv.find((argument) => argument.startsWith('--mode='));
const mode = modeArgument?.split('=')[1] ?? 'full';
const errors = [];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}
function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}
function sha256(relativePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(path.join(root, relativePath))).digest('hex');
}
function requireCondition(condition, message) {
  if (!condition) errors.push(message);
}
function runContract(script, failureMessage) {
  try {
    execFileSync(process.execPath, [script], { cwd: root, stdio: 'pipe' });
  } catch {
    requireCondition(false, failureMessage);
  }
}

const contractPath = '.tdm/contract-v3.json';
requireCondition(exists(contractPath), 'contrato V3 ausente');
const contract = exists(contractPath) ? JSON.parse(read(contractPath)) : {};
requireCondition(contract.gateState === 'closed', 'gate final não está fechado');
requireCondition(contract.activePhase === 'react-flow-release', 'fase react-flow-release não está ativa');
requireCondition(contract.version === '3.4.0', 'versão do contrato não corresponde à mordida React Flow');
requireCondition(contract.mergeAllowed === true, 'merge não está liberado pelo contrato');
requireCondition(!exists('.tdm/migration-window.json'), 'janela de migração continua aberta');
requireCondition(exists('.tdm/migrations/2026-07-27-canvas-wave-03-lockdown.json'), 'registro do lockdown ausente');
requireCondition(exists('.tdm/migrations/2026-07-27-canvas-wave-04-hardening.json'), 'registro do hardening ausente');
requireCondition(exists('.tdm/migrations/2026-07-28-canvas-wave-05-react-flow.json'), 'registro da migração React Flow real ausente');

const forbiddenPaths = [
  'src/app/canvas-v4',
  'src/app/canvas/resend-command-preview-v2',
  'src/app/canvas/canvas-workspace.tsx',
  'src/app/canvas/canvas-workspace.module.sass',
  'src/app/canvas/canvas-workspace.model.ts',
  'src/app/canvas/canvas-workspace.icons.tsx',
  'src/app/canvas/use-canvas-flow-state.ts',
  'src/app/canvas/use-canvas-project-persistence.ts',
  'src/app/canvas/canvas-project.mapper.ts',
  'src/app/canvas/canvas.contract.e2e.ts',
  'src/features/theory-of-change/canvas-workspace',
  'scripts/tdm-contract-v3/check-migration-window.mjs'
];
for (const relativePath of forbiddenPaths) {
  requireCondition(!exists(relativePath), `código anterior ainda existe: ${relativePath}`);
}

const requiredFiles = [
  'src/app/canvas/page.tsx',
  'src/app/canvas/layout.tsx',
  'src/app/canvas/loading.tsx',
  'src/features/theory-of-change/canvas/index.ts',
  'src/features/theory-of-change/canvas/canvas-page.tsx',
  'src/features/theory-of-change/canvas/ui/canvas-workspace/canvas-client-entry.tsx',
  'src/features/theory-of-change/canvas/ui/canvas-workspace/canvas-workspace.tsx',
  'src/features/theory-of-change/canvas/ui/canvas-workspace/canvas-workspace.module.sass',
  'src/features/theory-of-change/canvas/ui/components/canvas-flow-surface.tsx',
  'src/features/theory-of-change/canvas/ui/components/canvas-stage-node.tsx',
  'src/features/theory-of-change/canvas/ui/components/canvas-causal-edge.tsx',
  'src/features/theory-of-change/canvas/ui/hooks/use-canvas-flow-controller.ts',
  'src/features/theory-of-change/canvas/domain/canvas-connection-policy.ts',
  'src/features/theory-of-change/canvas/infrastructure/msw/ensure-canvas-project-worker.ts',
  'src/features/theory-of-change/components/canvas-resultado/use-canvas-result-project.ts'
];
requiredFiles.forEach((file) => requireCondition(exists(file), `arquivo obrigatório ausente: ${file}`));

const protectedSassHash = '92ca880af2f6cb4dec78b87f61e028234d370a8a937423c834d97f207e299a46';
requireCondition(
  exists('src/features/theory-of-change/canvas/ui/canvas-workspace/canvas-workspace.module.sass') &&
    sha256('src/features/theory-of-change/canvas/ui/canvas-workspace/canvas-workspace.module.sass') === protectedSassHash,
  'skin visual homologada do Canvas foi alterada fora da mordida aprovada'
);

if (exists('src/features/theory-of-change/canvas/infrastructure/msw/ensure-canvas-project-worker.ts')) {
  const workerBoundary = read('src/features/theory-of-change/canvas/infrastructure/msw/ensure-canvas-project-worker.ts');
  requireCondition(workerBoundary.includes("import('./canvas-project.worker')"), 'worker MSW não é carregado dinamicamente no browser');
  requireCondition(!workerBoundary.includes("import { canvasProjectWorker }"), 'worker MSW possui importação estática incompatível com SSR');
}

const packageJson = JSON.parse(read('package.json'));
for (const scriptName of [
  'typecheck',
  'lint:canvas',
  'test:unit',
  'test:e2e',
  'check:tdm:react-flow',
  'check:tdm:ownership',
  'check:tdm:v3:quick',
  'check:tdm:v3:full',
  'validate:canvas:release'
]) {
  requireCondition(Boolean(packageJson.scripts?.[scriptName]), `script obrigatório ausente: ${scriptName}`);
}
requireCondition(!packageJson.scripts?.['validate:migration'], 'script temporário validate:migration ainda existe');

runContract('scripts/tdm-contract-v3/check-react-flow.mjs', 'contrato React Flow real falhou');
runContract('scripts/tdm-contract-v3/check-ownership.mjs', 'contrato de ownership e colocation falhou');

if (mode !== 'quick') {
  const tracked = execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const forbiddenTracked = tracked.filter((file) =>
    file === '.DS_Store' ||
    file.startsWith('.next/') ||
    file.startsWith('node_modules/') ||
    file.startsWith('playwright-report/') ||
    file.startsWith('test-results/') ||
    file.endsWith('.tsbuildinfo') ||
    file.endsWith('.zip')
  );
  requireCondition(forbiddenTracked.length === 0, `artefatos proibidos versionados: ${forbiddenTracked.join(', ')}`);

  const officialSourceRoots = [
    'src/app/canvas',
    'src/features/theory-of-change/canvas',
    'src/features/theory-of-change/components/canvas-resultado'
  ];
  const stack = officialSourceRoots.filter(exists);
  while (stack.length) {
    const current = stack.pop();
    const absolute = path.join(root, current);
    for (const entry of fs.readdirSync(absolute, { withFileTypes: true })) {
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

console.log(`PASS: TDM Contract V3 ${mode} React Flow real, app fino e anti-God íntegros.`);
