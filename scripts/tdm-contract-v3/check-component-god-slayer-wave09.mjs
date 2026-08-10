import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const innerPath = path.join(root, 'src/features/theory-of-change/components/canvas/tdm-canvas-inner.tsx');
const controllerPath = path.join(root, 'src/features/theory-of-change/components/canvas/tdm-canvas-controllers/use-canvas-node-crud-controller.ts');
const errors = [];
const inner = fs.readFileSync(innerPath, 'utf8');
const controller = fs.existsSync(controllerPath) ? fs.readFileSync(controllerPath, 'utf8') : '';
const lines = inner.split(/\r?\n/).length;

if (!controller) errors.push('controller de ciclo de vida dos nodes não existe');
if (lines > 850) errors.push(`TdmCanvasInner excede budget da Wave 09 (${lines}/850)`);
if (!inner.includes('useCanvasNodeCrudController')) errors.push('TdmCanvasInner não compõe o controller de nodes');
for (const token of ['const updateNodeById = useCallback', 'const deleteNodeById = useCallback', 'const duplicateNodeById = useCallback', 'const createNodeFromDraft = useCallback']) {
  if (inner.includes(token)) errors.push(`responsabilidade retornou ao Canvas Inner: ${token}`);
}
for (const token of ['updateNodeById', 'deleteNodeById', 'duplicateNodeById', 'createNodeFromDraft', 'handleSaveSelectedNode']) {
  if (!controller.includes(token)) errors.push(`controller perdeu contrato obrigatório: ${token}`);
}
if (controller.split(/\r?\n/).length > 430) errors.push('controller de nodes excede budget de 430 linhas');

if (errors.length) {
  console.error('\nTDM COMPONENT GOD SLAYER WAVE 09: FAIL\n');
  errors.forEach((error, index) => console.error(`${index + 1}. ${error}`));
  process.exit(1);
}
console.log('PASS: criação, edição, duplicação e remoção de nodes possuem controller próprio; Canvas Inner caiu abaixo de 850 linhas.');
