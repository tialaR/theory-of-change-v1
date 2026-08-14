#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

const steps = [
  { group: "architecture", script: "check:tdm:application-infrastructure-runtime:closeout" },
  { group: "architecture", script: "check:tdm:golden-state" },
  { group: "static", script: "typecheck" },
  { group: "lint", script: "lint:auth" },
  { group: "lint", script: "lint:canvas" },
  { group: "tests", script: "test:unit" },
  { group: "boundaries", script: "check:tdm:auth-rsc-boundary" },
  { group: "build", script: "build" },
  { group: "sharkops", script: "shark:verify" },
];

for (const step of steps) {
  console.log(`\n[APP-WIDE] ${step.group} :: npm run ${step.script}`);
  const result = spawnSync('npm', ['run', step.script], {
    stdio: 'inherit',
    shell: false
  });

  if (result.status !== 0) {
    console.error(`\nAPPLICATION-WIDE REGRESSION: FAIL at ${step.script}`);
    process.exit(result.status ?? 1);
  }
}

console.log('\nPASS SO-021 Application-Wide Regression Contract: all composed authoritative protections, RSC boundaries and production build are green.');
