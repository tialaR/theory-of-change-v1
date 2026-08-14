#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];
const featureRoot = 'src/features/theory-of-change/canvas';
const contractsFile = `${featureRoot}/react-flow/canvas-flow.contracts.ts`;
const actionsFile = `${featureRoot}/ui/hooks/use-canvas-workspace-flow-actions.ts`;
const wave01Gate = 'scripts/tdm-contract-v3/check-react-flow-isolation-wave01.mjs';

function read(file) {
  const absolute = path.join(root, file);
  if (!fs.existsSync(absolute)) {
    errors.push(`arquivo obrigatório ausente: ${file}`);
    return '';
  }
  return fs.readFileSync(absolute, 'utf8');
}

const contracts = read(contractsFile);
const actions = read(actionsFile);
const wave01 = read(wave01Gate);

if (!contracts.includes('export type CanvasConnectionCandidate')) {
  errors.push('CanvasConnectionCandidate não está formalizado como contrato neutro');
}
if (actions.includes('@xyflow/react')) {
  errors.push('workspace flow actions voltou a importar @xyflow/react');
}
if (actions.includes('NodeMouseHandler') || actions.includes('type Connection')) {
  errors.push('workspace flow actions voltou a depender de handlers ou conexões XYFlow');
}
if (!actions.includes("type MouseEvent") || !actions.includes("Pick<CanvasStageNode, 'id'>")) {
  errors.push('seleção de nó não usa o contrato mínimo independente do runtime XYFlow');
}
if (!actions.includes('connection: CanvasConnectionCandidate')) {
  errors.push('conexão da workspace não consome o contrato neutro');
}
if (wave01.includes('use-canvas-workspace-flow-actions.ts')) {
  errors.push('allowlist da Wave 01 ainda autoriza XYFlow nas ações da workspace');
}

if (errors.length) {
  console.error('\nSO-011 REACT FLOW ISOLATION WAVE 05: FAIL\n');
  errors.forEach((error, index) => console.error(`${index + 1}. ${error}.`));
  process.exit(1);
}

console.log('PASS SO-011 React Flow Isolation Wave 05: workspace selection and connection actions consume framework-neutral contracts without importing XYFlow handler types.');
