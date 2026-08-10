import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const base = path.join(root, 'src/features/theory-of-change/components/canvas');
const facade = path.join(base, 'tdm-canvas-view-model.ts');
const modules = [
  'tdm-canvas-view-model/canvas-flow-nodes.ts',
  'tdm-canvas-view-model/canvas-flow-edges.ts',
  'tdm-canvas-view-model/sidebar-block-forms.ts',
  'tdm-canvas-view-model/sidebar-context.ts'
];
const failures = [];
if (!fs.existsSync(facade)) failures.push('facade tdm-canvas-view-model.ts ausente');
for (const rel of modules) if (!fs.existsSync(path.join(base, rel))) failures.push(`módulo ausente: ${rel}`);
if (fs.existsSync(facade)) {
  const lines = fs.readFileSync(facade, 'utf8').trim().split(/\r?\n/).length;
  if (lines > 12) failures.push(`facade excede 12 linhas (${lines})`);
  const source = fs.readFileSync(facade, 'utf8');
  for (const forbidden of ['nodes.map(', 'edges.map(', "kind: 'marker'", 'creationDrafts[stage]']) {
    if (source.includes(forbidden)) failures.push(`facade reteve responsabilidade: ${forbidden}`);
  }
}
for (const rel of modules) {
  const file = path.join(base, rel);
  if (!fs.existsSync(file)) continue;
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/).length;
  if (lines > 120) failures.push(`${rel} excede 120 linhas (${lines})`);
}
if (failures.length) {
  console.error('\nTDM COMPONENT GOD SLAYER WAVE 06: FAIL\n');
  failures.forEach((item, index) => console.error(`${index + 1}. ${item}`));
  process.exit(1);
}
console.log('PASS: ViewModel do Canvas foi separado em adapters de nodes, edges, formulários e contexto.');
