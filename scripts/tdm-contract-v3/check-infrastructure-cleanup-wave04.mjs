#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { assertRegisteredProgression } from './state-progression.mjs';

const root = process.cwd();
const errors = [];
const typesPath = 'src/features/theory-of-change/components/result-view/experience/types.ts';
const consumers = [
  'src/features/theory-of-change/components/result-view/experience/result-report-section.tsx',
  'src/features/theory-of-change/components/result-view/experience/result-interactive-preview.tsx',
];

const typesSource = fs.readFileSync(path.join(root, typesPath), 'utf8');
if (typesSource.includes('ResultExperienceData')) {
  errors.push('alias contratual duplicado ResultExperienceData reapareceu em experience/types.ts');
}
if (!typesSource.includes('export interface ResultExperienceProps')) {
  errors.push('contrato canonico ResultExperienceProps ausente');
}
if (!typesSource.includes('getStageNodes(data: ResultExperienceProps, stage: TdmStage)')) {
  errors.push('getStageNodes nao consome o contrato canonico ResultExperienceProps');
}

for (const relative of consumers) {
  const source = fs.readFileSync(path.join(root, relative), 'utf8');
  if (source.includes('ResultExperienceData')) {
    errors.push(`consumidor ainda usa alias duplicado ResultExperienceData: ${relative}`);
  }
  if (!source.includes('type ResultExperienceProps')) {
    errors.push(`consumidor nao importa o contrato canonico ResultExperienceProps: ${relative}`);
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
    if (relative.endsWith('check-infrastructure-cleanup-wave04.mjs')) continue;
    const source = fs.readFileSync(file, 'utf8');
    if (source.includes('ResultExperienceData')) {
      errors.push(`referencia residual ao alias contratual ResultExperienceData: ${relative}`);
    }
  }
}

const predecessor = spawnSync(process.execPath, ['scripts/tdm-contract-v3/check-infrastructure-cleanup-wave03.mjs'], {
  cwd: root,
  encoding: 'utf8',
});
if (predecessor.status !== 0) {
  process.stdout.write(predecessor.stdout || '');
  process.stderr.write(predecessor.stderr || '');
  errors.push('gate anterior falhou: SO-013 Infrastructure Cleanup Wave 03');
}

const state = JSON.parse(fs.readFileSync(path.join(root, '.sharkops/state/current-state.json'), 'utf8'));
const ledger = JSON.parse(fs.readFileSync(path.join(root, '.sharkops/state/bite-ledger.json'), 'utf8'));
const bite = ledger.bites.find((item) => item.id === 'SO-013');
const progressionOk = assertRegisteredProgression({ state, ledger, minimumBite: 13, completedBites: ['SO-012'] });
if (!bite || bite.revision < 5 || !['ACTIVE','COMPLETE'].includes(bite.status)) errors.push('SO-013 progression/revision invariant failed for this wave');
if (!progressionOk) errors.push('Current State/Ledger lost registered cumulative progression for SO-013 or downstream');

if (errors.length) {
  console.error('\nSO-013 INFRASTRUCTURE CLEANUP WAVE 04: FAIL\n');
  errors.forEach((error, index) => console.error(`${index + 1}. ${error}.`));
  process.exit(1);
}

console.log('PASS SO-013 Infrastructure Cleanup Wave 04: duplicate ResultExperienceData contract alias removed, consumers use canonical ResultExperienceProps, and predecessor gates remain green.');
