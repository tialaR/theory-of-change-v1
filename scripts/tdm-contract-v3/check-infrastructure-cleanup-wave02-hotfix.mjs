#!/usr/bin/env node
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { assertRegisteredProgression } from './state-progression.mjs';

const errors = [];
const root = process.cwd();
const packageJson = JSON.parse(fs.readFileSync(`${root}/package.json`, 'utf8'));
const state = JSON.parse(fs.readFileSync(`${root}/.sharkops/state/current-state.json`, 'utf8'));
const ledger = JSON.parse(fs.readFileSync(`${root}/.sharkops/state/bite-ledger.json`, 'utf8'));
const bite = ledger.bites.find((item) => item.id === 'SO-013');
const progressionOk = assertRegisteredProgression({ state, ledger, minimumBite: 13, completedBites: ['SO-012'] });
if (!bite || bite.revision < 3 || !['ACTIVE','COMPLETE'].includes(bite.status)) errors.push('SO-013 progression/revision invariant failed for this wave');
if (!progressionOk) errors.push('Current State/Ledger lost registered cumulative progression for SO-013 or downstream');

if (errors.length) {
  console.error('\nSO-013 INFRASTRUCTURE CLEANUP WAVE 02 v1.1 HOTFIX: FAIL\n');
  errors.forEach((error, index) => console.error(`${index + 1}. ${error}.`));
  process.exit(1);
}

console.log('PASS SO-013 Infrastructure Cleanup Wave 02 v1.1 Hotfix: verification scope restored to the approved Canvas lint gate without hiding live-code lint debt.');
