import fs from 'node:fs';

const file = 'src/features/theory-of-change/canvas/ui/canvas-workspace/canvas-workspace.module.sass';
const source = fs.readFileSync(file, 'utf8');
const invalid = source.match(/transparent\d+%/g) ?? [];
if (invalid.length > 0) {
  console.error('\nTDM VISUAL FOUNDATION SASS: FAIL\n');
  invalid.forEach((value, index) => console.error(`${index + 1}. token Sass inválido: ${value}`));
  process.exit(1);
}
if (!source.includes('transparent 34%')) {
  console.error('\nTDM VISUAL FOUNDATION SASS: FAIL\n\n1. parada do gradiente principal não foi corrigida.');
  process.exit(1);
}
console.log('PASS: sintaxe crítica dos gradientes da fundação visual está protegida.');
