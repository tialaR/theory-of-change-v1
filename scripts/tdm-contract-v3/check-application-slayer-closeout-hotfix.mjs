#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { assertRegisteredProgression } from './state-progression.mjs';

const root = process.cwd();
const applicationGate = 'scripts/tdm-contract-v3/check-application-slayer-closeout.mjs';
const reactFlowGate = 'scripts/tdm-contract-v3/check-react-flow-isolation-closeout.mjs';
const errors = [];

for (const gate of [applicationGate, reactFlowGate]) {
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

const applicationSource = fs.readFileSync(path.join(root, applicationGate), 'utf8');
if (!applicationSource.includes("from './state-progression.mjs'")) {
  errors.push('SO-010 closeout nao usa o validador de progressao registrado');
}

const reactFlowSource = fs.readFileSync(path.join(root, reactFlowGate), 'utf8');
if (!reactFlowSource.includes("from './state-progression.mjs'")) {
  errors.push('SO-011 closeout nao usa o validador de progressao registrado');
}

const state = JSON.parse(fs.readFileSync(path.join(root, '.sharkops/state/current-state.json'), 'utf8'));
const ledger = JSON.parse(fs.readFileSync(path.join(root, '.sharkops/state/bite-ledger.json'), 'utf8'));
if (!assertRegisteredProgression({
  state,
  ledger,
  minimumBite: 12,
  completedBites: ['SO-010', 'SO-011'],
})) {
  errors.push('Current State nao preserva uma progressao downstream registrada apos os closeouts SO-010 e SO-011');
}

if (errors.length) {
  console.error('\nSO-011 CLOSEOUT COMPATIBILITY HOTFIX: FAIL\n');
  errors.forEach((error, index) => console.error(`${index + 1}. ${error}.`));
  process.exit(1);
}

console.log('PASS SO-011 Closeout Compatibility Hotfix: completed SO-010 and SO-011 closeouts accept registered downstream progression through the Bite Ledger.');
