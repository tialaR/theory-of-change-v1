import fs from 'node:fs';

const file = 'src/features/theory-of-change/components/sidebar/sidebar-form-shortcut-refinements.module.sass';
const source = fs.readFileSync(file, 'utf8');
const required = [
  '$text-muted: rgba(190, 193, 204, 0.54)',
  '$text-faint: rgba(180, 184, 194, 0.38)'
];
const missing = required.filter((token) => !source.includes(token));
if (missing.length) {
  console.error('\nTDM SASS MODULE SCOPE HOTFIX: FAIL\n');
  for (const token of missing) console.error(`1. variável local ausente: ${token}`);
  process.exit(1);
}
if (source.includes('@import')) {
  console.error('\nTDM SASS MODULE SCOPE HOTFIX: FAIL\n\n1. @import depreciado detectado.');
  process.exit(1);
}
console.log('PASS: variáveis visuais do módulo de atalhos pertencem ao próprio módulo; nenhum vazamento de escopo Sass permanece.');
