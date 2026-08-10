import fs from 'node:fs';
import path from 'node:path';

const roots = [
  'src/features/theory-of-change/components/sidebar',
  'src/features/theory-of-change/canvas/ui/canvas-workspace'
];
const entrypoints = [
  'src/features/theory-of-change/components/sidebar/tdm-sidebar.module.sass',
  'src/features/theory-of-change/canvas/ui/canvas-workspace/canvas-workspace.module.sass'
];
const failures = [];
const sassFiles = [];
for (const root of roots) {
  for (const name of fs.readdirSync(root)) {
    if (name.endsWith('.module.scss') || name.endsWith('.scss')) failures.push(`SCSS proibido: ${path.join(root, name)}`);
    if (name.endsWith('.module.sass')) sassFiles.push(path.join(root, name));
  }
}
for (const file of sassFiles) {
  const source = fs.readFileSync(file, 'utf8');
  const lines = source.split(/\r?\n/).length - 1;
  if (source.includes('@import ')) failures.push(`@import depreciado: ${file}`);
  if (lines > 240) failures.push(`módulo excede 240 linhas (${lines}): ${file}`);
}
for (const file of entrypoints) {
  const source = fs.readFileSync(file, 'utf8');
  const lines = source.split(/\r?\n/).length - 1;
  if (!source.includes("@use 'sass:meta'")) failures.push(`entrypoint sem sass:meta: ${file}`);
  if (!source.includes('meta.load-css')) failures.push(`entrypoint sem load-css: ${file}`);
  if (lines > 80) failures.push(`entrypoint excede 80 linhas (${lines}): ${file}`);
}
if (failures.length) {
  console.error('\nTDM SASS GOD SPLIT WAVE 04: FAIL\n');
  failures.forEach((failure, index) => console.error(`${index + 1}. ${failure}`));
  process.exit(1);
}
console.log('PASS: God Sidebar e Sass Module Gods morreram; ownership leaves e entrypoints permanecem dentro do budget.');
