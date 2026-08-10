import fs from 'node:fs';

const file = 'src/features/theory-of-change/canvas/ui/canvas-workspace/canvas-workspace.module.sass';
const source = fs.readFileSync(file, 'utf8');
const errors = [];

if (/background:\s*\n\s+(?:radial|linear)-gradient\(/.test(source)) {
  errors.push('background com gradiente multilinha permanece incompatível com Sass indented.');
}
if (/transparent(?:30|34)%/.test(source)) {
  errors.push('stop de gradiente sem espaço permanece no arquivo.');
}
const required = [
  'background: radial-gradient(circle at 18% -8%',
  'background: radial-gradient(circle at 42% 38%',
  'background: linear-gradient(180deg, color-mix(in srgb, var(--stage-color) 3.5%'
];
for (const token of required) {
  if (!source.includes(token)) errors.push(`declaração visual ausente: ${token}`);
}

if (errors.length) {
  console.error('\nTDM VISUAL FOUNDATION SASS V1.2: FAIL\n');
  errors.forEach((error, index) => console.error(`${index + 1}. ${error}`));
  process.exit(1);
}
console.log('PASS: gradientes da fundação visual usam declarações compatíveis com Sass indented.');
