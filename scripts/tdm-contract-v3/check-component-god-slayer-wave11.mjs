import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const innerPath = path.join(root, 'src/features/theory-of-change/components/canvas/tdm-canvas-inner.tsx');
const controllerPath = path.join(
  root,
  'src/features/theory-of-change/components/canvas/tdm-canvas-controllers/use-canvas-stage-guide-controller.ts'
);
const failures = [];

if (!fs.existsSync(innerPath)) failures.push('TdmCanvasInner ausente');
if (!fs.existsSync(controllerPath)) failures.push('controller de etapas e guide ausente');

if (fs.existsSync(innerPath)) {
  const source = fs.readFileSync(innerPath, 'utf8');
  const lines = source.split(/\r?\n/).length;
  if (lines > 660) failures.push(`TdmCanvasInner excede 660 linhas (${lines})`);
  for (const token of [
    'getTheoryGuideContent',
    'getStageCounts(',
    'getNextStageCreation(',
    'stageAdvancedToast(',
    'theoryCompleteToast()',
    'const advanceStage = useCallback'
  ]) {
    if (source.includes(token)) failures.push(`TdmCanvasInner ainda possui responsabilidade de etapa/guide: ${token}`);
  }
  if (!source.includes('useCanvasStageGuideController')) {
    failures.push('TdmCanvasInner não delega etapas e guide ao controller oficial');
  }
}

if (fs.existsSync(controllerPath)) {
  const source = fs.readFileSync(controllerPath, 'utf8');
  const lines = source.split(/\r?\n/).length;
  if (lines > 220) failures.push(`controller de etapas e guide excede 220 linhas (${lines})`);
  for (const token of [
    'getTheoryGuideContent',
    'getStageCounts',
    'advanceStage',
    'toggleGuideExpanded',
    'setConnectingFromStage',
    'resultAvailabilityMessage'
  ]) {
    if (!source.includes(token)) failures.push(`controller de etapas e guide perdeu contrato: ${token}`);
  }
}

if (failures.length) {
  console.error('\nTDM COMPONENT GOD SLAYER WAVE 11: FAIL\n');
  failures.forEach((failure, index) => console.error(`${index + 1}. ${failure}`));
  process.exit(1);
}

console.log('PASS: avanço de etapas, guide, disponibilidade de resultado e feedback de conclusão possuem controller próprio; Canvas Inner caiu abaixo de 660 linhas.');
