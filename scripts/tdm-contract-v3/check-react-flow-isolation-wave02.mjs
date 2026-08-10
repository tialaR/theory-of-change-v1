#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];
const featureRoot = 'src/features/theory-of-change/canvas';
const contractsFile = `${featureRoot}/react-flow/canvas-flow.contracts.ts`;
const nodeCommands = `${featureRoot}/ui/hooks/canvas-flow/use-canvas-node-commands.ts`;
const edgeCommands = `${featureRoot}/ui/hooks/canvas-flow/use-canvas-edge-commands.ts`;
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
const nodeSource = read(nodeCommands);
const edgeSource = read(edgeCommands);

if (xyflowImport.test(contracts)) errors.push('contratos neutros importam @xyflow/react');
if (!contracts.includes('export type CanvasFlowPosition')) errors.push('CanvasFlowPosition não está formalizado');
if (!contracts.includes('export type CanvasConnectionCandidate')) errors.push('CanvasConnectionCandidate não está formalizado');
if (xyflowImport.test(nodeSource)) errors.push('use-canvas-node-commands voltou a importar @xyflow/react');
if (xyflowImport.test(edgeSource)) errors.push('use-canvas-edge-commands voltou a importar @xyflow/react');
if (!nodeSource.includes("from '../../../react-flow/canvas-flow.contracts'")) errors.push('comandos de nó não consomem o contrato neutro');
if (!edgeSource.includes("from '../../../react-flow/canvas-flow.contracts'")) errors.push('comandos de conexão não consomem o contrato neutro');
if (!nodeSource.includes('position: CanvasFlowPosition')) errors.push('criação de nó não está protegida por CanvasFlowPosition');
if (!edgeSource.includes('connection: CanvasConnectionCandidate')) errors.push('criação de conexão não está protegida por CanvasConnectionCandidate');

if (errors.length) {
  console.error('\nSO-011 REACT FLOW ISOLATION WAVE 02: FAIL\n');
  errors.forEach((error, index) => console.error(`${index + 1}. ${error}.`));
  process.exit(1);
}

console.log('PASS SO-011 React Flow Isolation Wave 02: leaf canvas commands consume framework-neutral position and connection contracts without importing XYFlow.');
