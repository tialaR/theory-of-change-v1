import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const controllerPath = 'src/features/theory-of-change/canvas/ui/hooks/use-canvas-workspace-controller.ts';
const navigationPath = 'src/features/theory-of-change/canvas/ui/hooks/use-canvas-workspace-navigation.ts';
const selectionPath = 'src/features/theory-of-change/canvas/ui/hooks/use-canvas-selection.ts';
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const failures = [];

for (const file of [controllerPath, navigationPath, selectionPath]) {
  if (!fs.existsSync(path.join(root, file))) failures.push(`arquivo obrigatório ausente: ${file}`);
}

if (failures.length === 0) {
  const controller = read(controllerPath);
  const navigation = read(navigationPath);
  const selection = read(selectionPath);
  const controllerLines = controller.split(/\r?\n/).length;
  if (controllerLines > 240) failures.push(`workspace controller excede 240 linhas (${controllerLines}).`);
  if (!selection.includes('=> CanvasRelationKind | null')) failures.push('seleção não aceita relação ausente.');
  if (!navigation.includes('boolean | Promise<boolean>')) failures.push('navegação não preserva o contrato booleano de navigateAfterSave.');
  if (!navigation.includes('await navigateAfterSave')) failures.push('navegação não consome o retorno assíncrono sem vazá-lo para a UI.');
}

if (failures.length > 0) {
  console.error('\nTDM GOD SLAYER WAVE 03 HOTFIX: FAIL\n');
  failures.forEach((failure, index) => console.error(`${index + 1}. ${failure}`));
  process.exit(1);
}

console.log('PASS: contratos de seleção, navegação e budget da Wave 03 corrigidos.');
