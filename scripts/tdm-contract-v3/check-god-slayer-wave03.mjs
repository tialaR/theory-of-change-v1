import fs from 'node:fs';

const controllerPath = 'src/features/theory-of-change/canvas/ui/hooks/use-canvas-workspace-controller.ts';
const foundationPath = 'src/features/theory-of-change/canvas/ui/hooks/use-canvas-workspace-foundation.ts';
const actionsPath = 'src/features/theory-of-change/canvas/ui/hooks/use-canvas-workspace-actions.ts';
const selectionPath = 'src/features/theory-of-change/canvas/ui/hooks/use-canvas-selection.ts';
const navigationPath = 'src/features/theory-of-change/canvas/ui/hooks/use-canvas-workspace-navigation.ts';
const failures = [];

for (const file of [controllerPath, foundationPath, actionsPath, selectionPath, navigationPath]) {
  if (!fs.existsSync(file)) failures.push(`arquivo obrigatório ausente: ${file}`);
}

if (!failures.length) {
  const controller = fs.readFileSync(controllerPath, 'utf8');
  const foundation = fs.readFileSync(foundationPath, 'utf8');
  const actions = fs.readFileSync(actionsPath, 'utf8');
  const lines = controller.split('\n').length;
  if (lines > 80) failures.push(`workspace controller excede budget final 80: ${lines}`);
  if (!foundation.includes('useCanvasSelection')) failures.push('seleção derivada não está na composition foundation');
  if (!actions.includes('useCanvasWorkspaceNavigation')) failures.push('navegação pós-save não está na composition de actions');
  if (controller.includes("openHome: () => saveController.navigateAfterSave")) failures.push('navegação inline retornou ao controller');
  if (controller.includes('flow.nodes.find((node) => node.id === ui.selectedNodeId)')) failures.push('derivação inline de seleção retornou ao controller');
}

if (failures.length) {
  console.error('\nTDM GOD SLAYER WAVE 03: FAIL\n');
  failures.forEach((failure, index) => console.error(`${index + 1}. ${failure}`));
  process.exit(1);
}

console.log('PASS: seleção e navegação permanecem extraídas nas compositions oficiais.');
