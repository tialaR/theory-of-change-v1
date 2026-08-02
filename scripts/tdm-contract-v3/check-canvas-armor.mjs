#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const requiredFiles = [
  'src/app/canvas/page.tsx',
  'src/app/canvas/loading.tsx',
  'src/app/canvas/error.tsx',
  'src/app/canvas/resultado/page.tsx',
  'src/features/theory-of-change/canvas/ui/canvas-workspace/canvas-workspace.e2e.ts',
  'src/features/theory-of-change/canvas/ui/components/canvas-stage-node.tsx',
  'src/features/theory-of-change/canvas/domain/canvas-element-id.test.ts',
  'src/features/theory-of-change/canvas/application/canvas-layout.test.ts',
  'src/features/theory-of-change/canvas/ui/hooks/canvas-connect-notices.ts',
  'scripts/tdm-contract-v3/check-canvas-continuity.mjs',
  'scripts/tdm-contract-v3/check-canvas-stability-wave03.mjs'
];

const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const assert = (condition, message) => { if (!condition) failures.push(message); };

for (const file of requiredFiles) {
  assert(fs.existsSync(path.join(root, file)), `arquivo de armadura ausente: ${file}`);
}

if (fs.existsSync(path.join(root, 'src/app/canvas/error.tsx'))) {
  const source = read('src/app/canvas/error.tsx');
  assert(source.includes("'use client'"), 'boundary de erro do Canvas deve ser client component');
  assert(source.includes('TdmRouteError'), 'boundary de erro do Canvas deve usar o estado oficial');
}

if (fs.existsSync(path.join(root, 'src/features/theory-of-change/canvas/domain/canvas-element-id.test.ts'))) {
  const source = read('src/features/theory-of-change/canvas/domain/canvas-element-id.test.ts');
  assert(source.includes('ignora colisões vindas de um projeto hidratado'), 'teste de colisão hidratada foi removido');
  assert(source.includes('esgota tentativas'), 'teste de falha segura da fábrica de IDs foi removido');
}

if (fs.existsSync(path.join(root, 'src/features/theory-of-change/canvas/ui/components/canvas-stage-node.tsx'))) {
  const source = read('src/features/theory-of-change/canvas/ui/components/canvas-stage-node.tsx');
  assert(source.includes('data-canvas-handle="source"'), 'handle de origem perdeu o contrato público de teste');
  assert(source.includes('data-canvas-handle="target"'), 'handle de destino perdeu o contrato público de teste');
  assert(source.includes('data-canvas-node-id={id}'), 'handles perderam vínculo estável com o node id');
}

if (fs.existsSync(path.join(root, 'src/features/theory-of-change/canvas/ui/canvas-workspace/canvas-workspace.e2e.ts'))) {
  const source = read('src/features/theory-of-change/canvas/ui/canvas-workspace/canvas-workspace.e2e.ts');
  for (const proof of [
    'data-canvas-handle',
    'data-canvas-node-id',
    'data-stage',
    'hydratedInputId',
    'hydratedActivityId',
    'inputIdsAfterReload',
    "page.goto('/canvas')",
    "toHaveAttribute('data-save-state', 'dirty')",
    "toHaveAttribute('data-save-state', 'saved'",
    'page.reload()',
    "page.getByRole('button', { name: 'Visualizar resultado' })",
    "toHaveURL(/\\/canvas\\/resultado$/)",
    'persistedInputTitle',
    "page.getByRole('link', { name: 'Voltar ao Canvas' })"
  ]) assert(source.includes(proof), `E2E do Canvas não contém prova obrigatória: ${proof}`);

  assert(!source.includes('Alterações salvas automaticamente.'), 'E2E não pode esperar toast inexistente de autosave');
  assert(!source.includes("getByRole('heading', { name: 'Insumos', exact: true })"), 'E2E não pode depender de heading fixo inexistente no resultado');
  assert(!source.includes("'Insumo 1'"), 'E2E do Canvas voltou a depender de título sequencial de insumo');
  assert(!source.includes("'Atividade 1'"), 'E2E do Canvas voltou a depender de título sequencial de atividade');
  assert(!source.includes('.dragTo('), 'E2E do Canvas voltou a usar dragTo instável');
  assert(source.includes('new DataTransfer()'), 'E2E do Canvas deve criar DataTransfer real');
  assert(source.includes("new DragEvent('dragstart'"), 'E2E do Canvas deve disparar dragstart real');
  assert(source.includes("new DragEvent('dragover'"), 'E2E do Canvas deve disparar dragover real');
  assert(source.includes("new DragEvent('drop'"), 'E2E do Canvas deve disparar drop real');
}

if (fs.existsSync(path.join(root, 'src/features/theory-of-change/canvas/application/canvas-layout.test.ts'))) {
  const source = read('src/features/theory-of-change/canvas/application/canvas-layout.test.ts');
  assert(source.includes('CANVAS_DIMENSIONS.columnStartY'), 'teste de layout deve consumir o token oficial de início da coluna');
  assert(source.includes('CANVAS_COLUMN_X.input'), 'teste de layout deve consumir o token oficial da coluna');
}

if (fs.existsSync(path.join(root, 'src/features/theory-of-change/canvas/ui/hooks/use-canvas-workspace-controller.ts'))) {
  const lineCount = read('src/features/theory-of-change/canvas/ui/hooks/use-canvas-workspace-controller.ts').split(/\r?\n/).length;
  assert(lineCount <= 360, `controller do Canvas excede budget anti-God (${lineCount}/360)`);
}

const pkg = JSON.parse(read('package.json'));
assert(pkg.scripts?.['check:tdm:canvas-armor'], 'script check:tdm:canvas-armor não registrado');
const canvasE2eCommand = pkg.scripts?.['test:e2e:canvas'];
const directCanvasE2e = 'playwright test src/features/theory-of-change/canvas/ui/canvas-workspace/canvas-workspace.e2e.ts';
const runnerCanvasE2e = 'node scripts/playwright/run-canvas-e2e.mjs';
assert(
  canvasE2eCommand === directCanvasE2e || canvasE2eCommand === runnerCanvasE2e,
  'script test:e2e:canvas deve apontar para o arquivo explícito ou para o preflight oficial'
);
if (canvasE2eCommand === runnerCanvasE2e) {
  assert(fs.existsSync(path.join(root, 'scripts/playwright/run-canvas-e2e.mjs')), 'preflight E2E oficial não encontrado');
  assert(
    read('scripts/playwright/run-canvas-e2e.mjs').includes('src/features/theory-of-change/canvas/ui/canvas-workspace/canvas-workspace.e2e.ts'),
    'preflight E2E deve apontar para o arquivo explícito do Canvas'
  );
}

const gates = JSON.parse(read('.sharkops/policy/gates.json'));
const preCommit = gates.profiles?.[gates.activeProfile]?.mandatory?.['pre-commit'] ?? [];
const prePush = gates.profiles?.[gates.activeProfile]?.mandatory?.['pre-push'] ?? [];
assert(preCommit.includes('check:tdm:canvas-armor'), 'Canvas Armor não bloqueia pre-commit');
assert(prePush.includes('test:e2e:canvas'), 'E2E do Canvas não bloqueia pre-push');

if (failures.length) {
  console.error('\nTDM CANVAS ARMOR: FAIL\n');
  failures.forEach((failure, index) => console.error(`${index + 1}. ${failure}.`));
  process.exit(1);
}

console.log('PASS: rotas, erro, IDs hidratados, autosave, recarga e resultado estão sob armadura executável.');
