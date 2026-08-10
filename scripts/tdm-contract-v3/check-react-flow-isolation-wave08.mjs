#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];
const featureRoot = 'src/features/theory-of-change/canvas';
const foundationFile = `${featureRoot}/ui/hooks/use-canvas-workspace-foundation.ts`;
const adapterFile = `${featureRoot}/react-flow/use-canvas-flow-state.ts`;
const wave01Gate = 'scripts/tdm-contract-v3/check-react-flow-isolation-wave01.mjs';

function read(file) {
  const absolute = path.join(root, file);
  if (!fs.existsSync(absolute)) {
    errors.push(`arquivo obrigatório ausente: ${file}`);
    return '';
  }
  return fs.readFileSync(absolute, 'utf8');
}

const foundation = read(foundationFile);
const adapter = read(adapterFile);
const wave01 = read(wave01Gate);

if (foundation.includes('@xyflow/react')) {
  errors.push('workspace foundation voltou a importar @xyflow/react diretamente');
}
if (foundation.includes('useReactFlow')) {
  errors.push('workspace foundation voltou a possuir o hook useReactFlow');
}
if (!foundation.includes('useCanvasFlowRuntime')) {
  errors.push('workspace foundation não consome o runtime adapter explícito');
}
if (!adapter.includes('useReactFlow')) {
  errors.push('adapter de estado/runtime não encapsula useReactFlow');
}
if (!adapter.includes('stageDropRuntime') || !adapter.includes('viewportRuntime')) {
  errors.push('adapter não fornece os runtimes neutros de drop e viewport');
}
if (wave01.includes('ui/hooks/use-canvas-workspace-foundation.ts')) {
  errors.push('allowlist da Wave 01 ainda autoriza XYFlow na workspace foundation');
}
if (!wave01.includes('react-flow/use-canvas-flow-state.ts')) {
  errors.push('allowlist da Wave 01 não reconhece o adapter explícito de runtime');
}

if (errors.length) {
  console.error('\nSO-011 REACT FLOW ISOLATION WAVE 08: FAIL\n');
  errors.forEach((error, index) => console.error(`${index + 1}. ${error}.`));
  process.exit(1);
}

console.log('PASS SO-011 React Flow Isolation Wave 08: useReactFlow is confined to the explicit React Flow runtime adapter while workspace foundation remains framework-neutral.');
