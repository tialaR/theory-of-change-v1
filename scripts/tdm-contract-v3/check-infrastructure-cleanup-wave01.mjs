#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { assertRegisteredProgression } from './state-progression.mjs';

const root = process.cwd();
const errors = [];
const removedFiles = [
  'src/features/theory-of-change/utils/get-next-stage-message.ts',
  'src/features/theory-of-change/utils/get-node-metadata.ts',
];
const forbiddenSymbols = ['getNextStageMessage', 'getNodeMetadata'];

for (const relative of removedFiles) {
  if (fs.existsSync(path.join(root, relative))) {
    errors.push(`helper orfao reapareceu: ${relative}`);
  }
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(absolute);
    return /\.(ts|tsx|js|mjs|cjs)$/.test(entry.name) ? [absolute] : [];
  });
}

for (const scanRoot of ['src', 'scripts', 'tools']) {
  for (const file of walk(path.join(root, scanRoot))) {
    const relative = path.relative(root, file);
    if (relative.endsWith('check-infrastructure-cleanup-wave01.mjs')) continue;
    const source = fs.readFileSync(file, 'utf8');
    for (const symbol of forbiddenSymbols) {
      if (source.includes(symbol)) errors.push(`referencia residual a ${symbol}: ${relative}`);
    }
  }
}

const previousGate = spawnSync(process.execPath, ['scripts/tdm-contract-v3/check-canvas-engine-closeout.mjs'], {
  cwd: root,
  encoding: 'utf8',
});
if (previousGate.status !== 0) {
  process.stdout.write(previousGate.stdout || '');
  process.stderr.write(previousGate.stderr || '');
  errors.push('gate anterior falhou: SO-012 Canvas Engine Closeout');
}

const state = JSON.parse(fs.readFileSync(path.join(root, '.sharkops/state/current-state.json'), 'utf8'));
const ledger = JSON.parse(fs.readFileSync(path.join(root, '.sharkops/state/bite-ledger.json'), 'utf8'));
const bite = ledger.bites.find((item) => item.id === 'SO-013');
const progressionOk = assertRegisteredProgression({ state, ledger, minimumBite: 13, completedBites: ['SO-012'] });
if (!bite || bite.revision < 1 || !['ACTIVE','COMPLETE'].includes(bite.status)) errors.push('SO-013 progression/revision invariant failed for this wave');
if (!progressionOk) errors.push('Current State/Ledger lost registered cumulative progression for SO-013 or downstream');

if (errors.length) {
  console.error('\nSO-013 INFRASTRUCTURE CLEANUP WAVE 01: FAIL\n');
  errors.forEach((error, index) => console.error(`${index + 1}. ${error}.`));
  process.exit(1);
}

console.log('PASS SO-013 Infrastructure Cleanup Wave 01: two proven orphan helpers removed, no live references remain, and SO-012 closeout still passes.');
