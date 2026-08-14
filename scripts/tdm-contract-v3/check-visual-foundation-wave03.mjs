import fs from 'node:fs';
import path from 'node:path';
const file = path.join(process.cwd(), 'src/features/theory-of-change/canvas/ui/canvas-workspace/canvas-workspace.module.sass');
const source = fs.readFileSync(file, 'utf8');
const required = ['grid-template-rows: 4.75rem minmax(0, 1fr)','left: 9rem','width: 15.5rem','font-size: 1.02rem','line-height: 1.55','bottom: 1.5rem'];
const errors = required.filter((token) => !source.includes(token));
if (errors.length) {
  console.error('\nTDM VISUAL FOUNDATION WAVE 03: FAIL\n');
  errors.forEach((token, index) => console.error(`${index + 1}. contrato visual ausente: ${token}`));
  process.exit(1);
}
console.log('PASS: hierarquia, ritmo e leitura do Canvas refinados em Sass Module.');
