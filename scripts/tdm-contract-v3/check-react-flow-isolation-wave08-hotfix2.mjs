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

const wave04Gate = read('scripts/tdm-contract-v3/check-react-flow-isolation-wave04.mjs');
const foundation = read(`${featureRoot}/ui/hooks/use-canvas-workspace-foundation.ts`);
const runtimeAdapter = read(`${featureRoot}/react-flow/use-canvas-flow-state.ts`);
const dragHook = read(`${featureRoot}/ui/hooks/use-canvas-stage-drag-and-drop.ts`);

if (!wave04Gate.includes('runtimeAdapterFile')) errors.push('gate da Wave 04 ainda assume adaptação concreta dentro da UI foundation');
if (!wave04Gate.includes('react-flow/use-canvas-flow-state.ts')) errors.push('gate da Wave 04 não inspeciona o adapter oficial de runtime');
if (foundation.includes('useMemo<CanvasStageDropRuntime>')) errors.push('workspace foundation voltou a montar diretamente o runtime de drop');
if (foundation.includes('@xyflow/react')) errors.push('workspace foundation voltou a importar XYFlow');
if (!foundation.includes('useCanvasFlowRuntime')) errors.push('workspace foundation não consome o adapter oficial de runtime');
if (!runtimeAdapter.includes('stageDropRuntime: CanvasStageDropRuntime')) errors.push('adapter oficial não expõe o contrato neutro de drop');
if (!runtimeAdapter.includes('screenToFlowPosition:')) errors.push('adapter oficial não possui a conversão de coordenadas');
if (dragHook.includes('@xyflow/react')) errors.push('hook de drag-and-drop voltou a importar XYFlow');

if (errors.length) {
  console.error('\nSO-011 REACT FLOW ISOLATION WAVE 08 HOTFIX 2: FAIL\n');
  errors.forEach((error, index) => console.error(`${index + 1}. ${error}.`));
  process.exit(1);
}

console.log('PASS SO-011 React Flow Isolation Wave 08 hotfix 2: Wave 04 now recognizes the explicit drop runtime adapter introduced by Wave 08 without restoring XYFlow ownership to UI foundation.');
