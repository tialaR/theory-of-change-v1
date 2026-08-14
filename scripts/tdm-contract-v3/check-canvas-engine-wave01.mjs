import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const fail = [];

const contractFile = 'src/features/theory-of-change/canvas/engine/canvas-engine.contracts.ts';
const controllerFile = 'src/features/theory-of-change/canvas/ui/hooks/use-canvas-flow-controller.ts';
const nodeCommandsFile = 'src/features/theory-of-change/canvas/ui/hooks/canvas-flow/use-canvas-node-commands.ts';
const copyFile = 'src/features/theory-of-change/canvas/ui/canvas-copy.ts';

for (const file of [contractFile, controllerFile, nodeCommandsFile, copyFile]) {
  if (!fs.existsSync(path.join(root, file))) fail.push(`arquivo obrigatorio ausente: ${file}`);
}

if (fail.length === 0) {
  const contract = read(contractFile);
  const controller = read(controllerFile);
  const nodeCommands = read(nodeCommandsFile);
  const copy = read(copyFile);

  if (!contract.includes('export type CanvasStageCopy')) fail.push('contrato neutro CanvasStageCopy nao pertence a engine.');
  if (!controller.includes("../../engine/canvas-engine")) fail.push('flow controller nao consome o contrato neutro da engine.');
  if (!nodeCommands.includes("../../../engine/canvas-engine")) fail.push('node commands nao consome o contrato neutro da engine.');
  if (controller.includes("../canvas-copy")) fail.push('flow controller voltou a depender da UI copy.');
  if (nodeCommands.includes("../../canvas-copy")) fail.push('node commands voltou a depender da UI copy.');
  if (!copy.includes("export type { CanvasStageCopy } from '../engine/canvas-engine'")) fail.push('UI copy nao preserva a facade publica do contrato.');
}

const engineCore = [
  controllerFile,
  'src/features/theory-of-change/canvas/ui/hooks/canvas-flow/types.ts',
  'src/features/theory-of-change/canvas/ui/hooks/canvas-flow/use-canvas-edge-commands.ts',
  'src/features/theory-of-change/canvas/ui/hooks/canvas-flow/use-canvas-flow-history.ts',
  'src/features/theory-of-change/canvas/ui/hooks/canvas-flow/use-canvas-layout-commands.ts',
  nodeCommandsFile
];

const forbiddenFragments = [
  '/components/',
  'use-canvas-save-controller',
  'use-canvas-project-persistence',
  'use-canvas-workspace-',
  'use-canvas-ui-state',
  'use-canvas-workspace-effects',
  'next/',
  '../../server/',
  '../../infrastructure/'
];

for (const file of engineCore) {
  const source = read(file);
  for (const fragment of forbiddenFragments) {
    if (source.includes(fragment)) fail.push(`${file} importa responsabilidade proibida da engine: ${fragment}`);
  }
}

if (fail.length) {
  console.error('\nSO-012 CANVAS ENGINE WAVE 01: FAIL\n');
  fail.forEach((message, index) => console.error(`${index + 1}. ${message}`));
  process.exit(1);
}

console.log('PASS SO-012 Canvas Engine Wave 01: engine copy contracts are framework-neutral, UI compatibility is preserved and orchestration imports are boundary-armored.');
