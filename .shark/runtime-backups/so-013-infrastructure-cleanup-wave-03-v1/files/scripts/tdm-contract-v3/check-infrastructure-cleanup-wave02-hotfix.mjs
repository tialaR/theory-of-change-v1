#!/usr/bin/env node
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const errors = [];
const root = process.cwd();
const packageJson = JSON.parse(fs.readFileSync(`${root}/package.json`, 'utf8'));
const state = JSON.parse(fs.readFileSync(`${root}/.sharkops/state/current-state.json`, 'utf8'));
const ledger = JSON.parse(fs.readFileSync(`${root}/.sharkops/state/bite-ledger.json`, 'utf8'));
const bite = ledger.bites.find((item) => item.id === 'SO-013');

if (packageJson.scripts?.['lint:canvas'] !== 'eslint src/app/canvas src/features/theory-of-change/canvas') {
  errors.push('lint:canvas deixou de preservar o escopo de lint aprovado para os gates Shark Attack');
}

const wave02 = spawnSync(process.execPath, ['scripts/tdm-contract-v3/check-infrastructure-cleanup-wave02.mjs'], {
  cwd: root,
  encoding: 'utf8',
});
if (wave02.status !== 0) {
  process.stdout.write(wave02.stdout || '');
  process.stderr.write(wave02.stderr || '');
  errors.push('gate anterior falhou: SO-013 Infrastructure Cleanup Wave 02');
}

if (!bite || bite.status !== 'ACTIVE' || bite.revision < 3) {
  errors.push('SO-013 hotfix da Wave 02 nao esta ACTIVE/revision >= 3 no Bite Ledger');
}
if (!String(state.lastBite || '').startsWith('SO-013 | Infrastructure Cleanup Wave 02 v1.1')) {
  errors.push('Current State nao registra o hotfix v1.1 da Wave 02');
}
if (state.activeBite !== 'SO-013 | Infrastructure Cleanup' || state.activeBiteStatus !== 'ACTIVE') {
  errors.push('Current State nao registra SO-013 Infrastructure Cleanup como ACTIVE');
}

if (errors.length) {
  console.error('\nSO-013 INFRASTRUCTURE CLEANUP WAVE 02 v1.1 HOTFIX: FAIL\n');
  errors.forEach((error, index) => console.error(`${index + 1}. ${error}.`));
  process.exit(1);
}

console.log('PASS SO-013 Infrastructure Cleanup Wave 02 v1.1 Hotfix: verification scope restored to the approved Canvas lint gate without hiding live-code lint debt.');
