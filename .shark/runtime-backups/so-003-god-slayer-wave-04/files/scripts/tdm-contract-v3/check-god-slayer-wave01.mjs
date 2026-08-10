#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];
const controller = 'src/features/theory-of-change/canvas/ui/hooks/use-canvas-workspace-controller.ts';
const viewport = 'src/features/theory-of-change/canvas/ui/hooks/use-canvas-viewport-actions.ts';
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const lines = (file) => read(file).split('\n').length;
const requireCondition = (condition, message) => { if (!condition) errors.push(message); };

for (const file of [controller, viewport]) {
  requireCondition(fs.existsSync(path.join(root, file)), `arquivo obrigatório ausente: ${file}`);
}

if (fs.existsSync(path.join(root, controller))) {
  const source = read(controller);
  requireCondition(lines(controller) <= 300, `controller ainda excede 300 linhas (${lines(controller)})`);
  requireCondition(source.includes('useCanvasViewportActions'), 'controller não delega viewport para hook especializado');
  for (const forbidden of ['getNodesBounds', 'viewportBeforeInspectorRef', 'safeLeft =', 'safeRight =']) {
    requireCondition(!source.includes(forbidden), `responsabilidade de viewport voltou ao controller: ${forbidden}`);
  }
}

if (fs.existsSync(path.join(root, viewport))) {
  const source = read(viewport);
  requireCondition(lines(viewport) <= 180, `hook de viewport excede 180 linhas (${lines(viewport)})`);
  for (const required of ['fitCurrentGraph', 'frameVisualization', 'openInspector', 'closeInspector', 'setCanvasMode']) {
    requireCondition(source.includes(required), `hook de viewport perdeu responsabilidade: ${required}`);
  }
}

requireCondition(fs.existsSync(path.join(root, '.gitignore')), '.gitignore ausente');
if (fs.existsSync(path.join(root, '.gitignore'))) {
  requireCondition(read('.gitignore').includes('.patch-backups/'), '.patch-backups não está ignorado');
}
requireCondition(!fs.existsSync(path.join(root, '.patch-backups')), '.patch-backups local não foi removido');

if (errors.length) {
  console.error('\nSO-003 GOD SLAYER WAVE 01: FAIL\n');
  errors.forEach((error, index) => console.error(`${index + 1}. ${error}.`));
  process.exit(1);
}

console.log('PASS: viewport extraído do workspace controller e resíduos locais removidos.');
