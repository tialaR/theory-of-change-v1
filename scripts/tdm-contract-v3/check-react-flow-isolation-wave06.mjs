#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];
const featureRoot = 'src/features/theory-of-change/canvas';
const controllerFile = `${featureRoot}/ui/hooks/use-canvas-flow-controller.ts`;
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

const controller = read(controllerFile);
const adapter = read(adapterFile);
const wave01 = read(wave01Gate);

if (controller.includes('@xyflow/react')) {
  errors.push('flow controller voltou a importar @xyflow/react');
}
if (controller.includes('useNodesState') || controller.includes('useEdgesState')) {
  errors.push('flow controller voltou a possuir hooks de estado XYFlow');
}
if (!controller.includes("useCanvasFlowState")) {
  errors.push('flow controller não consome o adapter explícito de estado');
}
if (!adapter.includes("from '@xyflow/react'")) {
  errors.push('adapter de estado não possui a integração explícita com XYFlow');
}
if (!adapter.includes('useNodesState') || !adapter.includes('useEdgesState')) {
  errors.push('adapter de estado não encapsula os hooks de nós e conexões');
}
if (wave01.includes('ui/hooks/use-canvas-flow-controller.ts')) {
  errors.push('allowlist da Wave 01 ainda autoriza XYFlow no flow controller');
}
if (!wave01.includes('react-flow/use-canvas-flow-state.ts')) {
  errors.push('allowlist da Wave 01 não reconhece o adapter explícito de estado');
}

if (errors.length) {
  console.error('\nSO-011 REACT FLOW ISOLATION WAVE 06: FAIL\n');
  errors.forEach((error, index) => console.error(`${index + 1}. ${error}.`));
  process.exit(1);
}

console.log('PASS SO-011 React Flow Isolation Wave 06: XYFlow state hooks are confined to an explicit React Flow adapter while the flow controller remains framework-neutral.');
