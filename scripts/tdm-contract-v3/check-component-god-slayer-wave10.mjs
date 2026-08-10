import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const innerPath = path.join(root, 'src/features/theory-of-change/components/canvas/tdm-canvas-inner.tsx');
const controllerPath = path.join(root, 'src/features/theory-of-change/components/canvas/tdm-canvas-controllers/use-canvas-navigation-controller.ts');
const failures = [];

if (!fs.existsSync(innerPath)) failures.push('TdmCanvasInner ausente');
if (!fs.existsSync(controllerPath)) failures.push('controller de navegação ausente');

if (fs.existsSync(innerPath)) {
  const source = fs.readFileSync(innerPath, 'utf8');
  const lines = source.split(/\r?\n/).length;
  if (lines > 750) failures.push(`TdmCanvasInner excede 750 linhas (${lines})`);
  for (const token of ['previousTheorySnapshot', 'setPreviousTheorySnapshot', 'type TheorySnapshot']) {
    if (source.includes(token)) failures.push(`TdmCanvasInner ainda possui responsabilidade de snapshot: ${token}`);
  }
  if (!source.includes('useCanvasNavigationController')) failures.push('TdmCanvasInner não delega navegação');
}

if (fs.existsSync(controllerPath)) {
  const source = fs.readFileSync(controllerPath, 'utf8');
  for (const token of ['saveCurrentTheorySnapshot', 'restorePreviousTheory', 'openResultView', 'closeResultView']) {
    if (!source.includes(token)) failures.push(`controller de navegação perdeu contrato: ${token}`);
  }
}

if (failures.length) {
  console.error('\nTDM COMPONENT GOD SLAYER WAVE 10: FAIL\n');
  failures.forEach((failure, index) => console.error(`${index + 1}. ${failure}`));
  process.exit(1);
}

console.log('PASS: snapshots, preview e navegação de resultado possuem controller próprio; Canvas Inner caiu abaixo de 750 linhas.');
