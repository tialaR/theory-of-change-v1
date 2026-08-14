import { readJson } from './core/io.mjs';
import { heading, row, ui } from './core/ui.mjs';

const project = readJson('.sharkops/project.json');
const state = readJson('.sharkops/state/current-state.json');

heading('🦈 SHARKOPS STATUS', 'TARGET ACQUIRED');

row('Project:', project.productName || project.project);
row('Phase:', state.phase);

if (state.activeBite) {
  row('Active bite:', state.activeBite);
  row('Bite status:', state.activeBiteStatus || 'UNKNOWN');
}

row('Last bite:', state.lastBite);
row('Next bite:', state.nextBite);
row('Architecture:', state.architecture);
row('Knowledge:', state.knowledge);
row('Updated:', state.updatedAt);

const posture =
  state.activeBiteStatus === 'DRAFT'
    ? 'Attack posture: bite blocked until apply, verify and rollback pass.'
    : 'Attack posture: controlled. No silent deviation authorized.';

console.log(`\n${ui.muted(posture)}\n`);
