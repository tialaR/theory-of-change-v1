#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { assertRegisteredProgression } from './state-progression.mjs';

const root = process.cwd();
const errors = [];
const gates = [
  'scripts/tdm-contract-v3/check-application-slayer-closeout.mjs',
  'scripts/tdm-contract-v3/check-react-flow-isolation-closeout.mjs',
  'scripts/tdm-contract-v3/check-canvas-engine-wave01.mjs',
];

for (const gate of gates) {
  if (!fs.existsSync(path.join(root, gate))) {
    errors.push(`gate ausente: ${gate}`);
    continue;
  }
  const result = spawnSync(process.execPath, [gate], { cwd: root, encoding: 'utf8' });
  if (result.status !== 0) {
    process.stdout.write(result.stdout || '');
    process.stderr.write(result.stderr || '');
    errors.push(`gate falhou: ${gate}`);
  }
}

const helper = 'scripts/tdm-contract-v3/state-progression.mjs';
if (!fs.existsSync(path.join(root, helper))) errors.push(`helper ausente: ${helper}`);

const state = JSON.parse(fs.readFileSync(path.join(root, '.sharkops/state/current-state.json'), 'utf8'));
const ledger = JSON.parse(fs.readFileSync(path.join(root, '.sharkops/state/bite-ledger.json'), 'utf8'));
if (!assertRegisteredProgression({ state, ledger, minimumBite: 12, completedBites: ['SO-010', 'SO-011'] })) {
  errors.push('Current State nao representa uma progressao SO-012 registrada e consistente com o Bite Ledger');
}

for (const gate of gates.slice(0, 2)) {
  const source = fs.readFileSync(path.join(root, gate), 'utf8');
  if (!source.includes("from './state-progression.mjs'")) errors.push(`${gate} nao usa o validador de progressao registrado`);
  if (!source.includes('assertRegisteredProgression')) errors.push(`${gate} voltou a validar snapshot fixo de Current State`);
}

if (errors.length) {
  console.error('\nSO-012 LEGACY CLOSEOUT PROGRESSION HOTFIX: FAIL\n');
  errors.forEach((error, index) => console.error(`${index + 1}. ${error}.`));
  process.exit(1);
}

console.log('PASS SO-012 Legacy Closeout Progression Hotfix: SO-010 and SO-011 closeouts accept registered downstream progression through the Bite Ledger while SO-012 Wave 01 remains protected.');
