import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const fail = [];
const kernelFile = 'src/features/theory-of-change/canvas/engine/canvas-engine-state.ts';
const kernelTestFile = 'src/features/theory-of-change/canvas/engine/canvas-engine-state.test.ts';
const historyFile = 'src/features/theory-of-change/canvas/ui/hooks/canvas-flow/use-canvas-flow-history.ts';
const historyKernelFile = 'src/features/theory-of-change/canvas/engine/canvas-engine-history.ts';

for (const file of [kernelFile, kernelTestFile, historyFile]) {
  if (!fs.existsSync(path.join(root, file))) fail.push(`arquivo obrigatorio ausente: ${file}`);
}

if (fail.length === 0) {
  const kernel = read(kernelFile);
  const history = read(historyFile);
  const forbidden = ['react', '@xyflow/react', '/ui/', '/react-flow/', '/application/', '/infrastructure/', '/server/'];

  if (!kernel.includes('export type CanvasEngineState')) fail.push('kernel nao publica CanvasEngineState.');
  if (!kernel.includes('cloneCanvasEngineState')) fail.push('kernel nao publica clonagem isolada.');
  if (!kernel.includes('appendCanvasEngineHistory')) fail.push('kernel nao controla a janela de historico.');
  for (const fragment of forbidden) {
    if (kernel.includes(fragment)) fail.push(`kernel importa ou referencia responsabilidade proibida: ${fragment}`);
  }

  const directStateConsumption = history.includes("../../../engine/canvas-engine")
    && history.includes('appendCanvasEngineHistory');
  const downstreamHistoryKernel = fs.existsSync(path.join(root, historyKernelFile))
    && history.includes("../../../engine/canvas-engine")
    && read(historyKernelFile).includes("'./canvas-engine-state'")
    && read(historyKernelFile).includes('appendCanvasEngineHistory');

  if (!directStateConsumption && !downstreamHistoryKernel) {
    fail.push('historico nao consome o state kernel diretamente nem por history kernel downstream protegido.');
  }
  if (history.includes('structuredClone(')) fail.push('historico da UI voltou a possuir clonagem de estado.');
}

if (fail.length) {
  console.error('\nSO-012 CANVAS ENGINE WAVE 02: FAIL\n');
  fail.forEach((message, index) => console.error(`${index + 1}. ${message}`));
  process.exit(1);
}

console.log('PASS SO-012 Canvas Engine Wave 02: state snapshots and bounded history are owned by a framework-neutral engine kernel.');
