#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];
const featureRoot = 'src/features/theory-of-change/canvas';
const workspaceFile = `${featureRoot}/ui/canvas-workspace/canvas-workspace.tsx`;
const providerFile = `${featureRoot}/react-flow/canvas-flow-provider.tsx`;
const wave01Gate = 'scripts/tdm-contract-v3/check-react-flow-isolation-wave01.mjs';

function read(file) {
  const absolute = path.join(root, file);
  if (!fs.existsSync(absolute)) {
    errors.push(`arquivo obrigatório ausente: ${file}`);
    return '';
  }
  return fs.readFileSync(absolute, 'utf8');
}

const workspace = read(workspaceFile);
const provider = read(providerFile);
const wave01 = read(wave01Gate);

if (workspace.includes('@xyflow/react')) {
  errors.push('workspace voltou a importar @xyflow/react diretamente');
}
if (!workspace.includes("CanvasFlowProvider")) {
  errors.push('workspace não consome o provider explícito da fronteira React Flow');
}
if (!provider.includes("from '@xyflow/react'")) {
  errors.push('provider explícito não possui integração com XYFlow');
}
if (!provider.includes('ReactFlowProvider')) {
  errors.push('provider explícito não encapsula ReactFlowProvider');
}
if (wave01.includes('ui/canvas-workspace/canvas-workspace.tsx')) {
  errors.push('allowlist da Wave 01 ainda autoriza XYFlow diretamente na workspace');
}
if (!wave01.includes('react-flow/canvas-flow-provider.tsx')) {
  errors.push('allowlist da Wave 01 não reconhece o provider explícito');
}

if (errors.length) {
  console.error('\nSO-011 REACT FLOW ISOLATION WAVE 07: FAIL\n');
  errors.forEach((error, index) => console.error(`${index + 1}. ${error}.`));
  process.exit(1);
}

console.log('PASS SO-011 React Flow Isolation Wave 07: ReactFlowProvider is confined to an explicit adapter while the workspace remains framework-neutral.');
