import fs from 'node:fs';

const controllerPath = 'src/features/theory-of-change/canvas/ui/hooks/use-canvas-workspace-controller.ts';
const foundationPath = 'src/features/theory-of-change/canvas/ui/hooks/use-canvas-workspace-foundation.ts';
const actionsPath = 'src/features/theory-of-change/canvas/ui/hooks/use-canvas-workspace-actions.ts';
const failures = [];

for (const file of [controllerPath, foundationPath, actionsPath]) {
  if (!fs.existsSync(file)) failures.push(`arquivo obrigatório ausente: ${file}`);
}

if (!failures.length) {
  const controller = fs.readFileSync(controllerPath, 'utf8');
  const foundation = fs.readFileSync(foundationPath, 'utf8');
  const actions = fs.readFileSync(actionsPath, 'utf8');
  const lines = controller.split('\n').length;

  if (lines > 80) failures.push(`workspace controller excede budget final 80: ${lines}`);
  if (!controller.includes('useCanvasWorkspaceFoundation')) failures.push('foundation não compõe o controller');
  if (!controller.includes('useCanvasWorkspaceActions')) failures.push('actions não compõem o controller');
  if (controller.includes('useCanvasNodeActions')) failures.push('ações de nó retornaram ao controller');
  if (controller.includes('useCanvasRelationActions')) failures.push('ações de relação retornaram ao controller');
  if (controller.includes('useCanvasSaveController')) failures.push('persistência retornou ao controller');
  if (!foundation.includes('useCanvasSaveController')) failures.push('foundation não concentra persistência');
  if (!foundation.includes('useCanvasViewportActions')) failures.push('foundation não concentra viewport');
  if (!actions.includes('useCanvasStageDragAndDrop')) failures.push('composition de actions não concentra DnD');
  if (!actions.includes('useCanvasRelationActions')) failures.push('composition de actions não concentra relações');
}

if (failures.length) {
  console.error('\nTDM GOD SLAYER WAVE 04: FAIL\n');
  failures.forEach((failure, index) => console.error(`${index + 1}. ${failure}`));
  process.exit(1);
}

console.log('PASS: workspace controller reduzido a facade; foundation e actions isoladas.');
