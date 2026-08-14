import fs from 'node:fs';
import path from 'node:path';

const target = path.resolve('src/features/theory-of-change/components/canvas/tdm-canvas-workspace-composition.tsx');
const source = fs.readFileSync(target, 'utf8');
const failures = [];

const selectedNodeDeclarations = source.match(/\bconst\s+selectedNode\b/g) ?? [];
const selectedEdgeDeclarations = source.match(/\bconst\s+selectedEdge\b/g) ?? [];

if (selectedNodeDeclarations.length > 0) {
  failures.push('workspace composition redeclara selectedNode fora do owner de estado');
}
if (selectedEdgeDeclarations.length > 0) {
  failures.push('workspace composition redeclara selectedEdge fora do owner de estado');
}
if (/\buseMemo\s*\(/.test(source)) {
  failures.push('workspace composition recria selecao derivada com useMemo');
}
if (!/selectedNode, selectedEdge, fitView, screenToFlowPosition/.test(source)) {
  failures.push('workspace state nao entrega selectedNode e selectedEdge pelo contrato oficial');
}

if (failures.length) {
  console.error('\nTDM COMPONENT GOD SLAYER WAVE 14 HOTFIX: FAIL\n');
  failures.forEach((failure, index) => console.error(`${index + 1}. ${failure}`));
  process.exit(1);
}

console.log('PASS: selectedNode e selectedEdge possuem ownership unico no workspace state; composicao nao redeclara selecao derivada.');
