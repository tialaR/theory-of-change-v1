import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const exists = (relative) => fs.existsSync(path.join(root, relative));
const lines = (source) => source.split(/\r?\n/).length;

const innerPath = 'src/features/theory-of-change/components/canvas/tdm-canvas-inner.tsx';
const compositionPath = 'src/features/theory-of-change/components/canvas/tdm-canvas-workspace-composition.tsx';
const controllerPath = 'src/features/theory-of-change/components/canvas/tdm-canvas-controllers/use-canvas-interaction-controller.ts';
const runtimePath = 'src/features/theory-of-change/components/canvas/tdm-canvas-config/tdm-canvas-runtime.ts';

for (const relative of [innerPath, compositionPath, controllerPath, runtimePath]) {
  if (!exists(relative)) failures.push(`arquivo obrigatorio ausente: ${relative}`);
}

if (failures.length === 0) {
  const inner = read(innerPath);
  const composition = read(compositionPath);
  const controller = read(controllerPath);
  const runtime = read(runtimePath);

  if (lines(inner) > 40) failures.push(`TdmCanvasInner deixou de ser shell e excede 40 linhas (${lines(inner)})`);
  if (!inner.includes('useCanvasWorkspaceComposition')) failures.push('Canvas Inner nao delega ao owner oficial de composicao');
  if (!composition.includes('useCanvasInteractionController')) failures.push('owner de composicao nao delega interacoes ao controller oficial');
  if (!composition.includes("from './tdm-canvas-config/tdm-canvas-runtime'")) failures.push('owner de composicao nao usa o runtime config oficial');

  const forbiddenShell = [
    "target.closest('.react-flow__node')",
    'useCanvasInteractionController',
    'QUICK_STAGE_DRAFTS',
    'EMPTY_DRAFT',
    'defaultEdgeOptions',
    'nodeTypes',
    'edgeTypes'
  ];
  for (const token of forbiddenShell) {
    if (inner.includes(token)) failures.push(`responsabilidade voltou ao shell Canvas Inner: ${token}`);
  }

  for (const token of ['handlePaneClick', 'handleFlowBackgroundClick', 'focusNodeSelection', 'handleNodeClick', 'handleEdgeClick']) {
    if (!controller.includes(token)) failures.push(`controller de interacao perdeu contrato: ${token}`);
  }

  for (const token of ['EMPTY_DRAFT', 'QUICK_STAGE_DRAFTS', 'defaultEdgeOptions', 'CANVAS_FIT_VIEW_OPTIONS', 'nodeTypes', 'edgeTypes']) {
    if (!runtime.includes(token)) failures.push(`runtime config perdeu contrato: ${token}`);
  }

  if (lines(controller) > 220) failures.push(`interaction controller excede budget de 220 linhas (${lines(controller)})`);
  if (lines(runtime) > 130) failures.push(`runtime config excede budget de 130 linhas (${lines(runtime)})`);
}

if (failures.length) {
  console.error('\nTDM COMPONENT GOD SLAYER WAVE 12: FAIL\n');
  failures.forEach((failure, index) => console.error(`${index + 1}. ${failure}`));
  process.exit(1);
}

console.log('PASS: interacoes e runtime config permanecem em owners proprios; Canvas Inner e shell puro de composicao.');
