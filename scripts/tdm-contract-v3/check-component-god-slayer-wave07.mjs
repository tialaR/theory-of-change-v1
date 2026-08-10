import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const canvasDir = path.join(root, 'src/features/theory-of-change/components/canvas');
const innerPath = path.join(canvasDir, 'tdm-canvas-inner.tsx');
const controllerDir = path.join(canvasDir, 'tdm-canvas-controllers');
const requiredControllers = [
  'use-canvas-viewport-controller.ts',
  'use-canvas-selection-controller.ts',
  'use-canvas-keyboard-controller.ts',
  'use-canvas-drag-controller.ts'
];
const failures = [];

for (const file of requiredControllers) {
  const fullPath = path.join(controllerDir, file);
  if (!fs.existsSync(fullPath)) failures.push(`controller ausente: ${file}`);
  else if (fs.readFileSync(fullPath, 'utf8').split('\n').length > 150) failures.push(`controller excede 150 linhas: ${file}`);
}

const inner = fs.readFileSync(innerPath, 'utf8');
const innerLines = inner.split('\n').length;
if (innerLines > 1300) failures.push(`TdmCanvasInner excede budget Wave 07 (${innerLines}/1300)`);
for (const token of ['useCanvasViewportController', 'useCanvasSelectionController', 'useCanvasKeyboardController', 'useCanvasDragController']) {
  if (!inner.includes(token)) failures.push(`TdmCanvasInner não compõe ${token}`);
}
for (const forbidden of ["window.addEventListener('keydown'", "dataTransfer.setData('application/x-tdm-stage'", 'setViewportResetToken']) {
  if (inner.includes(forbidden)) failures.push(`responsabilidade retornou ao TdmCanvasInner: ${forbidden}`);
}

if (failures.length) {
  console.error('\nTDM COMPONENT GOD SLAYER WAVE 07: FAIL\n');
  failures.forEach((failure, index) => console.error(`${index + 1}. ${failure}`));
  process.exit(1);
}

console.log('PASS: viewport, seleção, teclado e drag possuem controllers próprios; Canvas Inner permanece compositor.');
