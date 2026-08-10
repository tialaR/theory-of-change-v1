import fs from 'node:fs';

const innerPath = 'src/features/theory-of-change/components/canvas/tdm-canvas-inner.tsx';
const viewPath = 'src/features/theory-of-change/components/canvas/tdm-canvas-workspace-view.tsx';
const modelPath = 'src/features/theory-of-change/components/canvas/tdm-canvas-view-model.ts';
const nodePath = 'src/features/theory-of-change/components/canvas/tdm-canvas-node/tdm-canvas-node.tsx';
const failures = [];

for (const path of [innerPath, viewPath, modelPath, nodePath]) {
  if (!fs.existsSync(path)) failures.push(`ausente: ${path}`);
}

if (failures.length === 0) {
  const inner = fs.readFileSync(innerPath, 'utf8');
  const view = fs.readFileSync(viewPath, 'utf8');
  const model = fs.readFileSync(modelPath, 'utf8');
  const node = fs.readFileSync(nodePath, 'utf8');
  const innerLines = inner.split('\n').length;
  const viewLines = view.split('\n').length;
  const modelLines = model.split('\n').length;

  if (innerLines > 1450) failures.push(`tdm-canvas-inner excede budget de 1450 linhas (${innerLines})`);
  if (viewLines > 180) failures.push(`workspace view excede budget de 180 linhas (${viewLines})`);
  if (modelLines > 220) failures.push(`view model excede budget de 220 linhas (${modelLines})`);
  if (!inner.includes('<TdmCanvasWorkspaceView')) failures.push('canvas inner não delega renderização ao workspace view');
  if (inner.includes('<ReactFlow')) failures.push('canvas inner voltou a renderizar ReactFlow diretamente');
  if (inner.includes('<TdmSidebarFeature')) failures.push('canvas inner voltou a renderizar a feature Sidebar diretamente');
  if (!model.includes('buildCanvasFlowNodes') || !model.includes('buildCanvasFlowEdges')) failures.push('adapters de nodes/edges ausentes');
  if (!model.includes('buildSidebarBlockForms') || !model.includes('buildSidebarContext')) failures.push('adapters da Sidebar ausentes');
  if (!node.includes('export type TdmNodeInteractionContextValue')) failures.push('contrato de interação dos nodes não está exportado');
  if (/\.scss['"]/i.test(inner + view + model)) failures.push('SCSS introduzido na Wave 05');
}

if (failures.length) {
  console.error('\nTDM COMPONENT GOD SLAYER WAVE 05: FAIL\n');
  failures.forEach((failure, index) => console.error(`${index + 1}. ${failure}`));
  process.exit(1);
}

console.log('PASS: Canvas Inner delega view, adapters de React Flow e contratos da Sidebar por responsabilidade.');
