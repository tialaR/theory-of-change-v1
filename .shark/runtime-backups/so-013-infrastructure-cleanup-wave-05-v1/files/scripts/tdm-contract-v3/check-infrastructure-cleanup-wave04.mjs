#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

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
if (!bite || bite.status !== 'ACTIVE' || bite.revision < 5) {
  errors.push('SO-013 Wave 04 nao esta ACTIVE/revision >= 5 no Bite Ledger');
}
if (!String(state.lastBite || '').startsWith('SO-013 | Infrastructure Cleanup Wave 04')) {
  errors.push('Current State nao registra a Wave 04 do SO-013');
}
if (state.activeBite !== 'SO-013 | Infrastructure Cleanup' || state.activeBiteStatus !== 'ACTIVE') {
  errors.push('Current State nao registra SO-013 Infrastructure Cleanup como ACTIVE');
}

if (errors.length) {
  console.error('\nSO-013 INFRASTRUCTURE CLEANUP WAVE 04: FAIL\n');
  errors.forEach((error, index) => console.error(`${index + 1}. ${error}.`));
  process.exit(1);
}

console.log('PASS SO-013 Infrastructure Cleanup Wave 04: duplicate ResultExperienceData contract alias removed, consumers use canonical ResultExperienceProps, and predecessor gates remain green.');
