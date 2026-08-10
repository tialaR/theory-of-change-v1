#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];
const featureRoot = 'src/features/theory-of-change/canvas';
const contractsFile = `${featureRoot}/react-flow/canvas-flow.contracts.ts`;
const viewportHook = `${featureRoot}/ui/hooks/use-canvas-viewport-actions.ts`;
const foundationHook = `${featureRoot}/ui/hooks/use-canvas-workspace-foundation.ts`;
const runtimeAdapterFile = `${featureRoot}/react-flow/use-canvas-flow-state.ts`;
const wave01Gate = 'scripts/tdm-contract-v3/check-react-flow-isolation-wave01.mjs';
const xyflowImport = /@xyflow\/react/;

function read(file) {
  const absolute = path.join(root, file);
  if (!fs.existsSync(absolute)) {
    errors.push(`arquivo obrigatório ausente: ${file}`);
    return '';
  }
  return fs.readFileSync(absolute, 'utf8');
}

const contracts = read(contractsFile);
const viewport = read(viewportHook);
const foundation = read(foundationHook);
const runtimeAdapter = read(runtimeAdapterFile);
const wave01 = read(wave01Gate);

for (const contract of ['CanvasViewportNode', 'CanvasFlowBounds', 'CanvasViewportTransition', 'CanvasViewportRuntime']) {
  if (!contracts.includes(`export type ${contract}`)) errors.push(`${contract} não está formalizado`);
}
if (xyflowImport.test(contracts)) errors.push('contratos neutros de viewport importam @xyflow/react');
if (xyflowImport.test(viewport)) errors.push('use-canvas-viewport-actions voltou a importar @xyflow/react');
if (viewport.includes('ReactFlowInstance')) errors.push('use-canvas-viewport-actions voltou a depender de ReactFlowInstance');
if (!viewport.includes('viewportRuntime: CanvasViewportRuntime')) errors.push('hook de viewport não depende do runtime neutro');
if (!viewport.includes('viewportRuntime.getNodesBounds(nodes)')) errors.push('cálculo de bounds não atravessa o runtime neutro');
if (!viewport.includes('viewportRuntime.setViewport')) errors.push('mudança de viewport não atravessa o runtime neutro');
if (!viewport.includes('viewportRuntime.zoomIn')) errors.push('zoom in não atravessa o runtime neutro');
if (!viewport.includes('viewportRuntime.zoomOut')) errors.push('zoom out não atravessa o runtime neutro');
if (!runtimeAdapter.includes('useMemo<{')) errors.push('adapter de runtime não memoiza as portas neutras');
if (!runtimeAdapter.includes('viewportRuntime: CanvasViewportRuntime')) errors.push('adapter de runtime não formaliza CanvasViewportRuntime');
if (!runtimeAdapter.includes('viewportRuntime: {')) errors.push('adapter de runtime não adapta XYFlow ao runtime neutro');
if (!foundation.includes('useCanvasFlowRuntime()')) errors.push('workspace foundation não consome o adapter de runtime');
if (!foundation.includes('viewportRuntime } = useCanvasFlowRuntime()')) errors.push('workspace foundation não recebe o runtime neutro de viewport');
if (!foundation.includes('viewportRuntime,')) errors.push('workspace foundation não injeta o runtime de viewport');
if (wave01.includes('use-canvas-viewport-actions.ts')) errors.push('allowlist da Wave 01 ainda autoriza import direto de XYFlow no hook de viewport');

if (errors.length) {
  console.error('\nSO-011 REACT FLOW ISOLATION WAVE 03: FAIL\n');
  errors.forEach((error, index) => console.error(`${index + 1}. ${error}.`));
  process.exit(1);
}

console.log('PASS SO-011 React Flow Isolation Wave 03: viewport commands consume a framework-neutral runtime port and direct XYFlow ownership remains at the workspace adapter boundary.');
