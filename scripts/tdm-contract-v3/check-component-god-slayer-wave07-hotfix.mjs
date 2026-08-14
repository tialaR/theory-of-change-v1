import fs from 'node:fs';

const innerPath = 'src/features/theory-of-change/components/canvas/tdm-canvas-inner.tsx';
const edgePath = 'src/features/theory-of-change/components/canvas/tdm-canvas-controllers/use-canvas-edge-feedback-controller.ts';
const editPath = 'src/features/theory-of-change/components/canvas/tdm-canvas-controllers/use-canvas-edit-form-controller.ts';
const failures = [];

for (const path of [innerPath, edgePath, editPath]) {
  if (!fs.existsSync(path)) failures.push(`ausente: ${path}`);
}

if (failures.length === 0) {
  const inner = fs.readFileSync(innerPath, 'utf8');
  const edge = fs.readFileSync(edgePath, 'utf8');
  const edit = fs.readFileSync(editPath, 'utf8');

  if (!inner.includes('useCanvasEdgeFeedbackController()')) failures.push('Canvas Inner não compõe edge feedback controller');
  if (!inner.includes('useCanvasEditFormController({')) failures.push('Canvas Inner não compõe edit form controller');
  if (inner.includes('setRecentlyUpdatedEdgeIds')) failures.push('estado de edge feedback voltou ao Canvas Inner');
  if (!edge.includes('markEdgeRecentlyUpdated')) failures.push('edge feedback controller perdeu markEdgeRecentlyUpdated');
  if (!edit.includes('clearEditFormState')) failures.push('edit form controller perdeu clearEditFormState');
}

if (failures.length) {
  console.error('\nTDM COMPONENT GOD SLAYER WAVE 07 HOTFIX: FAIL\n');
  failures.forEach((failure, index) => console.error(`${index + 1}. ${failure}`));
  process.exit(1);
}

console.log('PASS: feedback de edges e limpeza do formulário possuem controllers próprios; Canvas Inner não perdeu contratos.');
