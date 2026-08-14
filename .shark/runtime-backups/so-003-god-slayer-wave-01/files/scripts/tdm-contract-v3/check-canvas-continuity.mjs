#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];
const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const lines = (relativePath) => read(relativePath).split('\n').length;
const requireCondition = (condition, message) => { if (!condition) errors.push(message); };

const files = {
  id: 'src/features/theory-of-change/canvas/domain/canvas-element-id.ts',
  flow: 'src/features/theory-of-change/canvas/ui/hooks/use-canvas-flow-controller.ts',
  autosave: 'src/features/theory-of-change/canvas/ui/hooks/use-canvas-autosave.ts',
  saveController: 'src/features/theory-of-change/canvas/ui/hooks/use-canvas-save-controller.ts',
  persistence: 'src/features/theory-of-change/canvas/ui/hooks/use-canvas-project-persistence.ts',
  queue: 'src/features/theory-of-change/canvas/application/canvas-save-queue.ts',
  constants: 'src/features/theory-of-change/canvas/domain/canvas-ui.constants.ts',
  header: 'src/features/theory-of-change/canvas/ui/components/canvas-header.tsx',
  e2e: 'src/features/theory-of-change/canvas/ui/canvas-workspace/canvas-workspace.e2e.ts'
};

Object.values(files).forEach((file) => requireCondition(exists(file), `arquivo de continuidade ausente: ${file}`));

if (exists(files.id)) {
  const source = read(files.id);
  requireCondition(source.includes('createCanvasNodeId'), 'fábrica collision-safe de node IDs ausente');
  requireCondition(source.includes('createCanvasEdgeId'), 'fábrica collision-safe de edge IDs ausente');
  requireCondition(source.includes('occupiedIds'), 'fábrica de IDs não verifica o grafo hidratado');
}

if (exists(files.flow)) {
  const source = read(files.flow);
  requireCondition(source.includes('crypto.randomUUID()'), 'IDs persistidos não usam token estável e não sequencial');
  requireCondition(source.includes('createCanvasNodeId'), 'criação de node não consome a fábrica única');
  requireCondition(source.includes('createCanvasEdgeId'), 'criação de edge não consome a fábrica única');
  requireCondition(!source.includes('idCounterRef'), 'contador de IDs reiniciado por montagem voltou ao Canvas');
}

if (exists(files.constants)) {
  const source = read(files.constants);
  requireCondition(source.includes('autoSaveDebounceMs: 1200'), 'debounce de autosave não está cravado em 1200 ms');
}

if (exists(files.autosave)) {
  const source = read(files.autosave);
  requireCondition(source.includes('setTimeout'), 'autosave não usa debounce real');
  requireCondition(source.includes('clearTimeout'), 'autosave não cancela gravação obsoleta');
  requireCondition(source.includes('enabledRef.current'), 'autosave não protege desmontagem com alteração pendente');
}

if (exists(files.queue)) {
  const source = read(files.queue);
  requireCondition(source.includes('queue.then'), 'gravações não estão serializadas');
  requireCondition(source.includes('persistedSignature'), 'gravações idênticas não são deduplicadas');
  requireCondition(source.includes('structuredClone'), 'fila não captura snapshot imutável da mudança');
}

if (exists(files.saveController)) {
  const source = read(files.saveController);
  requireCondition(source.includes("saveState === 'dirty'"), 'autosave não depende do estado dirty');
  requireCondition(source.includes('navigateAfterSave'), 'navegação não aguarda persistência pendente');
  requireCondition(source.includes('beforeunload'), 'saída do documento não protege alterações pendentes');
  requireCondition(source.includes('visibilitychange'), 'mudança de visibilidade não tenta salvar alterações');
}

if (exists(files.header)) {
  const source = read(files.header);
  requireCondition(source.includes('runtime.save()'), 'CTA manual de salvar foi removido');
  requireCondition(source.includes('runtime.openHome()'), 'retorno para Home não usa navegação segura');
  requireCondition(!source.includes('href="/"'), 'header voltou a abandonar o Canvas sem flush');
}

if (exists(files.e2e)) {
  const source = read(files.e2e);
  for (const proof of [
    "toHaveAttribute('data-save-state', 'dirty')",
    "toHaveAttribute('data-save-state', 'saved'",
    "toHaveCount(2)",
    "toHaveCount(3)",
    'hydratedInputId',
    'hydratedActivityId',
    'inputIdsAfterCreate',
    'inputIdsAfterReload',
    "Selecionar conexão",
    "page.reload()"
  ]) requireCondition(source.includes(proof), `E2E de continuidade não prova: ${proof}`);
  requireCondition(!source.includes("'Insumo 1'"), 'E2E de continuidade voltou a depender de título sequencial de insumo');
  requireCondition(!source.includes("'Atividade 1'"), 'E2E de continuidade voltou a depender de título sequencial de atividade');
}


for (const [file, budget] of [
  [files.flow, 340],
  ['src/features/theory-of-change/canvas/ui/hooks/use-canvas-workspace-controller.ts', 360],
  [files.saveController, 180],
  [files.autosave, 100],
  [files.persistence, 100]
]) {
  if (exists(file)) requireCondition(lines(file) <= budget, `hook excede budget anti-God (${lines(file)}/${budget}): ${file}`);
}

const canvasRoot = path.join(root, 'src/features/theory-of-change/canvas');
if (fs.existsSync(canvasRoot)) {
  const stack = [canvasRoot];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(absolute);
      if (!entry.isFile() || !/\.(ts|tsx)$/.test(entry.name)) continue;
      const source = fs.readFileSync(absolute, 'utf8');
      for (const forbidden of ['localStorage', 'sessionStorage']) {
        requireCondition(!source.includes(forbidden), `persistência de navegador proibida em ${path.relative(root, absolute)}: ${forbidden}`);
      }
    }
  }
}

if (errors.length) {
  console.error('\nTDM CANVAS CONTINUITY CONTRACT: FAIL\n');
  errors.forEach((error, index) => console.error(`${index + 1}. ${error}.`));
  process.exit(1);
}

console.log('PASS: IDs, autosave serializado, navegação segura e continuidade do Canvas íntegros.');
