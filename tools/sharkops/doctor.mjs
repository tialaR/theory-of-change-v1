import { exists } from './core/io.mjs';
import { heading, pass, fail, ui } from './core/ui.mjs';
const checks = [
  ['package.json', 'package.json'],
  ['SharkOps config', '.sharkops/project.json'],
  ['SharkOps state', '.sharkops/state/current-state.json'],
  ['SharkOps docs', 'docs/sharkops/SHARKOPS.md'],
  ['Bite builder', 'tools/sharkops/new-bite.mjs'],
];
heading('🦈 SHARKOPS DOCTOR', 'SYSTEM SCAN');
let breached = false;
for (const [label, file] of checks) {
  if (exists(file)) pass(label); else { fail(`${label} (${file})`); breached = true; }
}
console.log();
if (breached) { console.error(ui.red('GATE BREACH DETECTED')); process.exit(1); }
console.log(ui.green('NO STRUCTURAL BREACH DETECTED'));
