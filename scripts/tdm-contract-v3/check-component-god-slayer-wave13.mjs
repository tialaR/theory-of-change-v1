import fs from 'node:fs';

const innerPath = 'src/features/theory-of-change/components/canvas/tdm-canvas-inner.tsx';
const ownerPath = 'src/features/theory-of-change/components/canvas/tdm-canvas-controllers/use-canvas-presentation-model.ts';
const inner = fs.readFileSync(innerPath, 'utf8');
const owner = fs.readFileSync(ownerPath, 'utf8');
const failures = [];
const lines = inner.split(/\r?\n/).length;
if (lines > 460) failures.push(`TdmCanvasInner excede 460 linhas (${lines}).`);
for (const forbidden of ['buildCanvasFlowNodes', 'buildCanvasFlowEdges', 'buildSidebarBlockForms', 'buildSidebarContext', 'CANVAS_DS_MINIMAP']) {
  if (inner.includes(forbidden)) failures.push(`TdmCanvasInner retomou responsabilidade de apresentacao: ${forbidden}`);
}
for (const required of ['buildCanvasFlowNodes', 'buildCanvasFlowEdges', 'buildSidebarBlockForms', 'buildSidebarContext', 'minimapNodeColor']) {
  if (!owner.includes(required)) failures.push(`owner de apresentacao incompleto: ${required}`);
}
if (failures.length) {
  console.error('\nTDM COMPONENT GOD SLAYER WAVE 13: FAIL\n');
  failures.forEach((failure, index) => console.error(`${index + 1}. ${failure}`));
  process.exit(1);
}
console.log('PASS: nodes, edges, formularios, contexto e minimap possuem owner de apresentacao; Canvas Inner caiu abaixo de 460 linhas.');
