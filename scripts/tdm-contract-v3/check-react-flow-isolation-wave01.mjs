#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];
const featureRoot = 'src/features/theory-of-change/canvas';
const xyflowImport = /from\s+['"]@xyflow\/react(?:\/[^'"]*)?['"]|import\s+['"]@xyflow\/react(?:\/[^'"]*)?['"]/;

const allowedImporters = new Set([
  'src/app/canvas/layout.tsx',
  `${featureRoot}/react-flow/canvas-flow.types.ts`,
  `${featureRoot}/react-flow/canvas-flow-provider.tsx`,
  `${featureRoot}/ui/components/canvas-connection-line.tsx`,
  `${featureRoot}/ui/components/canvas-causal-edge.tsx`,
  `${featureRoot}/ui/components/canvas-flow-surface.tsx`,
  `${featureRoot}/ui/components/canvas-stage-node.tsx`,
  `${featureRoot}/react-flow/use-canvas-flow-state.ts`,
]);

function walk(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) return [];
  return fs.readdirSync(absolutePath, { withFileTypes: true }).flatMap((entry) => {
    const child = path.join(relativePath, entry.name);
    if (entry.isDirectory()) return walk(child);
    return /\.(ts|tsx)$/.test(entry.name) ? [child] : [];
  });
}

const sourceFiles = [...walk('src/app/canvas'), ...walk(featureRoot)];
const actualImporters = sourceFiles.filter((file) => xyflowImport.test(fs.readFileSync(path.join(root, file), 'utf8')));

for (const file of actualImporters) {
  if (!allowedImporters.has(file)) errors.push(`novo importador de @xyflow/react fora da fronteira permitida: ${file}`);
}
for (const file of allowedImporters) {
  if (!fs.existsSync(path.join(root, file))) errors.push(`arquivo permitido de React Flow ausente: ${file}`);
}

for (const forbiddenRoot of [
  `${featureRoot}/domain`,
  `${featureRoot}/application`,
  `${featureRoot}/infrastructure`,
  `${featureRoot}/server`
]) {
  for (const file of walk(forbiddenRoot)) {
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    if (xyflowImport.test(source)) errors.push(`camada framework-neutral importando @xyflow/react: ${file}`);
  }
}

const typeContract = path.join(root, `${featureRoot}/react-flow/canvas-flow.types.ts`);
if (!fs.existsSync(typeContract)) errors.push('contrato React Flow ausente em react-flow/canvas-flow.types.ts');
const adapter = path.join(root, `${featureRoot}/react-flow/canvas-react-flow.adapter.ts`);
if (!fs.existsSync(adapter)) errors.push('adapter React Flow ausente em react-flow/canvas-react-flow.adapter.ts');

if (errors.length) {
  console.error('\nSO-011 REACT FLOW ISOLATION WAVE 01: FAIL\n');
  errors.forEach((error, index) => console.error(`${index + 1}. ${error}.`));
  process.exit(1);
}

console.log(`PASS SO-011 React Flow Isolation Wave 01: @xyflow/react imports are frozen to ${actualImporters.length} approved adapter/UI boundary files and forbidden from Domain, Application, Infrastructure and Server.`);
