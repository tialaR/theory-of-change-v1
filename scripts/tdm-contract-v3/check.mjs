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

const contractPath = '.tdm/contract-v3.json';
requireCondition(exists(contractPath), 'contrato V3 ausente');
const contract = exists(contractPath) ? JSON.parse(read(contractPath)) : {};

requireCondition(contract.gateState === 'closed', 'gate final não está fechado');
requireCondition(contract.activePhase === 'validation-release', 'fase final validation-release não está ativa');
requireCondition(!exists('.tdm/migration-window.json'), 'janela de migração continua aberta');
requireCondition(exists('.tdm/migrations/2026-07-27-canvas-wave-03-lockdown.json'), 'registro do lockdown ausente');
requireCondition(!exists('src/app/canvas-v4'), 'rota física /canvas-v4 ainda existe');

const requiredFiles = [
  'src/app/canvas/page.tsx',
  'src/app/canvas/resend-command-preview-v2.tsx',
  'src/app/canvas/resend-command-preview-v2.module.sass',
  'src/app/canvas/use-canvas-flow-state.ts',
  'src/app/canvas/use-canvas-project-persistence.ts',
  'src/features/theory-of-change/canvas-workspace/domain/canvas-project.ts',
  'src/features/theory-of-change/canvas-workspace/infrastructure/msw/ensure-canvas-project-worker.ts',
  'src/features/theory-of-change/components/canvas-resultado/use-canvas-result-project.ts'
];
requiredFiles.forEach((file) => requireCondition(exists(file), `arquivo obrigatório ausente: ${file}`));

if (exists('src/app/canvas/page.tsx')) {
  const canvasPage = read('src/app/canvas/page.tsx');
  requireCondition(canvasPage.includes("from './resend-command-preview-v2'"), '/canvas não possui diretamente a interface homologada');
  requireCondition(!canvasPage.includes('redirect('), '/canvas ainda usa redirecionamento');
}

const protectedSassHash = '885b6b9272cadbd6fc109e3b24eec045f3c0e3adbc013f32767a92a713b3aacc';
requireCondition(
  exists('src/app/canvas/resend-command-preview-v2.module.sass') &&
    sha256('src/app/canvas/resend-command-preview-v2.module.sass') === protectedSassHash,
  'Sass homologado do Canvas foi alterado'
);

if (exists('src/features/theory-of-change/canvas-workspace/infrastructure/msw/ensure-canvas-project-worker.ts')) {
  const workerBoundary = read('src/features/theory-of-change/canvas-workspace/infrastructure/msw/ensure-canvas-project-worker.ts');
  requireCondition(workerBoundary.includes("import('./canvas-project.worker')"), 'worker MSW não é carregado dinamicamente no browser');
  requireCondition(!workerBoundary.includes("import { canvasProjectWorker }"), 'worker MSW possui importação estática incompatível com SSR');
}

const targetFiles = [
  'src/app/canvas/resend-command-preview-v2.tsx',
  'src/app/canvas/use-canvas-project-persistence.ts',
  'src/features/theory-of-change/components/canvas-resultado/use-canvas-result-project.ts'
].filter(exists);
const targetSource = targetFiles.map(read).join('\n');
for (const forbidden of ['localStorage', 'sessionStorage', 'window.location']) {
  requireCondition(!targetSource.includes(forbidden), `persistência ou navegação proibida detectada: ${forbidden}`);
}

const packageJson = JSON.parse(read('package.json'));
for (const scriptName of ['typecheck', 'test:unit', 'test:e2e', 'check:tdm:v3:quick', 'check:tdm:v3:full', 'validate:canvas:release']) {
  requireCondition(Boolean(packageJson.scripts?.[scriptName]), `script obrigatório ausente: ${scriptName}`);
}

if (mode !== 'quick') {
  const tracked = execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const forbiddenTracked = tracked.filter((file) =>
    exists(file) && (
    file === '.DS_Store' ||
    file.startsWith('.next/') ||
    file.startsWith('node_modules/') ||
    file.startsWith('playwright-report/') ||
    file.startsWith('test-results/') ||
    file.endsWith('.tsbuildinfo') ||
    file.endsWith('.zip')
    )
  );
  requireCondition(forbiddenTracked.length === 0, `artefatos proibidos versionados: ${forbiddenTracked.join(', ')}`);
}

if (errors.length) {
  console.error(`\nTDM CONTRACT V3 (${mode.toUpperCase()}): FAIL\n`);
  errors.forEach((error, index) => console.error(`${index + 1}. ${error}.`));
  process.exit(1);
}

console.log(`PASS: TDM Contract V3 ${mode} fechado e íntegro.`);
