#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];
const featureRoot = 'src/features/theory-of-change/canvas';

function read(file) {
  const absolute = path.join(root, file);
  if (!fs.existsSync(absolute)) {
    errors.push(`arquivo obrigatório ausente: ${file}`);
    return '';
  }
  return fs.readFileSync(absolute, 'utf8');
}

const wave03Gate = read('scripts/tdm-contract-v3/check-react-flow-isolation-wave03.mjs');
const foundation = read(`${featureRoot}/ui/hooks/use-canvas-workspace-foundation.ts`);
const runtimeAdapter = read(`${featureRoot}/react-flow/use-canvas-flow-state.ts`);

if (!wave03Gate.includes('runtimeAdapterFile')) errors.push('gate da Wave 03 ainda assume adaptação concreta dentro da UI foundation');
if (!wave03Gate.includes("react-flow/use-canvas-flow-state.ts")) errors.push('gate da Wave 03 não inspeciona o adapter oficial de runtime');
if (foundation.includes('useMemo<CanvasViewportRuntime>')) errors.push('workspace foundation voltou a montar diretamente o runtime de viewport');
if (foundation.includes('@xyflow/react')) errors.push('workspace foundation voltou a importar XYFlow');
if (!foundation.includes('useCanvasFlowRuntime')) errors.push('workspace foundation não consome o adapter oficial de runtime');
if (!runtimeAdapter.includes('useReactFlow')) errors.push('adapter oficial deixou de possuir a integração useReactFlow');
if (!runtimeAdapter.includes('viewportRuntime: CanvasViewportRuntime')) errors.push('adapter oficial não expõe o contrato neutro de viewport');
if (!runtimeAdapter.includes('stageDropRuntime: CanvasStageDropRuntime')) errors.push('adapter oficial não expõe o contrato neutro de drop');

if (errors.length) {
  console.error('\nSO-011 REACT FLOW ISOLATION WAVE 08 HOTFIX: FAIL\n');
  errors.forEach((error, index) => console.error(`${index + 1}. ${error}.`));
  process.exit(1);
}

console.log('PASS SO-011 React Flow Isolation Wave 08 hotfix: Wave 03 now recognizes the explicit runtime adapter introduced by Wave 08 without restoring XYFlow ownership to UI foundation.');
