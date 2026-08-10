import { readFileSync } from 'node:fs';

const file = 'src/features/theory-of-change/components/sidebar/sidebar-form-shortcut-refinements.module.sass';
const source = readFileSync(file, 'utf8');
const required = [
  '$text: rgba(248, 248, 250, 0.94)',
  '$text-muted: rgba(190, 193, 204, 0.54)',
  '$text-faint: rgba(180, 184, 194, 0.38)'
];
const missing = required.filter((token) => !source.includes(token));
if (missing.length) {
  console.error('TDM SASS MODULE SCOPE WAVE 03 V1.3: FAIL');
  for (const token of missing) console.error(`- variável local ausente: ${token}`);
  process.exit(1);
}
console.log('PASS: módulo de atalhos possui ownership local completo de text, text-muted e text-faint.');
