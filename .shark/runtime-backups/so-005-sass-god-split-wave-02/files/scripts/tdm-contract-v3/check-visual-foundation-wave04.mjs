import { readFile } from 'node:fs/promises';

const file = 'src/features/theory-of-change/canvas/ui/canvas-workspace/canvas-workspace.module.sass';
const source = await readFile(file, 'utf8');
const required = [
  'Visual Foundation Wave 04',
  '.topbar',
  '.rail',
  '.stageGuide',
  '.node',
  '.inspector',
  'stroke-linecap: round'
];
const missing = required.filter((token) => !source.includes(token));
if (missing.length) {
  console.error('\nTDM VISUAL FOUNDATION WAVE 04: FAIL\n');
  missing.forEach((token, index) => console.error(`${index + 1}. ausente: ${token}`));
  process.exit(1);
}
console.log('PASS: superfícies, cards, conexões e inspector receberam acabamento visual final em Sass Module.');
