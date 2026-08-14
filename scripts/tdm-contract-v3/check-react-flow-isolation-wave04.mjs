#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];
const featureRoot = 'src/features/theory-of-change/canvas';
const contractsFile = `${featureRoot}/react-flow/canvas-flow.contracts.ts`;
const dragHook = `${featureRoot}/ui/hooks/use-canvas-stage-drag-and-drop.ts`;
const foundationHook = `${featureRoot}/ui/hooks/use-canvas-workspace-foundation.ts`;
const runtimeAdapterFile = `${featureRoot}/react-flow/use-canvas-flow-state.ts`;
const actionsHook = `${featureRoot}/ui/hooks/use-canvas-workspace-actions.ts`;
const wave01Gate = 'scripts/tdm-contract-v3/check-react-flow-isolation-wave01.mjs';

function read(file) {
  const absolute = path.join(root, file);
  if (!fs.existsSync(absolute)) { errors.push(`arquivo obrigatório ausente: ${file}`); return ''; }
  return fs.readFileSync(absolute, 'utf8');
}

const contracts = read(contractsFile);
const drag = read(dragHook);
const foundation = read(foundationHook);
const runtimeAdapter = read(runtimeAdapterFile);
const actions = read(actionsHook);
const wave01 = read(wave01Gate);

if (!contracts.includes('export type CanvasStageDropRuntime')) errors.push('CanvasStageDropRuntime não está formalizado');
if (!contracts.includes('screenToFlowPosition')) errors.push('runtime neutro não expõe screenToFlowPosition');
if (contracts.includes('@xyflow/react')) errors.push('contratos neutros importam @xyflow/react');
if (drag.includes('@xyflow/react')) errors.push('hook de drag-and-drop voltou a importar @xyflow/react');
if (drag.includes('ReactFlowInstance') || drag.includes('XYPosition')) errors.push('hook de drag-and-drop voltou a depender de tipos XYFlow');
if (!drag.includes('stageDropRuntime: CanvasStageDropRuntime')) errors.push('hook de drag-and-drop não depende do runtime neutro');
if (!drag.includes('stageDropRuntime.screenToFlowPosition')) errors.push('conversão de coordenadas não atravessa o runtime neutro');
if (foundation.includes('useMemo<CanvasStageDropRuntime>')) errors.push('workspace foundation voltou a montar diretamente o runtime de drop');
if (foundation.includes('@xyflow/react')) errors.push('workspace foundation voltou a importar XYFlow');
if (!foundation.includes('useCanvasFlowRuntime')) errors.push('workspace foundation não consome o adapter oficial de runtime');
if (!foundation.includes('stageDropRuntime,')) errors.push('workspace foundation não expõe o runtime de drop');
if (!runtimeAdapter.includes('stageDropRuntime: CanvasStageDropRuntime')) errors.push('adapter oficial não expõe CanvasStageDropRuntime');
if (!runtimeAdapter.includes('screenToFlowPosition:')) errors.push('adapter oficial não adapta screenToFlowPosition');
if (!actions.includes('stageDropRuntime,')) errors.push('workspace actions não injeta o runtime de drop');
if (wave01.includes('use-canvas-stage-drag-and-drop.ts')) errors.push('allowlist da Wave 01 ainda autoriza XYFlow no hook de drag-and-drop');

if (errors.length) {
  console.error('\nSO-011 REACT FLOW ISOLATION WAVE 04: FAIL\n');
  errors.forEach((error, index) => console.error(`${index + 1}. ${error}.`));
  process.exit(1);
}

console.log('PASS SO-011 React Flow Isolation Wave 04: stage drag-and-drop consumes a framework-neutral coordinate runtime while XYFlow conversion remains in the explicit runtime adapter.');
