import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const innerPath = path.join(root, 'src/features/theory-of-change/components/canvas/tdm-canvas-inner.tsx');
const compositionPath = path.join(root, 'src/features/theory-of-change/components/canvas/tdm-canvas-workspace-composition.tsx');
const statePath = path.join(root, 'src/features/theory-of-change/components/canvas/tdm-canvas-controllers/use-canvas-workspace-state.ts');

const failures = [];
const read = (file) => fs.readFileSync(file, 'utf8');
const lines = (content) => content.split(/\r?\n/).length;

for (const file of [innerPath, compositionPath, statePath]) {
  if (!fs.existsSync(file)) failures.push(`arquivo obrigatório ausente: ${path.relative(root, file)}`);
}

if (failures.length === 0) {
  const inner = read(innerPath);
  const composition = read(compositionPath);
  const state = read(statePath);

  if (lines(inner) > 25) failures.push(`TdmCanvasInner excede shell budget de 25 linhas (${lines(inner)})`);
  if (!inner.includes('useCanvasWorkspaceComposition')) failures.push('TdmCanvasInner não delega para o owner de composição');
  for (const forbidden of ['useState', 'useMemo', 'useReactFlow', 'useCanvasNodeCrudController', 'TdmCanvasWorkspaceView', 'ResultView']) {
    if (inner.includes(forbidden)) failures.push(`TdmCanvasInner retomou responsabilidade proibida: ${forbidden}`);
  }

  if (lines(composition) > 440) failures.push(`owner de composição excede budget de 440 linhas (${lines(composition)})`);
  if (!composition.includes('useCanvasWorkspaceState')) failures.push('owner de composição não delega estado para owner próprio');
  if (!composition.includes('TdmCanvasWorkspaceView')) failures.push('owner de composição perdeu a view oficial do Canvas');

  if (lines(state) > 90) failures.push(`owner de estado excede budget de 90 linhas (${lines(state)})`);
  for (const required of ['useNodesState', 'useEdgesState', 'useReactFlow', 'useContextualFlowTooltip']) {
    if (!state.includes(required)) failures.push(`owner de estado perdeu contrato obrigatório: ${required}`);
  }
}

if (failures.length) {
  console.error('\nTDM COMPONENT GOD SLAYER WAVE 14: FAIL\n');
  failures.forEach((failure, index) => console.error(`${index + 1}. ${failure}`));
  process.exit(1);
}

console.log('PASS: TdmCanvasInner virou shell de 10 linhas; composição e estado possuem owners próprios com budgets executáveis.');
