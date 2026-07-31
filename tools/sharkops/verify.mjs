import fs from 'node:fs';
import path from 'node:path';
import { exists, readJson } from './core/io.mjs';
import { heading, pass, fail, ui } from './core/ui.mjs';

heading('🦈 SHARKOPS VERIFY', 'BITE INSPECTION');

const required = [
  '.sharkops/project.json',
  '.sharkops/state/current-state.json',
  '.sharkops/state/bite-ledger.json',
  'tools/sharkops/status.mjs',
  'docs/sharkops/HANDOFF.md',
];

let breached = false;

for (const file of required) {
  if (exists(file)) {
    pass(file);
  } else {
    fail(file);
    breached = true;
  }
}

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

for (const script of [
  'shark',
  'shark:status',
  'shark:doctor',
  'shark:verify',
  'shark:new',
]) {
  if (pkg.scripts?.[script]) {
    pass(`script ${script}`);
  } else {
    fail(`scrt ${script}`);
    breached = true;
  }
}

const state = readJson('.sharkops/state/current-state.json');
const ledger = readJson('.sharkops/state/bite-ledger.json');
const bites = Array.isArray(ledger.bites) ? ledger.bites : [];

if (state.activeBite) {
  const [activeId] = state.activeBite.split('|').map((part) => part.trim());
  const ledgerBite = bites.find((bite) => bite.id === activeId);

  if (!ledgerBite) {
    fail(`active bite ${activeId} missing from ledger`);
    breached = true;
  } else {
    pass(`active bite ${activeId} registered in ledger`);

    const manifestPath = path.join(ledgerBite.path, 'MANIFEST.json');

    if (!fs.existsSync(manifestPath)) {
      fail(`manifest missing for ${activeId}`);
      breached = true;
    } else {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

      const consistent =
        manifest.id === ledgerBite.id &&
        manifest.codename === ledgerBite.codename &&
        manifest.status === ledgerBite.status &&
        state.activeBiteStatus === ledgerBite.status;

      if (consistent) {
        pass(`bite consistency ${activeId}`);
      } else {
        fail(`bite state out of sync: ${activeId}`);
        breached = true;
      }
    }
  }
} else if (bites.length > 0) {
  fail('ledger contains bites but current state has no active bite');
  breached = true;
} else {
  pass('no active bite');
}

console.log();

if (breached) {
  console.error(ui.red('VERDICT: UNSAFE'));
  process.exit(1);
}

console.log(ui.green('VERDICT: NO REGRESSION DETECTED'));
