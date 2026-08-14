import { readdir, readFile } from 'node:fs/promises';

const directory = 'src/features/theory-of-change/canvas/ui/canvas-workspace';
const files = (await readdir(directory)).filter((name) => name.endsWith('.module.sass'));
const sources = await Promise.all(files.map(async (name) => readFile(`${directory}/${name}`, 'utf8')));
const source = sources.join('\n');
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
  missing.forEach((token, index) => console.error(`${index + 1}. ausente no conjunto modular: ${token}`));
  process.exit(1);
}
console.log('PASS: superfícies, cards, conexões e inspector permanecem protegidos no conjunto modular do Canvas.');
