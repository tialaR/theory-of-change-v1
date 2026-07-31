#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];
const featureRoot = 'src/features/theory-of-change/canvas';
const retiredToken = ['re', 'send'].join('');

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function lines(relativePath) {
  return read(relativePath).split('\n').length;
}

function requireCondition(condition, message) {
  if (!condition) errors.push(message);
}

const requiredFiles = [
  'src/app/canvas/page.tsx',
  'src/app/canvas/layout.tsx',
  `${featureRoot}/canvas-page.tsx`,
  `${featureRoot}/ui/canvas-workspace/canvas-client-entry.tsx`,
  `${featureRoot}/ui/canvas-workspace/canvas-workspace.tsx`,
  `${featureRoot}/ui/components/canvas-flow-surface.tsx`,
  `${featureRoot}/ui/components/canvas-stage-node.tsx`,
  `${featureRoot}/ui/components/canvas-causal-edge.tsx`,
  `${featureRoot}/ui/hooks/use-canvas-flow-controller.ts`,
  `${featureRoot}/domain/canvas-connection-policy.ts`,
  `${featureRoot}/server/save-canvas-project.action.ts`,
  `${featureRoot}/ui/canvas-result/canvas-result-view.tsx`
];
requiredFiles.forEach((file) => requireCondition(exists(file), `arquivo React Flow obrigatório ausente: ${file}`));

const forbiddenPaths = [
  'src/app/canvas/canvas-workspace.tsx',
  'src/app/canvas/canvas-workspace.module.sass',
  'src/app/canvas/canvas-workspace.model.ts',
  'src/app/canvas/canvas-workspace.icons.tsx',
  'src/app/canvas/use-canvas-flow-state.ts',
  'src/app/canvas/use-canvas-project-persistence.ts',
  'src/features/theory-of-change/canvas-workspace',
  'src/features/theory-of-change/components/canvas-resultado',
  'src/app/canvas-v4'
];
for (const relativePath of forbiddenPaths) {
  requireCondition(!exists(relativePath), `renderer ou estrutura anterior ainda existe: ${relativePath}`);
}

if (exists('src/app/canvas/page.tsx')) {
  const source = read('src/app/canvas/page.tsx');
  requireCondition(!source.includes("'use client'"), 'page.tsx do Canvas não pode ser Client Component');
  requireCondition(source.includes("@/features/theory-of-change/canvas"), 'page.tsx deve compor a feature pelo índice público');
  requireCondition(lines('src/app/canvas/page.tsx') <= 8, 'app/canvas/page.tsx deixou de ser fino');
}

if (exists(`${featureRoot}/canvas-page.tsx`)) {
  const source = read(`${featureRoot}/canvas-page.tsx`);
  requireCondition(!source.includes("'use client'"), 'CanvasPage deve permanecer Server Component');
  requireCondition(source.includes('<Suspense'), 'CanvasPage precisa de Suspense significativo');
}

if (exists(`${featureRoot}/ui/canvas-workspace/canvas-client-entry.tsx`)) {
  const source = read(`${featureRoot}/ui/canvas-workspace/canvas-client-entry.tsx`);
  requireCondition(source.includes("dynamic("), 'fronteira client precisa carregar o motor pesado dinamicamente');
  requireCondition(source.includes('ssr: false'), 'React Flow deve ficar isolado na fronteira client');
}

if (exists(`${featureRoot}/ui/components/canvas-flow-surface.tsx`)) {
  const source = read(`${featureRoot}/ui/components/canvas-flow-surface.tsx`);
  requireCondition(source.includes('<ReactFlow'), 'Canvas oficial não renderiza <ReactFlow />');
  requireCondition(source.includes('nodeTypes={nodeTypes}'), 'custom nodes não estão registrados no React Flow');
  requireCondition(source.includes('edgeTypes={edgeTypes}'), 'custom edges não estão registrados no React Flow');
  requireCondition(source.includes('onNodesChange='), 'mudanças de nós não estão sob React Flow');
  requireCondition(source.includes('onEdgesChange='), 'mudanças de edges não estão sob React Flow');
  requireCondition(!source.includes('<svg'), 'renderer manual de conexões voltou ao Canvas');
}

if (exists(`${featureRoot}/ui/components/canvas-stage-node.tsx`)) {
  const source = read(`${featureRoot}/ui/components/canvas-stage-node.tsx`);
  requireCondition(source.includes('<Handle'), 'custom node não possui Handles reais');
  requireCondition(source.includes('type="source"'), 'custom node não possui Handle source');
  requireCondition(source.includes('type="target"'), 'custom node não possui Handle target');
}

if (exists(`${featureRoot}/ui/components/canvas-causal-edge.tsx`)) {
  const source = read(`${featureRoot}/ui/components/canvas-causal-edge.tsx`);
  requireCondition(source.includes('<BaseEdge'), 'custom edge não usa BaseEdge');
  requireCondition(source.includes('<EdgeLabelRenderer'), 'custom edge não ancora ações via EdgeLabelRenderer');
  requireCondition(source.includes('getBezierPath'), 'curva causal não usa path oficial do React Flow');
}

if (exists(`${featureRoot}/ui/hooks/use-canvas-flow-controller.ts`)) {
  const source = read(`${featureRoot}/ui/hooks/use-canvas-flow-controller.ts`);
  requireCondition(source.includes('useNodesState'), 'estado de nós não pertence ao React Flow');
  requireCondition(source.includes('useEdgesState'), 'estado de edges não pertence ao React Flow');
  requireCondition(source.includes('evaluateCanvasConnection'), 'conexões não consomem a política única de domínio');
  requireCondition(!source.includes('allowedRelation'), 'regra causal duplicada detectada');
  requireCondition(!source.includes('canConnect'), 'regra causal local duplicada detectada');
}

const sourceFiles = [];
function collect(current) {
  for (const entry of fs.readdirSync(path.join(root, current), { withFileTypes: true })) {
    const relative = path.join(current, entry.name);
    if (entry.isDirectory()) collect(relative);
    if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) sourceFiles.push(relative);
  }
}
if (exists(featureRoot)) collect(featureRoot);

for (const file of sourceFiles) {
  const lineCount = lines(file);
  if (file.endsWith('.test.ts') || file.endsWith('.test.tsx') || file.endsWith('.e2e.ts')) continue;
  const isHook = file.includes('/hooks/');
  const threshold = isHook ? 360 : 260;
  requireCondition(lineCount <= threshold, `arquivo excede limite anti-God (${lineCount}/${threshold}): ${file}`);
}

const combinedSource = sourceFiles.map(read).join('\n');
for (const forbidden of [
  'localStorage',
  'sessionStorage',
  'window.location',
  `${retiredToken}-command-preview-v2`,
  'canvas-v4',
  'allowedRelation(',
  'canConnect('
]) {
  requireCondition(!combinedSource.includes(forbidden), `implementação proibida no Canvas: ${forbidden}`);
}

if (errors.length) {
  console.error('\nTDM REACT FLOW CONTRACT: FAIL\n');
  errors.forEach((error, index) => console.error(`${index + 1}. ${error}.`));
  process.exit(1);
}

console.log('PASS: React Flow real, domínio único e limites anti-God íntegros.');
