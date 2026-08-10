#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { assertRegisteredProgression } from './state-progression.mjs';

const root = process.cwd();
const errors = [];
const gates = [
  'wave01',
  'wave02',
  'wave03',
  'wave04',
  'wave05',
  'wave06',
  'wave07',
  'wave08',
  'wave08-hotfix',
  'wave08-hotfix2',
].map((name) => `scripts/tdm-contract-v3/check-react-flow-isolation-${name}.mjs`);

for (const gate of gates) {
  const absolute = path.join(root, gate);
  if (!fs.existsSync(absolute)) {
    errors.push(`gate ausente: ${gate}`);
    continue;
  }
  const result = spawnSync(process.execPath, [gate], { cwd: root, encoding: 'utf8' });
  if (result.status !== 0) {
    process.stdout.write(result.stdout || '');
    process.stderr.write(result.stderr || '');
    errors.push(`gate falhou: ${gate}`);
  }
}

const featureRoot = 'src/features/theory-of-change/canvas';
const xyflowImport = /from\s+['"]@xyflow\/react(?:\/[^'"]*)?['"]|import\s+['"]@xyflow\/react(?:\/[^'"]*)?['"]/;
const approvedImporters = new Set([
  'src/app/canvas/layout.tsx',
  `${featureRoot}/react-flow/canvas-flow.types.ts`,
  `${featureRoot}/react-flow/canvas-flow-provider.tsx`,
  `${featureRoot}/react-flow/use-canvas-flow-state.ts`,
  `${featureRoot}/ui/components/canvas-connection-line.tsx`,
  `${featureRoot}/ui/components/canvas-causal-edge.tsx`,
  `${featureRoot}/ui/components/canvas-flow-surface.tsx`,
  `${featureRoot}/ui/components/canvas-stage-node.tsx`,
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

const officialFiles = [...walk('src/app/canvas'), ...walk(featureRoot)];
const actualImporters = officialFiles.filter((file) => xyflowImport.test(fs.readFileSync(path.join(root, file), 'utf8')));
for (const file of actualImporters) {
  if (!approvedImporters.has(file)) errors.push(`importador XYFlow fora da fronteira oficial: ${file}`);
}
for (const file of approvedImporters) {
  if (!actualImporters.includes(file)) errors.push(`importador XYFlow aprovado ausente ou sem import: ${file}`);
}
if (actualImporters.length !== approvedImporters.size) {
  errors.push(`superficie XYFlow oficial esperada: ${approvedImporters.size}; encontrada: ${actualImporters.length}`);
}

for (const forbiddenRoot of [
  `${featureRoot}/domain`,
  `${featureRoot}/application`,
  `${featureRoot}/infrastructure`,
  `${featureRoot}/server`,
]) {
  for (const file of walk(forbiddenRoot)) {
    if (xyflowImport.test(fs.readFileSync(path.join(root, file), 'utf8'))) {
      errors.push(`camada framework-neutral importando XYFlow: ${file}`);
    }
  }
}

const requiredOwners = [
  `${featureRoot}/react-flow/canvas-flow.types.ts`,
  `${featureRoot}/react-flow/canvas-react-flow.adapter.ts`,
  `${featureRoot}/react-flow/canvas-flow-provider.tsx`,
  `${featureRoot}/react-flow/use-canvas-flow-state.ts`,
  `${featureRoot}/react-flow/canvas-flow.contracts.ts`,
];
for (const file of requiredOwners) {
  if (!fs.existsSync(path.join(root, file))) errors.push(`owner de fronteira ausente: ${file}`);
}

const neutralFiles = [
  `${featureRoot}/ui/hooks/use-canvas-workspace-foundation.ts`,
  `${featureRoot}/ui/hooks/use-canvas-flow-controller.ts`,
  `${featureRoot}/ui/hooks/use-canvas-workspace-flow-actions.ts`,
  `${featureRoot}/ui/hooks/use-canvas-stage-drag-and-drop.ts`,
  `${featureRoot}/ui/hooks/use-canvas-viewport-actions.ts`,
];
for (const file of neutralFiles) {
  const absolute = path.join(root, file);
  if (!fs.existsSync(absolute)) {
    errors.push(`consumidor neutro ausente: ${file}`);
    continue;
  }
  const source = fs.readFileSync(absolute, 'utf8');
  if (xyflowImport.test(source)) errors.push(`consumidor neutro voltou a importar XYFlow: ${file}`);
  if (/\bReactFlowInstance\b|\buseReactFlow\b|\bReactFlowProvider\b/.test(source)) {
    errors.push(`API concreta do React Flow vazou para consumidor neutro: ${file}`);
  }
}

const adr = 'docs/architecture/adr/ADR-007-react-flow-isolation.md';
if (!fs.existsSync(path.join(root, adr))) errors.push(`ADR de closeout ausente: ${adr}`);
const handoff = 'docs/sharkops/HANDOFF.md';
if (!fs.existsSync(path.join(root, handoff))) errors.push(`handoff ausente: ${handoff}`);

const state = JSON.parse(fs.readFileSync(path.join(root, '.sharkops/state/current-state.json'), 'utf8'));
const ledger = JSON.parse(fs.readFileSync(path.join(root, '.sharkops/state/bite-ledger.json'), 'utf8'));
const bite = ledger.bites.find((item) => item.id === 'SO-011');
if (!bite || bite.status !== 'COMPLETE' || !bite.completedAt) errors.push('SO-011 nao esta COMPLETE no Bite Ledger');
const atCloseout = state.activeBite === 'SO-011 | React Flow Isolation'
  && state.activeBiteStatus === 'COMPLETE'
  && [
    'SO-011 | React Flow Isolation Closeout',
    'SO-011 | React Flow Isolation Closeout Compatibility Hotfix',
  ].includes(state.lastBite)
  && state.nextBite === 'SO-012 | Canvas Engine Audit';
const registeredProgression = assertRegisteredProgression({
  state,
  ledger,
  minimumBite: 12,
  completedBites: ['SO-011'],
});
if (!atCloseout && !registeredProgression) {
  errors.push('Current State perdeu o closeout do SO-011 ou uma progressao downstream registrada');
}

if (errors.length) {
  console.error('\nSO-011 REACT FLOW ISOLATION CLOSEOUT: FAIL\n');
  errors.forEach((error, index) => console.error(`${index + 1}. ${error}.`));
  process.exit(1);
}

console.log(`PASS SO-011 React Flow Isolation Closeout: ${actualImporters.length} importadores XYFlow oficiais permanecem confinados a adapters/render boundaries, todas as waves estao agregadas e o handoff para SO-012 esta protegido.`);
